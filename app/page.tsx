"use client";
import React, { useState, useEffect, Suspense } from "react";
import { Heart } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import Swal from "sweetalert2";

// Component ที่ใช้ useSearchParams ต้องแยกออกมา
function LoginMessage() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  useEffect(() => {
    if (message === "unauthorized") {
      Swal.fire({
        icon: "warning",
        title: "กรุณาเข้าสู่ระบบ",
        text: "เซสชั่นของคุณหมดอายุหรือยังไม่ได้เข้าสู่ระบบ",
      });
    }
  }, [message]);

  return null;
}

export default function Login() {
  const router = useRouter();
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");

  // Handle Login
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/auth/login", {
        user_id: user,
        password,
      });
      console.log(response);
      Swal.fire({
        icon: "success",
        title: "เข้าสู่ระบบสำเร็จ",
        timer: 2000,
        showConfirmButton: false,
      }).then(() => {
        router.push("/dashboard");
      });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        Swal.fire({
          icon: "error",
          title: "เข้าสู่ระบบไม่สำเร็จ",
          text: error.response.data.error || "เกิดข้อผิดพลาด กรุณาลองใหม่",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-pink-50 flex flex-col items-center justify-center p-8 font-sans">
      {/* Wrap useSearchParams component with Suspense */}
      <Suspense fallback={null}>
        <LoginMessage />
      </Suspense>

      <div className="bg-white p-8 rounded-[40px] shadow-xl w-full max-w-sm flex flex-col items-center">
        <div className="w-20 h-20 bg-pink-100 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
          <Heart size={40} className="text-pink-500 fill-pink-500" />
        </div>
        <h1 className="text-2xl font-bold text-pink-600 mb-2">My Wallet</h1>

        <form onSubmit={handleLogin} className="w-full space-y-4">
          <div className="space-y-2">
            <label className="text-pink-500 text-sm font-medium ml-1">
              UserID
            </label>
            <input
              type="text"
              placeholder="UserID"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              className="text-pink-800 w-full bg-pink-50 border-none rounded-2xl py-3 px-4 focus:ring-2 focus:ring-pink-300 transition-all outline-none"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-pink-500 text-sm font-medium ml-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-pink-800 w-full bg-pink-50 border-none rounded-2xl py-3 px-4 focus:ring-2 focus:ring-pink-300 transition-all outline-none"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-95 mt-4"
          >
            เข้าสู่ระบบ
          </button>
        </form>
        <button
          onClick={() => router.push("/register")}
          className="text-pink-400 text-sm mt-6 hover:underline"
        >
          สร้างบัญชีใหม่
        </button>
      </div>
    </div>
  );
}
