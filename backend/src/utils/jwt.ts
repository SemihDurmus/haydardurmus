import crypto from "node:crypto";

// A tiny, dependency-free JWT (JSON Web Token) implementation — enough for a
// single-admin login. A JWT is three base64url parts joined by dots:
//   header.payload.signature
// The signature is an HMAC-SHA256 of "header.payload" using a server secret, so
// the token can't be forged or tampered with without knowing the secret.
//
// In a larger app you'd reach for a vetted library (jsonwebtoken, jose); rolling
// it here keeps the tutorial install-free and shows what the token actually is.

const ALG = "HS256";

interface JwtPayload {
  sub: string; // subject — the admin username
  role: string; // "admin"
  iat?: number; // issued-at (seconds)
  exp?: number; // expiry (seconds)
}

const b64url = (input: string): string =>
  Buffer.from(input).toString("base64url");

function hmac(data: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(data).digest("base64url");
}

/** Sign a payload into a JWT that expires `expiresInSec` from now. */
export function signToken(
  payload: Pick<JwtPayload, "sub" | "role">,
  secret: string,
  expiresInSec: number,
): string {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: ALG, typ: "JWT" }));
  const body = b64url(
    JSON.stringify({ ...payload, iat: now, exp: now + expiresInSec }),
  );
  const data = `${header}.${body}`;
  return `${data}.${hmac(data, secret)}`;
}

/**
 * Verify a token's signature and expiry, returning its payload. Throws on any
 * problem (malformed, bad signature, expired) — callers map that to a 401.
 */
export function verifyToken(token: string, secret: string): JwtPayload {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Malformed token");
  // Length is guaranteed 3 here; the cast satisfies noUncheckedIndexedAccess.
  const [header, body, signature] = parts as [string, string, string];

  const expected = hmac(`${header}.${body}`, secret);
  // Constant-time compare so an attacker can't probe the signature byte-by-byte.
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    throw new Error("Invalid signature");
  }

  const payload = JSON.parse(
    Buffer.from(body, "base64url").toString(),
  ) as JwtPayload;
  if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
    throw new Error("Token expired");
  }
  return payload;
}
