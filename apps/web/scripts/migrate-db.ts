import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sourceUrl = process.env.OLD_DB_URL;
const targetUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

if (!sourceUrl) {
  console.error("Missing OLD_DB_URL in .env.local");
  process.exit(1);
}

if (!targetUrl) {
  console.error("Missing DATABASE_URL_UNPOOLED or DATABASE_URL in .env.local");
  process.exit(1);
}

const source = postgres(sourceUrl, { prepare: false, max: 1 });
const target = postgres(targetUrl, { prepare: false, max: 1 });

async function ensureSchema() {
  await target`
    do $$
    begin
      if not exists (select 1 from pg_type where typname = 'Role') then
        create type "Role" as enum ('USER', 'ADMIN');
      end if;
    end $$;
  `;

  await target`
    create table if not exists "User" (
      "id" text primary key,
      "email" text not null unique,
      "name" text,
      "image" text,
      "role" "Role" not null default 'USER',
      "createdAt" timestamptz not null default now(),
      "updatedAt" timestamptz not null default now()
    );
  `;

  await target`
    create table if not exists "QRCode" (
      "id" varchar(50) primary key,
      "redirectUrl" text not null,
      "base64" text not null,
      "routingUrl" text not null,
      "userId" text not null references "User"("id"),
      "logoUrl" text,
      "logoSize" integer,
      "archived" boolean not null default false,
      "createdAt" timestamptz not null default now(),
      "updatedAt" timestamptz not null default now()
    );
  `;

  await target`
    create table if not exists "Scan" (
      "id" text primary key,
      "qrCodeId" varchar(50) not null references "QRCode"("id") on delete cascade,
      "ip" text not null,
      "userAgent" text not null,
      "country" text,
      "city" text,
      "region" text,
      "timestamp" timestamptz not null default now(),
      "type" text,
      "referrer" text,
      "source" text,
      "medium" text,
      "device" text,
      "browser" text
    );
  `;

  await target`create index if not exists "QRCode_userId_idx" on "QRCode" ("userId");`;
  await target`create index if not exists "QRCode_archived_idx" on "QRCode" ("archived");`;
  await target`create index if not exists "Scan_qrCodeId_idx" on "Scan" ("qrCodeId");`;
}

async function migrateUsers() {
  const users = await source`select * from "User" order by "createdAt" asc`;
  if (users.length === 0) {
    console.log("No users found in source database.");
    return 0;
  }

  for (const user of users) {
    await target`
      insert into "User" ("id", "email", "name", "image", "role", "createdAt", "updatedAt")
      values (${user.id}, ${user.email}, ${user.name}, ${user.image}, ${user.role}, ${user.createdAt}, ${user.updatedAt})
      on conflict ("id") do update set
        "email" = excluded."email",
        "name" = excluded."name",
        "image" = excluded."image",
        "role" = excluded."role",
        "createdAt" = excluded."createdAt",
        "updatedAt" = excluded."updatedAt"
    `;
  }

  return users.length;
}

async function migrateQrCodes() {
  const qrCodes = await source`select * from "QRCode" order by "createdAt" asc`;
  if (qrCodes.length === 0) {
    console.log("No QR codes found in source database.");
    return 0;
  }

  for (const qrCode of qrCodes) {
    await target`
      insert into "QRCode" (
        "id", "redirectUrl", "base64", "routingUrl", "userId",
        "logoUrl", "logoSize", "archived", "createdAt", "updatedAt"
      )
      values (
        ${qrCode.id}, ${qrCode.redirectUrl}, ${qrCode.base64}, ${qrCode.routingUrl}, ${qrCode.userId},
        ${qrCode.logoUrl}, ${qrCode.logoSize}, ${qrCode.archived}, ${qrCode.createdAt}, ${qrCode.updatedAt}
      )
      on conflict ("id") do update set
        "redirectUrl" = excluded."redirectUrl",
        "base64" = excluded."base64",
        "routingUrl" = excluded."routingUrl",
        "userId" = excluded."userId",
        "logoUrl" = excluded."logoUrl",
        "logoSize" = excluded."logoSize",
        "archived" = excluded."archived",
        "createdAt" = excluded."createdAt",
        "updatedAt" = excluded."updatedAt"
    `;
  }

  return qrCodes.length;
}

async function migrateScans() {
  const scans = await source`select * from "Scan" order by "timestamp" asc`;
  if (scans.length === 0) {
    console.log("No scans found in source database.");
    return 0;
  }

  const batchSize = 100;
  for (let index = 0; index < scans.length; index += batchSize) {
    const batch = scans.slice(index, index + batchSize);
    await target`
      insert into "Scan" (
        "id", "qrCodeId", "ip", "userAgent", "country", "city", "region",
        "timestamp", "type", "referrer", "source", "medium", "device", "browser"
      )
      values ${target(batch.map((scan: any) => [
        scan.id,
        scan.qrCodeId,
        scan.ip,
        scan.userAgent,
        scan.country,
        scan.city,
        scan.region,
        scan.timestamp,
        scan.type,
        scan.referrer,
        scan.source,
        scan.medium,
        scan.device,
        scan.browser,
      ]))}
      on conflict ("id") do update set
        "qrCodeId" = excluded."qrCodeId",
        "ip" = excluded."ip",
        "userAgent" = excluded."userAgent",
        "country" = excluded."country",
        "city" = excluded."city",
        "region" = excluded."region",
        "timestamp" = excluded."timestamp",
        "type" = excluded."type",
        "referrer" = excluded."referrer",
        "source" = excluded."source",
        "medium" = excluded."medium",
        "device" = excluded."device",
        "browser" = excluded."browser"
    `;
    console.log(`Migrated scans: ${Math.min(index + batch.length, scans.length)}/${scans.length}`);
  }

  return scans.length;
}

async function main() {
  try {
    console.log("Ensuring target schema exists...");
    await ensureSchema();

    console.log("Migrating users...");
    const userCount = await migrateUsers();

    console.log("Migrating QR codes...");
    const qrCount = await migrateQrCodes();

    console.log("Migrating scans...");
    const scanCount = await migrateScans();

    console.log(
      JSON.stringify({
        success: true,
        migrated: {
          users: userCount,
          qrCodes: qrCount,
          scans: scanCount,
        },
      })
    );
  } catch (error) {
    console.error("Database migration failed:", error);
    process.exitCode = 1;
  } finally {
    await source.end();
    await target.end();
  }
}

main();
