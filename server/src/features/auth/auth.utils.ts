import { scryptSync, randomBytes, timingSafeEqual } from "crypto"

/**
 * hashPassword utility.
 * 
 * Purpose:
 * Transforms plain-text passwords into secure, salted hashes.
 * 
 * Flow details:
 * 1. Generates a random 16-byte salt to defend against rainbow-table attacks.
 * 2. Derives a 64-byte key using the scrypt key derivation function.
 * 3. Joins salt and hash separated by a colon (salt:hash) for single-column SQL storage.
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex")
  const hash = scryptSync(password, salt, 64).toString("hex")
  return `${salt}:${hash}`
}

/**
 * verifyPassword utility.
 * 
 * Purpose:
 * Validates a user-supplied login password against the stored database salt/hash string.
 * 
 * Flow details:
 * 1. Splits the stored value into salt and key buffers.
 * 2. Re-hashes the supplied password using the extracted salt.
 * 3. Compares both buffers using Node's timingSafeEqual, avoiding timing side-channel attacks.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(":")
  const hashedBuffer = scryptSync(password, salt, 64)
  const keyBuffer = Buffer.from(hash, "hex")
  return timingSafeEqual(hashedBuffer, keyBuffer)
}

