import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

// GET - ดึงรายการ expenses ของ user
export async function GET() {
  const supabase = await createClient();
  try {
    const authUser = await requireAuth();

    const { data, error } = await supabase
      .from("expenses")
      .select()
      .eq("user_id", authUser.user_id)
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
    const authUser = await requireAuth();

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, amount, category } = await request.json();
    const { data, error } = await supabase
      .from("expenses")
      .insert({ title, amount, category, user_id: authUser.user_id })
      .select()
      .single();

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
