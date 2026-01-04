import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("❌ JWT_SECRET is not defined in environment variables!");
}
const secret = new TextEncoder().encode(JWT_SECRET);

export async function createToken(payload: { user_id: string; role: string }) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1d") // token หมดอายุ 1 วัน
    .sign(secret);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as { user_id: string; role: string };
  } catch (error) {
    return null;
  }
}
