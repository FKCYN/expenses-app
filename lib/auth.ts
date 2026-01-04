import { cookies } from "next/headers";
import { verifyToken } from "./jwt";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) return null;

  const payload = await verifyToken(token);
  return payload;
}

export async function requireAuth() {
  const user_id = await getCurrentUser();
  if (!user_id) {
    throw new Error("Unauthorized auth");
  }
  return user_id;
}
