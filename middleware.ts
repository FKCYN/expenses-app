// middleware.ts
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token");

  // ถ้าพยายามเข้าหน้าที่มีคำว่า /dashboard แต่ไม่มีบัตรผ่าน
  if (request.nextUrl.pathname.startsWith("/dashboard") && !token) {
    // ส่งกลับไปหน้า login พร้อมแนบ query string ไปบอกว่า "กรุณาเข้าระบบก่อน"
    return NextResponse.redirect(
      new URL("/?message=unauthorized", request.url)
    );
  }

  return NextResponse.next();
}
