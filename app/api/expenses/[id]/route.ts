import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

// GET - ดึงรายการ expense ตาม id
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  try {
    const authUser = await requireAuth();
    const { id } = await params;

    const { data, error } = await supabase
      .from("expenses")
      .select()
      .eq("id", id)
      .eq("user_id", authUser.user_id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data) {
      return NextResponse.json({ error: "ไม่พบรายการ" }, { status: 404 });
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

// PUT - อัพเดทรายการ expense
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  try {
    const authUser = await requireAuth();
    const { id } = await params;

    const { title, amount, category } = await request.json();

    // ตรวจสอบว่า expense นี้เป็นของ user หรือไม่
    const { data: existingExpense, error: checkError } = await supabase
      .from("expenses")
      .select()
      .eq("id", id)
      .eq("user_id", authUser.user_id)
      .single();

    if (checkError || !existingExpense) {
      return NextResponse.json(
        { error: "ไม่พบรายการหรือไม่มีสิทธิ์แก้ไข" },
        { status: 404 }
      );
    }

    const { data, error } = await supabase
      .from("expenses")
      .update({ title, amount, category })
      .eq("id", id)
      .eq("user_id", authUser.user_id)
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

// DELETE - ลบรายการ expense
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  try {
    const authUser = await requireAuth();
    const { id } = await params;

    // ตรวจสอบว่า expense นี้เป็นของ user หรือไม่
    const { data: existingExpense, error: checkError } = await supabase
      .from("expenses")
      .select()
      .eq("id", id)
      .eq("user_id", authUser.user_id)
      .single();

    if (checkError || !existingExpense) {
      return NextResponse.json(
        { error: "ไม่พบรายการหรือไม่มีสิทธิ์ลบ" },
        { status: 404 }
      );
    }

    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", id)
      .eq("user_id", authUser.user_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: "ลบรายการสำเร็จ" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
