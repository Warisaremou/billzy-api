import { hash } from "bcrypt";

export async function generateHash(value: string): Promise<string> {
  return hash(value, 10);
}

export function generateOTP(length?: number): string {
  length = length || 6;
  let result = "";
  const characters = "0123456789";

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export function generateUrlToken(): string {
  const array = new Uint8Array(96);
  crypto.getRandomValues(array);

  return Buffer.from(array).toString("base64url");
}

export function generateTokenId(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);

  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
