import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { user_id, password, name } = await request.json();
    const supabase = await createClient();

    const passwordHash = bcrypt.hashSync(password, 10);
    const { data, error } = await supabase
      .from("user")
      .insert({ user_id, password: passwordHash, name });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
