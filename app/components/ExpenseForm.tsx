"use client";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Utensils,
  ShoppingBag,
  Car,
  Gift,
  Trash2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import axios from "axios";
import Swal from "sweetalert2";

// Type สำหรับ Expense data
export interface ExpenseData {
  id?: number;
  title: string;
  amount: string | number;
  category: string;
}

interface ExpenseFormProps {
  mode: "add" | "edit";
  initialData?: ExpenseData;
  expenseId?: number;
}

export default function ExpenseForm({
  mode,
  initialData,
  expenseId,
}: ExpenseFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    amount: initialData?.amount?.toString() || "",
    category: initialData?.category || "",
  });
  const [category, setCategory] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchCategory() {
      try {
        const supabase = createClient();
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
    fetchCategory();
  }, []);

  // อัพเดท formData เมื่อ initialData เปลี่ยน
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        amount: initialData.amount?.toString() || "",
        category: initialData.category || "",
      });
    }
  }, [initialData]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (mode === "add") {
        // สร้างรายการใหม่
        const response = await axios.post("/api/expenses", {
          title: formData.title,
          amount: formData.amount,
          category: formData.category,
        });
        const data = response.data.data;
        Swal.fire({
          icon: "success",
          title: `บันทึกรายการสำเร็จ ${data.title} - ฿${data.amount}`,
          timer: 3000,
          showConfirmButton: false,
        }).then(() => {
          router.push("/dashboard");
        });
      } else {
        // อัพเดทรายการที่มีอยู่
        const response = await axios.put(`/api/expenses/${expenseId}`, {
          title: formData.title,
          amount: formData.amount,
          category: formData.category,
        });
        const data = response.data.data;
        Swal.fire({
          icon: "success",
          title: `แก้ไขรายการสำเร็จ ${data.title} - ฿${data.amount}`,
          timer: 3000,
          showConfirmButton: false,
        }).then(() => {
          router.push("/dashboard");
        });
      }
    } catch (error) {
      console.log(error);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    const result = await Swal.fire({
      icon: "warning",
      title: "ยืนยันการลบ?",
      text: "คุณต้องการลบรายการนี้หรือไม่?",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/api/expenses/${expenseId}`);
        Swal.fire({
          icon: "success",
          title: "ลบรายการสำเร็จ",
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          router.push("/dashboard");
        });
      } catch (error) {
        console.log(error);
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: "ไม่สามารถลบข้อมูลได้ กรุณาลองใหม่อีกครั้ง",
        });
      }
    }
  }

  return (
    <div className="min-h-screen bg-pink-50 flex flex-col font-sans">
      <div className="p-6 pt-12 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => router.push("/dashboard")}
            className="p-2 bg-white rounded-2xl text-pink-500 shadow-sm mr-4"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-black text-pink-600">
            {mode === "add" ? "บันทึกรายจ่าย" : "แก้ไขรายจ่าย"}
          </h1>
        </div>
        {mode === "edit" && (
          <button
            onClick={handleDelete}
            className="p-2 bg-red-100 rounded-2xl text-red-500 shadow-sm hover:bg-red-200 transition-colors"
          >
            <Trash2 size={24} />
          </button>
        )}
      </div>

      <div className="flex-1 px-8 pt-4">
        <form onSubmit={handleSubmit} className="space-y-6">
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
            disabled={isSubmitting}
            className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white font-bold py-5 rounded-3xl shadow-xl transition-all active:scale-95 flex items-center justify-center space-x-2 mt-4"
          >
            <Check size={24} />
            <span>
              {isSubmitting
                ? "กำลังบันทึก..."
                : mode === "add"
                ? "บันทึกรายการ"
                : "บันทึกการแก้ไข"}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
