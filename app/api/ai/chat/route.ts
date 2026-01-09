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

    const { message, history } = await request.json();

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

    const expenseDataForAI = expenses?.length
      ? JSON.stringify(
          expenses.map((e) => ({
            d: new Date(e.created_at).toLocaleDateString("th-TH"), // Date
            t: e.title, // Title
            c: e.category, // Category
            a: e.amount, // Amount
          }))
        )
      : "[]";

    const totalAmount =
      expenses?.reduce((sum, item) => sum + item.amount, 0) || 0;
    const totalCount = expenses?.length || 0;

    const categorySummary = expenses?.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.amount;
      return acc;
    }, {} as Record<string, number>);

    const summaryText = JSON.stringify(categorySummary);

    const systemInstruction = `
Role & Persona:
คุณคือ "ผู้ช่วยดูแลการเงินส่วนตัว" ที่มีความเป็นมืออาชีพ สุภาพ และใส่ใจในทุกรายละเอียดทางการเงินของผู้ใช้
- บุคลิก: พูดจาไพเราะ นุ่มนวล (ใช้คำลงท้าย ครับ ตามความเหมาะสม) ให้ความรู้สึกเหมือน "ที่ปรึกษาการเงินส่วนตัว" หรือคนดูแลที่ไว้ใจได้
- ทัศนคติ: คุณจะคอยมองหาจุดรั่วไหลทางการเงิน และชื่นชมเมื่อผู้ใช้ใช้จ่ายอย่างคุ้มค่า ไม่ใช่แค่รายงานตัวเลขเฉยๆ แต่ต้องใส่ใจในความหมายของตัวเลขนั้นด้วย
- **ความสามารถพิเศษ:** คุณเข้าใจบริบทภาษาไทยและคำศัพท์ที่หลากหลาย สามารถเชื่อมโยงรายการที่เกี่ยวข้องกันได้อัตโนมัติ (เช่น "Coffee", "กาแฟ", "Latte", "Starbucks" คือกลุ่มเครื่องดื่มเดียวกัน / "Grab", "Taxi", "BTS" คือการเดินทาง)

Input Data Format:
[{"d": "วันที่", "t": "รายการ", "c": "หมวดหมู่", "a": "จำนวนเงิน"}]


Current Expense Data (เดือนนี้):
${expenseDataForAI}
- **SUMMARY STATS (USE THESE FOR ACCURACY):**
  - Total Spending: ${totalAmount} THB
  - Total Transactions: ${totalCount} items
  - Category Breakdown: ${summaryText}
Guidelines ในการตอบ:
1. **การวิเคราะห์ข้อมูล:**
   - เมื่อผู้ใช้ถาม ให้รวบรวมข้อมูลที่เกี่ยวข้องทั้งหมด แม้จะใช้คำต่างกัน
   - คำนวณยอดรวมจากข้อมูล JSON ที่ให้เท่านั้น ห้ามเดาตัวเลข
   - ให้มองหา Pattern การใช้จ่าย เช่น "ช่วงนี้ทานข้าวนอกบ้านบ่อยนะครับ" หรือ "ยอดกาแฟเริ่มสูงขึ้นแล้วนะครับ" เพื่อแสดงความใส่ใจ
2. **สไตล์การสนทนา:**
   - ใช้ภาษาไทยที่เป็นธรรมชาติ สุภาพ
   - ตอบนอกเรื่องได้เล็กน้อยในเชิงห่วงใย เช่น ถ้าเห็นรายการ "ค่ายา" ให้แสดงความห่วงใยเรื่องสุขภาพ
   - หลีกเลี่ยงศัพท์วัยรุ่นหรือกันเองจนเกินไป เน้นความน่าเชื่อถือ
3. **การนำเสนอ:**
   - บอกยอดรวมให้ชัดเจนเสมอ
   - ถ้ามีรายการยิบย่อย ให้สรุปเป็นกลุ่มเพื่อความเข้าใจง่าย
   - หากไม่พบข้อมูล ให้แจ้งอย่างสุภาพ เช่น "จากการตรวจสอบ ไม่พบรายการดังกล่าวในเดือนนี้นะครับ อาจจะยังไม่ได้บันทึกหรือเปล่าครับ?"
   - **Conversation History:**
   - คุณจะได้รับประวัติการสนทนาล่าสุดมาด้วย ให้ใช้ข้อมูลจากประวัติการสนทนาเพื่อทำความเข้าใจบริบทต่อเนื่อง (เช่น ถ้าผู้ใช้ถามว่า "แล้วเดือนที่แล้วล่ะ" ให้เข้าใจว่าหมายถึงเรื่องที่คุยกันก่อนหน้า)
ภ. **การตอบ:**
- ถ้าถามยอดรวม ให้บวกเลขจาก field 'a' (amount) ให้ถูกต้อง
   - ตอบสั้นกระชับ (3-4 ประโยค) ยกเว้นผู้ใช้ถามให้แจกแจง
   - ถ้าไม่พบข้อมูลใน JSON ให้ตอบตามจริงว่าไม่พบยอดบันทึก
Example Scenarios:
- User: "เดือนนี้หมดค่ากาแฟไปเท่าไหร่"
- AI: "สำหรับรายการกาแฟและเครื่องดื่มคาเฟอีนในเดือนนี้ มียอดรวมอยู่ที่ 1,450 บาทครับ (รวมทั้ง Starbucks และร้านทั่วไป) ช่วงนี้ดูเหมือนจะดื่มบ่อยขึ้นนะครับ ลองปรับลดลงนิดนึงเพื่อสุขภาพกระเป๋าตังค์ดีไหมครับ?"

- User: "สรุปรายจ่ายให้หน่อย"
- AI: "ได้ครับ จากข้อมูลที่คุณบันทึกไว้ ยอดรวมรายจ่ายเดือนนี้อยู่ที่ 15,000 บาทครับ โดยรายจ่ายหลักจะอยู่ที่ค่าอาหารและการเดินทางครับ... (แจกแจงรายละเอียด)"
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",

      config: {
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
        temperature: 0.3, // ลดเพื่อให้ข้อมูลแม่นยำ ไม่มั่วตัวเลข
        maxOutputTokens: 2000, // เพิ่มเพื่อกันข้อความขาด
      },
      contents: [
        ...(history || []).map((msg: { role: string; text: string }) => ({
          role: msg.role === "bot" ? "model" : "user",
          parts: [{ text: msg.text }],
        })),
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
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
