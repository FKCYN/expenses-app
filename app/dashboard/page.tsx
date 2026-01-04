"use client";
import React, { useState, useEffect } from "react";
import { User, LogOut } from "lucide-react";
import NavBar from "../components/navBar";

export default function Dashboard() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [userName, setUserName] = useState<string>("");

  async function fetchUser() {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setUserName(data.name);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function fetchExpenses() {
    try {
      const response = await fetch("/api/expenses");
      if (response.ok) {
        const data = await response.json();
        setExpenses(data.data);
      }
    } catch (error) {
      console.log(error);
    }
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
              สวัสดีจ้า! {userName}
            </span>
          </div>
          <button
            // onClick={() => setPage('login')}
            className="text-white/80 hover:text-white"
          >
            <LogOut size={20} />
          </button>
        </div>

        <div className="text-center text-white mb-2">
          ยอดรวมที่จ่ายไป (เดือนนี้)
        </div>
        <div className="text-center text-4xl font-black text-white mb-4">
          ฿{totalExpense.toLocaleString()}
        </div>

        <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-3xl p-4 flex justify-around">
          <div className="text-center">
            <div className="text-xs text-pink-100">เหลือในกระเป๋า</div>
            <div className="text-lg font-bold text-white">฿ 5,200</div>
          </div>
          <div className="w-px bg-white/30"></div>
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
              className="bg-white p-4 rounded-3xl shadow-sm flex items-center justify-between border border-pink-50 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-4">
                {/* <CategoryIcon category={item.category} /> */}
                <div>
                  <div className="font-bold text-gray-700">{item.title}</div>
                  <div className="text-xs text-gray-400">
                    {item.date} • {item.category}
                  </div>
                </div>
              </div>
              <div className="text-pink-600 font-bold">- ฿{item.amount}</div>
            </div>
          ))}
        </div>
      </div>

      <NavBar />
    </div>
  );
}
