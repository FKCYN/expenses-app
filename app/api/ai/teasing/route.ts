import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { title, amount, category } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("GEMINI_API_KEY is not set");
      return NextResponse.json({ comment: null }, { status: 200 });
    }

    // สร้าง prompt สำหรับ AI ให้แซวผู้ใช้
    const categoryNamesTh: { [key: string]: string } = {
      food: "อาหาร",
      shopping: "ช้อปปิ้ง",
      transport: "เดินทาง",
      other: "อื่นๆ",
    };

    const categoryTh = categoryNamesTh[category] || category;

    const prompt = `คุณเป็น AI น่ารัก ขี้เล่น และชอบแซวเจ้าของแบบเพื่อนสนิท (ตอบเป็นภาษาไทย ใช้ emoji ได้)

มีการบันทึกรายจ่ายใหม่:
- รายการ: "${title}"
- จำนวนเงิน: ${amount} บาท
- หมวดหมู่: ${categoryTh}

ให้คอมเมนต์แซว/ชื่นชม (แล้วแต่สถานการณ์) สั้นๆ 1-2 ประโยค:
- ถ้าเป็นอาหารหวานหรือน้ำหวาน เช่น ชานม, ชาไข่มุก, กาแฟ, ขนม ให้แซวเรื่องสุขภาพแบบน่ารัก
- ถ้าราคาแพง (มากกว่า 500 บาท) ให้แซวเรื่องการใช้เงิน
- ถ้าเป็นของกินราคาปกติ ให้คอมเมนต์น่ารักๆ
- ถ้าเป็นค่าเดินทาง ให้ถามว่าไปไหนมา
- ถ้าเป็นช้อปปิ้ง ให้แซวเรื่องมือลั่น

ตอบเฉพาะข้อความ ไม่ต้องมีคำนำหน้าอะไร`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 100,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error("Gemini API error:", await response.text());
      return NextResponse.json({ comment: null }, { status: 200 });
    }

    const data = await response.json();
    const comment =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;

    return NextResponse.json({ comment }, { status: 200 });
  } catch (error) {
    console.error("AI Teasing API Error:", error);
    return NextResponse.json({ comment: null }, { status: 200 });
  }
}
