import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import bcrypt from "bcryptjs";
import { createToken } from "@/lib/jwt";
export async function POST(request: Request) {
  const supabase = await createClient();
  try {
    const { user_id, password } = await request.json();
    if (!user_id || !password) {
      return NextResponse.json(
        { error: "กรุณากรอก user_id และ password" },
        { status: 400 }
      );
    }
    const { data, error } = await supabase
      .from("user")
      .select("*")
      .eq("user_id", user_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (!data || data.length === 0) {
      return NextResponse.json({ error: "ไม่พบผู้ใช้งานนี้" }, { status: 404 });
    }
    const match = await bcrypt.compare(password, data[0].password);
    if (!match) {
      return NextResponse.json(
        { error: "รหัสผ่านไม่ถูกต้อง" },
        { status: 401 }
      );
    }

    const token = await createToken({
      user_id: data[0].user_id,
      role: data[0].role,
    });

    // ส่งกลับไปเป็น Cookie
    // (await cookies()).set("auth_token", token, {
    //   httpOnly: true, // ป้องกัน JavaScript อ่าน (กัน XSS)
    //   secure: process.env.NODE_ENV === "production", // ส่งผ่าน HTTPS เท่านั้นใน production
    //   sameSite: "strict", // ป้องกันการโจมตีแบบ CSRF
    //   path: "/", // ใช้ได้ทั้งเว็บไซต์
    //   maxAge: 60 * 60 * 24, // 1 วัน
    // });
    const cookieStore = await cookies();
    cookieStore.set("auth-token", token, {
      httpOnly: true, // ป้องกัน JavaScript access
      secure: true, // ปิดไว้ก่อนสำหรับ local testing (เปิดเป็น true ตอน deploy HTTPS จริง)
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return NextResponse.json({ message: "เข้าสู่ระบบสำเร็จ" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
