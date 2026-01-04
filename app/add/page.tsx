"use client";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Utensils,
  ShoppingBag,
  Car,
  Gift,
} from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
export default function Add() {
  const supabase = createClient();
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "",
  });
  const [category, setCategory] = useState<any[]>([]);

  async function fetchCategory() {
    try {
      const { data, error } = await supabase.from("category").select();

      if (error) {
        console.log(error);
        return;
      }
      if (data) {
        setCategory(data);
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchCategory();
  }, []);

  async function addExpense(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          amount: formData.amount,
          category: formData.category,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log(errorData.error);
        return;
      }

      router.push("/dashboard");
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="min-h-screen bg-pink-50 flex flex-col font-sans">
      <div className="p-6 pt-12 flex items-center">
        <button
          onClick={() => router.push("/dashboard")}
          className="p-2 bg-white rounded-2xl text-pink-500 shadow-sm mr-4"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-black text-pink-600">บันทึกรายจ่าย</h1>
      </div>

      <div className="flex-1 px-8 pt-4">
        <form onSubmit={addExpense} className="space-y-6">
          <div className="bg-white p-6 rounded-[40px] shadow-lg space-y-6 border border-pink-100">
            <div className="space-y-2">
              <label className="text-pink-400 text-sm font-medium ml-1">
                ชื่อรายการ
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="วันนี้ซื้ออะไรดีนะ?"
                className="w-full bg-pink-50 border-none rounded-2xl py-4 px-4 text-gray-700 outline-none focus:ring-2 focus:ring-pink-300"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-pink-400 text-sm font-medium ml-1">
                จำนวนเงิน (บาท)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-400 font-bold text-xl">
                  ฿
                </span>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  placeholder="0.00"
                  className="w-full bg-pink-50 border-none rounded-2xl py-4 pl-10 pr-4 text-2xl font-bold text-pink-600 outline-none focus:ring-2 focus:ring-pink-300"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-pink-400 text-sm font-medium ml-1">
                หมวดหมู่
              </label>
              <div className="grid grid-cols-2 gap-3">
                {category.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, category: item.cat })
                    }
                    className={`py-3 px-4 rounded-2xl text-sm font-medium flex items-center justify-center space-x-2 transition-all ${
                      formData.category === item.cat
                        ? "bg-pink-500 text-white shadow-md scale-[1.02]"
                        : "bg-pink-50 text-pink-400"
                    }`}
                  >
                    {item.cat === "food" && <Utensils size={16} />}
                    {item.cat === "shopping" && <ShoppingBag size={16} />}
                    {item.cat === "transport" && <Car size={16} />}
                    {item.cat === "other" && <Gift size={16} />}
                    <span>
                      {item.cat === "food"
                        ? "อาหาร"
                        : item.cat === "shopping"
                        ? "ช้อปปิ้ง"
                        : item.cat === "transport"
                        ? "เดินทาง"
                        : "อื่นๆ"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-5 rounded-3xl shadow-xl transition-all active:scale-95 flex items-center justify-center space-x-2 mt-4"
          >
            <Check size={24} />
            <span>บันทึกรายการ</span>
          </button>
        </form>
      </div>
    </div>
  );
}
