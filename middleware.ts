// middleware.ts
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

// กำหนด protected routes ที่ต้อง login ก่อนถึงจะเข้าได้
const protectedRoutes = ["/dashboard", "/add", "/history", "/edit"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token");
  const pathname = request.nextUrl.pathname;

  // เช็คว่าเป็น protected route หรือเปล่า
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // ถ้าพยายามเข้า protected routes แต่ไม่มี token
  if (isProtectedRoute && !token) {
    // ส่งกลับไปหน้า login พร้อมแนบ query string ไปบอกว่า "กรุณาเข้าระบบก่อน"
    return NextResponse.redirect(
      new URL("/?message=unauthorized", request.url)
    );
  }

  // ถ้า user login แล้ว (มี token) แต่พยายามเข้าหน้า login (root path /)
  // ให้ redirect ไปหน้า dashboard เลย
  if (pathname === "/" && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}
