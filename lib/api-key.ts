import argon2 from "argon2";
import { nanoid } from "nanoid";

const PREFIX = "sk_live_";

/** Generate a new API key. Returns plaintext (show once) and hash for storage. */
export async function generateApiKey(): Promise<{
  plaintext: string;
  hash: string;
  prefix: string;
}> {
  const token = nanoid(32);
  const plaintext = `${PREFIX}${token}`;
  const hash = await argon2.hash(plaintext, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });
  return { plaintext, hash, prefix: plaintext.slice(0, 12) };
}

/** Verify an API key against its stored hash. */
export async function verifyApiKey(
  plaintext: string,
  hash: string
): Promise<boolean> {
  try {
    return await argon2.verify(hash, plaintext);
  } catch {
    return false;
  }
}
