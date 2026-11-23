import { randomBytes } from "node:crypto";

export function generateId(length: number = 21): string {
  return randomBytes(Math.ceil(length * 0.75))
    .toString("base64url")
    .slice(0, length);
}

const BASE62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

function generateShortId(length: number = 6): string {
  let result = "";
  const timestamp = Date.now().toString(36);

  for (let i = 0; i < length - 2; i++) {
    result += BASE62.charAt(Math.floor(Math.random() * BASE62.length));
  }

  const pos1 = Math.floor(Math.random() * result.length);
  const pos2 = Math.floor(Math.random() * (result.length + 1));

  return (
    result.slice(0, pos1) +
    timestamp.slice(-2, -1) +
    result.slice(pos1, pos2) +
    timestamp.slice(-1) +
    result.slice(pos2)
  );
}

export async function generateUniqueShortId(
  exists: (id: string) => Promise<boolean>
): Promise<string> {
  let id: string;
  let alreadyExists: boolean;

  do {
    id = generateShortId();
    alreadyExists = await exists(id);
  } while (alreadyExists);

  return id;
}
