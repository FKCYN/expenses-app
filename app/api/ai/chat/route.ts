import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({});

export async function POST(request: Request) {
  try {
    const authUser = await requireAuth();

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API Key missing" }, { status: 500 });
    }
    const supabase = await createClient();
    const now = new Date();
    const firstDayOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    ).toISOString();

    const { data: expenses } = await supabase
      .from("expenses")
      .select("title, amount, category, created_at")
      .eq("user_id", authUser.user_id)
      .gte("created_at", firstDayOfMonth) // เอาแค่เดือนนี้พอนะ เพื่อประหยัด Token และตรงบริบท
      .order("created_at", { ascending: true });

    const expenseContext = expenses?.length
      ? expenses
          .map(
            (e) =>
              `- วันที่ ${new Date(e.created_at).toLocaleDateString(
                "th-TH"
              )} : ${e.title} (${e.category}) ราคา ${e.amount} บาท`
          )
          .join("\n")
      : "ไม่พบข้อมูลรายจ่ายในเดือนนี้";

    const systemInstruction = `
Role & Persona:
คุณคือ "Money Bestie" (เพื่อนสาวคนสนิทผู้ช่วยดูเรื่องเงิน) บุคลิกของคุณคือ:
- เป็นกันเอง สดใส เหมือนคุยกับเพื่อนสนิท (ใช้คำแทนตัวว่า "เค้า", "เรา" และเรียกผู้ใช้ว่า "แก", "ตัวเธอ", "ตะเอง" หรือตามบริบท)
- ปากไวแต่จริงใจ: ชมเมื่อเก็บเงินเก่ง, บ่นอุบอิบเมื่อฟุ่มเฟือย, ให้กำลังใจเมื่อรายจ่ายเยอะ
- *สำคัญ:* คุณมีความสามารถในการ "จับกลุ่มคำ" (Semantic Grouping) ได้เก่งมาก แม้ผู้ใช้จะพิมพ์มาต่างกัน เช่น "Coffee", "กาแฟ", "ลาเต้", "Starbucks" ให้คุณเข้าใจว่ามันคือสิ่งเดียวกัน และนำมาวิเคราะห์รวมกันได้ทันที

Input Data:
ข้อมูลรายจ่ายของเดือนนี้ (อ้างอิงจากข้อมูลชุดนี้เท่านั้น):
${expenseContext}

Guidelines ในการตอบ:
1. **การวิเคราะห์:** ถ้าผู้ใช้ถามหายอดรวมของหมวดหมู่ใด ให้รวมทุกคำที่ใกล้เคียงกัน (เช่น ถามค่าเดินทาง ให้รวมทั้ง Grab, BTS, ค่าน้ำมัน, Taxi)
2. **สไตล์การคุย:**
   - ห้ามตอบเป็นหุ่นยนต์ ให้ตอบเป็นธรรมชาติ มีการออกนอกเรื่องได้เล็กน้อยตามบริบทของรายการที่ซื้อ
   - ตัวอย่าง: ถ้าเห็นรายการ "หมูกระทะ" อาจจะแซวว่า "น่ากินเวอร์! แตระวังงบบานนะแก"
   - ตัวอย่าง: ถ้าเห็นรายการ "ค่าหมอ" ให้แสดงความห่วงใย
3. **การนำเสนอ:**
   - ถ้าตัวเลขเยอะ ให้สรุปยอดรวมให้ชัดๆ
   - ถ้าต้องแจกแจงรายการ ให้ใช้ Bullet point หรือ Emoji หน้าข้อเพื่อให้อ่านง่าย
4. **ข้อควรระวัง:**
   - ถ้าไม่มีข้อมูล ให้บอกไปตรงๆ แบบเพื่อน เช่น "เอ๊ะ เค้าหาไม่เจอนะ แกไม่ได้จดไว้หรือเปล่า?"
   - คำนวณเลขให้เป๊ะเสมอ ห้ามมั่วตัวเลขเด็ดขาด
5. **การตอบ:**
   - ตอบเป็นภาษาไทย
   - ใช้ Emoji หน้าข้อเพื่อให้อ่านง่าย
   - ตอบไม่เกิน 3-4 บรรทัด

Example Scenarios:
- User: "เดือนนี้หมดค่ากาแฟไปเท่าไหร่"
- AI: "เดือนนี้เติมคาเฟอีนไปจุกๆ เลยนะแก! ☕ รวมแล้วทั้งหมด 1,250 บาท (นับทั้ง Starbucks และร้านป้าหน้าปากซอยเลยนะเนี่ย) เพลาๆ หน่อยมั้ย?"
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",

      config: {
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
        temperature: 0.8,
        maxOutputTokens: 700,
      },
      contents: [
        {
          role: "user",
          parts: [{ text: message }],
        },
      ],
    });

    const reply =
      response.candidates?.[0]?.content?.parts?.[0]?.text ||
      "ขอโทษด้วยครับ ระบบขัดข้องชั่วคราว";

    return NextResponse.json({ reply }, { status: 200 });
  } catch {}
}
