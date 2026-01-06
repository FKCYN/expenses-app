"use client";
import React, { useState, useEffect, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import {
  Utensils,
  ShoppingBag,
  Car,
  Gift,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Wallet,
} from "lucide-react";
import NavBar from "@/app/components/navBar";
import axios from "axios";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

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
  size = 18,
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

interface CategoryData {
  name: string;
  value: number;
  percentage: number;
  category: string;
  [key: string]: string | number;
}

interface GroupedExpense {
  date: string;
  dailyTotal: number;
  items: any[];
}

export default function History() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [chartData, setChartData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const router = useRouter();

  useEffect(() => {
    async function fetchExpenses() {
      try {
        const response = await axios.get("/api/expenses");
        const data = response.data.data;
        setExpenses(data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
    fetchExpenses();
  }, []);

  // กรองรายการตามเดือนที่เลือก
  const filteredExpenses = useMemo(() => {
    const month = selectedMonth.getMonth();
    const year = selectedMonth.getFullYear();

    return expenses.filter((item) => {
      const itemDate = new Date(item.created_at);
      return itemDate.getMonth() === month && itemDate.getFullYear() === year;
    });
  }, [expenses, selectedMonth]);

  // จัดกลุ่มตามวัน
  const historyGrouped = useMemo(() => {
    const grouped: { [key: string]: GroupedExpense } = {};

    filteredExpenses.forEach((item) => {
      const date = new Date(item.created_at);
      const dateKey = date.toISOString().split("T")[0]; // YYYY-MM-DD

      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          date: dateKey,
          dailyTotal: 0,
          items: [],
        };
      }

      grouped[dateKey].dailyTotal += item.amount;
      grouped[dateKey].items.push(item);
    });

    // เรียงจากวันล่าสุดไปเก่าสุด
    return Object.values(grouped).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [filteredExpenses]);

  // คำนวณ chart data สำหรับเดือนที่เลือก
  useEffect(() => {
    const categoryTotals: { [key: string]: number } = {};
    let total = 0;

    filteredExpenses.forEach((item: any) => {
      const cat = item.category || "other";
      categoryTotals[cat] = (categoryTotals[cat] || 0) + item.amount;
      total += item.amount;
    });

    const chartDataArray: CategoryData[] = Object.entries(categoryTotals)
      .map(([category, value]) => ({
        name: CATEGORY_NAMES[category] || category,
        value: value,
        percentage: total > 0 ? Math.round((value / total) * 100) : 0,
        category: category,
      }))
      .sort((a, b) => b.value - a.value);

    setChartData(chartDataArray);
  }, [filteredExpenses]);

  // แปลงวันที่เป็นรูปแบบไทย "6 ม.ค. 2026"
  function formatDateThai(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  // เปลี่ยนเดือน
  function changeMonth(direction: number) {
    setSelectedMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
  }

  // คำนวณค่าเฉลี่ยต่อวัน
  const avgPerDay = useMemo(() => {
    if (historyGrouped.length === 0) return 0;
    const total = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);
    return Math.round(total / historyGrouped.length);
  }, [historyGrouped, filteredExpenses]);

  const totalExpense = filteredExpenses.reduce(
    (acc, curr) => acc + curr.amount,
    0
  );

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
      router.push(`/edit/${item.id}`);
    } else if (result.isDenied) {
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
          // รีเฟรชหน้า
          window.location.reload();
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

  if (loading) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <div className="text-pink-500 text-lg font-medium">กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-50 pb-32 font-sans flex flex-col">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-6 rounded-b-[32px] shadow-sm z-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">ประวัติรายจ่าย</h2>
          <div className="p-2 bg-pink-50 rounded-full text-pink-500">
            <Calendar size={20} />
          </div>
        </div>

        {/* Month Selector */}
        <div className="flex items-center justify-between bg-pink-50 p-1 rounded-2xl">
          <button
            onClick={() => changeMonth(-1)}
            className="p-2 text-pink-400 hover:bg-white hover:shadow-sm rounded-xl transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="font-bold text-pink-600 text-sm">
            {selectedMonth.toLocaleDateString("th-TH", {
              month: "long",
              year: "numeric",
            })}
          </div>
          <button
            onClick={() => changeMonth(1)}
            className="p-2 text-pink-400 hover:bg-white hover:shadow-sm rounded-xl transition-all"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Summary Cards */}
        <div className="mt-6 flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          <div className="bg-pink-500 text-white p-4 rounded-2xl min-w-[120px] shadow-pink-200 shadow-lg flex-shrink-0">
            <div className="text-xs opacity-80 mb-1">รายจ่ายทั้งหมด</div>
            <div className="text-2xl font-bold">
              ฿{totalExpense.toLocaleString()}
            </div>
          </div>
          {chartData.map((item) => (
            <div
              key={item.category}
              className="p-4 rounded-2xl min-w-[120px] flex-shrink-0 flex flex-col justify-between"
              style={{
                backgroundColor: COLORS[item.category] || COLORS.other,
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <CategoryIcon category={item.category} size={14} />
                <span className="text-xs text-white/80">{item.name}</span>
              </div>
              <div className="text-lg font-bold text-white">
                ฿{item.value.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pie Chart Section */}
      {chartData.length > 0 && (
        <div className="px-6 mt-4">
          <div className="bg-white rounded-3xl shadow-sm p-4 border border-pink-50">
            <h3 className="text-pink-600 font-bold text-sm mb-2 text-center">
              สัดส่วนค่าใช้จ่าย
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={45}
                    paddingAngle={3}
                    dataKey="value"
                    label={({
                      percent = 0,
                      cx,
                      cy,
                      midAngle = 0,
                      outerRadius,
                    }) => {
                      const RADIAN = Math.PI / 180;
                      const radius = (outerRadius || 45) * 1.3;
                      const x =
                        (cx || 0) + radius * Math.cos(-midAngle * RADIAN);
                      const y =
                        (cy || 0) + radius * Math.sin(-midAngle * RADIAN);
                      return (
                        <text
                          x={x}
                          y={y}
                          fill="#666"
                          textAnchor={x > (cx || 0) ? "start" : "end"}
                          dominantBaseline="central"
                          fontSize={10}
                        >
                          {`${Math.round(percent * 100)}%`}
                        </text>
                      );
                    }}
                    labelLine={false}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[entry.category] || COLORS.other}
                      />
                    ))}
                  </Pie>
                  <Legend
                    formatter={(value) => (
                      <span className="text-gray-600 text-xs">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Expense List Grouped by Date */}
      <div className="flex-1 overflow-y-auto px-6 pt-6">
        {historyGrouped.length > 0 ? (
          historyGrouped.map((group) => (
            <div key={group.date} className="mb-6">
              <div className="flex items-center justify-between mb-3 px-2">
                <span className="text-sm font-bold text-gray-500 bg-pink-100/50 px-3 py-1 rounded-lg">
                  {formatDateThai(group.date)}
                </span>
                <span className="text-xs font-bold text-gray-400">
                  รวม ฿{group.dailyTotal.toLocaleString()}
                </span>
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-pink-50/50 overflow-hidden">
                {group.items.map((item, index) => (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={`p-4 flex items-center justify-between cursor-pointer hover:bg-pink-50/50 transition-colors active:scale-[0.99] ${
                      index !== group.items.length - 1
                        ? "border-b border-gray-50"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{
                          backgroundColor:
                            COLORS[item.category] || COLORS.other,
                        }}
                      >
                        <CategoryIcon category={item.category} size={16} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-700">
                          {item.title}
                        </div>
                        <div className="text-xs text-gray-400">
                          {CATEGORY_NAMES[item.category] || item.category}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-pink-500">
                      ฿{item.amount.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center mt-20 text-gray-300">
            <Wallet size={48} className="mx-auto mb-2 opacity-20" />
            <p>ไม่มีรายการในเดือนนี้</p>
          </div>
        )}
      </div>

      <NavBar />
    </div>
  );
}
