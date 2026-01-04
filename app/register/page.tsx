"use client";
import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
export default function Login() {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const router = useRouter();

  // Handle Login
  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/auth/register", {
        user_id: user,
        password,
        name,
      });
      Swal.fire({
        icon: "success",
        title: "สมัครสมาชิกสำเร็จ",
      });
      router.push("/");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
      });
    }
  };

  return (
    <div className="min-h-screen bg-pink-50 flex flex-col items-center justify-center p-8 font-sans">
      <div className="bg-white p-8 rounded-[40px] shadow-xl w-full max-w-sm flex flex-col items-center">
        <div className="w-20 h-20 bg-pink-100 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
          <Heart size={40} className="text-pink-500 fill-pink-500" />
        </div>
        <h1 className="text-2xl font-bold text-pink-600 mb-2">
          My Sweet Wallet
        </h1>
        <p className="text-pink-400 text-sm mb-8">
          บันทึกรายจ่ายด้วยความรัก ❤️
        </p>

        <form onSubmit={handleRegister} className="w-full space-y-4">
          <div className="space-y-2">
            <label className="text-pink-500 text-sm font-medium ml-1">
              UserID
            </label>
            <input
              type="text"
              placeholder="UserID สำหรับเข้าสู่ระบบ"
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
          <div className="space-y-2">
            <label className="text-pink-500 text-sm font-medium ml-1">
              Name
            </label>
            <input
              type="text"
              placeholder="ชื่อของคุณ"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-pink-800 w-full bg-pink-50 border-none rounded-2xl py-3 px-4 focus:ring-2 focus:ring-pink-300 transition-all outline-none"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-95 mt-4"
          >
            สมัครสมาชิก
          </button>
        </form>
      </div>
    </div>
  );
}
