import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import bcrypt from "bcryptjs";
export async function POST(request: Request) {
  const supabase = await createClient();
  try {
    const { user_id, password } = await request.json();

    const { data, error } = await supabase
      .from("user")
      .select("*")
      .eq("user_id", user_id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (!data) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const match = await bcrypt.compare(password, data[0].password);
    if (!match) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const secret = new TextEncoder().encode("user888");
    const token = await new SignJWT({ user_id, name: data[0].name })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1d") // บัตรผ่านหมดอายุใน 1 วัน
      .sign(secret);

    // ส่งกลับไปเป็น Cookie
    (await cookies()).set("auth_token", token, {
      httpOnly: true, // ป้องกัน JavaScript อ่าน (กัน XSS)
      secure: process.env.NODE_ENV === "production", // ส่งผ่าน HTTPS เท่านั้นใน production
      sameSite: "strict", // ป้องกันการโจมตีแบบ CSRF
      path: "/", // ใช้ได้ทั้งเว็บไซต์
      maxAge: 60 * 60 * 24, // 1 วัน
    });
    return NextResponse.json({ message: "Login successful" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
