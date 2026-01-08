"use client";
import React, { useState, useEffect, useMemo } from "react";
import { User, LogOut, Utensils, ShoppingBag, Car, Gift } from "lucide-react";
import NavBar from "../components/navBar";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

// สีสำหรับแต่ละ category
const COLORS: { [key: string]: string } = {
  food: "#f97316", // orange
  shopping: "#ec4899", // pink
  transport: "#3b82f6", // blue
  other: "#8b5cf6", // violet
};

// ชื่อภาษาไทยสำหรับแต่ละ category
const CATEGORY_NAMES: { [key: string]: string } = {
  food: "อาหาร",
  shopping: "ช้อปปิ้ง",
  transport: "เดินทาง",
  other: "อื่นๆ",
};

// Icon สำหรับแต่ละ category
function CategoryIcon({
  category,
  size = 16,
}: {
  category: string;
  size?: number;
}) {
  const iconProps = { size, className: "text-white" };
  switch (category) {
    case "food":
      return <Utensils {...iconProps} />;
    case "shopping":
      return <ShoppingBag {...iconProps} />;
    case "transport":
      return <Car {...iconProps} />;
    default:
      return <Gift {...iconProps} />;
  }
}

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

  // กรองเฉพาะรายการวันนี้
  const todayExpenses = useMemo(() => {
    const today = new Date();
    const todayStr = today.toLocaleDateString("th-TH");

    return expenses.filter((item) => {
      const itemDate = new Date(item.created_at);
      const itemDateStr = itemDate.toLocaleDateString("th-TH");
      return itemDateStr === todayStr;
    });
  }, [expenses]);

  // กรองเฉพาะรายการเดือนนี้
  const thisMonthExpenses = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    return expenses.filter((item) => {
      const itemDate = new Date(item.created_at);
      return (
        itemDate.getMonth() === currentMonth &&
        itemDate.getFullYear() === currentYear
      );
    });
  }, [expenses]);

  // ยอดรวมวันนี้
  const todayTotal = todayExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  // ยอดรวมเดือนนี้
  const monthTotal = thisMonthExpenses.reduce(
    (acc, curr) => acc + curr.amount,
    0
  );

  return (
    <div className="min-h-screen bg-pink-50 pb-32 font-sans">
      {/* Header */}
      <div className="bg-gradient-to-br from-pink-400 to-pink-500 p-6 pt-8 rounded-b-[50px] shadow-lg">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 text-white">
              <User size={20} />
            </div>
            <span className="text-white font-medium">
              สวัสดีจ้า! {user.name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>

        <div className="text-center text-white mb-2">วันนี้ใช้เงินไป</div>
        <div className="text-center text-4xl font-black text-white mb-4">
          ฿{todayTotal.toLocaleString()}
        </div>

        <div className=" p-4 flex justify-around">
          <div className="inline-flex items-center bg-pink-50 px-4 py-2 rounded-2xl border border-pink-100">
            <div className="w-2 h-2 rounded-full bg-pink-400 mr-2 animate-pulse"></div>
            <span className="text-gray-500 text-xs mr-2">ยอดรวมเดือนนี้</span>
            <span className="text-pink-500 font-bold text-sm">
              ฿{monthTotal.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
      {/* Content */}
      <div className="px-6 mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-pink-600 font-bold text-lg">รายการวันนี้</h2>
          <button
            onClick={() => router.push("/history")}
            className="text-pink-400 text-sm hover:underline"
          >
            ดูทั้งหมด
          </button>
        </div>

        <div className="space-y-4">
          {todayExpenses.length > 0 ? (
            todayExpenses.map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className="bg-white p-4 rounded-3xl shadow-sm flex items-center justify-between border border-pink-50 hover:shadow-md transition-shadow cursor-pointer active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      backgroundColor: COLORS[item.category] || COLORS.other,
                    }}
                  >
                    <CategoryIcon category={item.category} size={18} />
                  </div>
                  <div>
                    <div className="font-bold text-gray-700">{item.title}</div>
                    <div className="text-xs text-gray-400">
                      {CATEGORY_NAMES[item.category] || item.category} • เวลา{" "}
                      {formatTime(item.created_at)}
                    </div>
                  </div>
                </div>
                <div className="text-pink-600 font-bold">
                  ฿{item.amount.toLocaleString()}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-400 bg-white rounded-3xl">
              <div className="text-4xl mb-2">🎉</div>
              <p>วันนี้ยังไม่มีรายจ่าย</p>
            </div>
          )}
        </div>
      </div>
      <NavBar />
    </div>
  );
}
