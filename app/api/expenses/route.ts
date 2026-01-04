import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

// ดึง user_id จาก JWT token
async function getUserIdFromToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return null;
  }

  const secret = new TextEncoder().encode("user888");
  const { payload } = await jwtVerify(token, secret);
  return payload.user_id as string;
}

// GET - ดึงรายการ expenses ของ user
export async function GET() {
  const supabase = await createClient();
  try {
    const user_id = await getUserIdFromToken();

    if (!user_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("expenses")
      .select()
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST - เพิ่มรายการ expense ใหม่
export async function POST(request: Request) {
  const supabase = await createClient();
  try {
    const user_id = await getUserIdFromToken();

    if (!user_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, amount, category } = await request.json();
    const { data, error } = await supabase
      .from("expenses")
      .insert({ title, amount, category, user_id });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
