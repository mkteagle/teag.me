import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { randomBytes } from "crypto";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(length: number = 21): string {
  return randomBytes(Math.ceil(length * 0.75))
    .toString("base64url")
    .slice(0, length);
}

const BASE62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function generateShortId(length: number = 6): string {
  let result = "";
  const timestamp = Date.now().toString(36); // Convert timestamp to base36

  // Add random characters
  for (let i = 0; i < length - 2; i++) {
    result += BASE62.charAt(Math.floor(Math.random() * BASE62.length));
  }

  // Add 2 characters from timestamp at random positions
  const pos1 = Math.floor(Math.random() * result.length);
  const pos2 = Math.floor(Math.random() * (result.length + 1));

  result =
    result.slice(0, pos1) +
    timestamp.slice(-2, -1) +
    result.slice(pos1, pos2) +
    timestamp.slice(-1) +
    result.slice(pos2);

  return result;
}

// Update the existing generateId function to use this for QR codes
export async function generateUniqueShortId(prisma: any): Promise<string> {
  let id: string;
  let exists: boolean;

  do {
    id = generateShortId();
    // Check if ID exists in database
    const existing = await prisma.qRCode.findUnique({
      where: { id },
    });
    exists = !!existing;
  } while (exists);

  return id;
}
