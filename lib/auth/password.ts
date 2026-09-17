// Password hashing with Node's built-in scrypt (no native dependencies).
// Stored format: "scrypt$<N>$<r>$<p>$<salt base64>$<hash base64>", so the
// cost parameters can be raised later without breaking existing hashes.
import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from "node:crypto";

const N = 2 ** 15;
const R = 8;
const P = 1;
const KEY_LENGTH = 64;

function deriveKey(password: string, salt: Buffer, options: ScryptOptions) {
  return new Promise<Buffer>((resolve, reject) => {
    // scrypt needs about 128 * N * r bytes; allow twice that.
    const maxmem = 256 * options.N! * options.r!;
    scrypt(password.normalize("NFKC"), salt, KEY_LENGTH, { ...options, maxmem }, (error, key) =>
      error ? reject(error) : resolve(key),
    );
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await deriveKey(password, salt, { N, r: R, p: P });
  return ["scrypt", N, R, P, salt.toString("base64"), key.toString("base64")].join("$");
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algorithm, n, r, p, salt, hash] = stored.split("$");
  if (algorithm !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64");
  const actual = await deriveKey(password, Buffer.from(salt, "base64"), {
    N: Number(n),
    r: Number(r),
    p: Number(p),
  });
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

// A valid hash of a random password, used to spend the same time on
// unknown emails as on real ones so response timing does not reveal
// whether an admin email exists.
let dummyHash: Promise<string> | undefined;
export function getDummyPasswordHash() {
  dummyHash ??= hashPassword(randomBytes(16).toString("hex"));
  return dummyHash;
}
