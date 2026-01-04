import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";

export async function GET() {
  try {
    const payload = await getCurrentUser();
    const supabase = createClient();
    if (!payload) {
      return NextResponse.json({ error: "ไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    const user_id = payload.user_id;

    // Get user details
    const { data } = await supabase
      .from("user")
      .select("user_id, name, role")
      .eq("user_id", user_id)
      .single();

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
