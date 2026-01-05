"use client";
import React, { useState, useEffect } from "react";
import { User, LogOut } from "lucide-react";
import NavBar from "../components/navBar";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [user, setUser] = useState<any>([]);
  const router = useRouter();

  async function fetchUser() {
    try {
      const response = await axios.get("/api/auth/me");
      const data = await response.data.data;
      setUser(data);
    } catch (error) {
      console.log(error);
    }
  }

  async function fetchExpenses() {
    try {
      const response = await axios.get("/api/expenses");
      const data = await response.data.data;
      setExpenses(data);
    } catch (error) {
      console.log(error);
    }
  }

  async function handleLogout() {
    try {
      const response = await axios.post("/api/auth/logout");
      const data = response.data;
      console.log(response);
      Swal.fire({
        icon: "success",
        title: `${data.message}`,
        timer: 2000,
        showConfirmButton: false,
      }).then(() => {
        router.push("/");
      });
      return;
    } catch (error) {
      console.log(error);
    }
  }

  async function handleItemClick(item: any) {
    const result = await Swal.fire({
      title: item.title,
      html: `<p class="text-gray-500">฿${item.amount}</p>`,
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: "✏️ แก้ไข",
      denyButtonText: "🗑️ ลบ",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#ec4899",
      denyButtonColor: "#ef4444",
    });

    if (result.isConfirmed) {
      // ไปหน้าแก้ไข
      router.push(`/edit/${item.id}`);
    } else if (result.isDenied) {
      // ยืนยันการลบ
      const confirmDelete = await Swal.fire({
        icon: "warning",
        title: "ยืนยันการลบ?",
        text: `ต้องการลบรายการ "${item.title}" หรือไม่?`,
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "ลบ",
        cancelButtonText: "ยกเลิก",
      });

      if (confirmDelete.isConfirmed) {
        try {
          await axios.delete(`/api/expenses/${item.id}`);
          Swal.fire({
            icon: "success",
            title: "ลบรายการสำเร็จ",
            timer: 2000,
            showConfirmButton: false,
          });
          // รีเฟรชข้อมูล
          fetchExpenses();
        } catch (error) {
          console.log(error);
          Swal.fire({
            icon: "error",
            title: "เกิดข้อผิดพลาด",
            text: "ไม่สามารถลบรายการได้",
          });
        }
      }
    }
  }

  // แปลง ISO timestamp เป็นวันที่ เช่น "4 ม.ค. 2026"
  function formatDate(isoString: string) {
    const date = new Date(isoString);
    return date.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  // แปลง ISO timestamp เป็นเวลา เช่น "00:11"
  function formatTime(isoString: string) {
    const date = new Date(isoString);
    return date.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  useEffect(() => {
    fetchUser();
    fetchExpenses();
  }, []);

  const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="min-h-screen bg-pink-50 pb-32 font-sans">
      {/* Header */}
      <div className="bg-gradient-to-br from-pink-400 to-pink-500 p-8 pt-12 rounded-b-[50px] shadow-lg">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 text-white">
              <User size={20} />
            </div>
            <span className="text-white font-medium">
              สวัสดีจ้า! {user.name}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="text-white/80 hover:text-white"
          >
            <LogOut size={20} />
          </button>
        </div>

        <div className="text-center text-white mb-2">ยอดรวมที่จ่ายไป</div>
        <div className="text-center text-4xl font-black text-white mb-4">
          ฿{totalExpense.toLocaleString()}
        </div>

        <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-3xl p-4 flex justify-around">
          <div className="text-center">
            <div className="text-xs text-pink-100">จำนวนรายการ</div>
            <div className="text-lg font-bold text-white">
              {expenses.length} ครั้ง
            </div>
          </div>
        </div>
      </div>
      {/* Content */}
      <div className="px-6 mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-pink-600 font-bold text-lg">รายการล่าสุด</h2>
          <button className="text-pink-400 text-sm">ดูทั้งหมด</button>
        </div>

        <div className="space-y-4">
          {expenses.map((item) => (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              className="bg-white p-4 rounded-3xl shadow-sm flex items-center justify-between border border-pink-50 hover:shadow-md transition-shadow cursor-pointer active:scale-[0.98]"
            >
              <div className="flex items-center space-x-4">
                {/* <CategoryIcon category={item.category} /> */}
                <div>
                  <div className="font-bold text-gray-700">{item.title}</div>
                  <div className="text-xs text-gray-400">
                    {item.category} • วันที่ {formatDate(item.created_at)} เวลา{" "}
                    {formatTime(item.created_at)}
                  </div>
                </div>
              </div>
              <div className="text-pink-600 font-bold"> ฿{item.amount}</div>
            </div>
          ))}
        </div>
      </div>
      <NavBar />
    </div>
  );
}
