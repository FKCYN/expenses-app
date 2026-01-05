"use client";
import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { Utensils, ShoppingBag, Car, Gift, TrendingDown } from "lucide-react";
import NavBar from "@/app/components/navBar";
import axios from "axios";

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
function CategoryIcon({ category }: { category: string }) {
  const iconProps = { size: 18, className: "text-white" };
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
  [key: string]: string | number; // Index signature for Recharts compatibility
}

export default function History() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [chartData, setChartData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchExpenses() {
      try {
        const response = await axios.get("/api/expenses");
        const data = response.data.data;
        setExpenses(data);

        // คำนวณยอดรวมตาม category
        const categoryTotals: { [key: string]: number } = {};
        let total = 0;

        data.forEach((item: any) => {
          const cat = item.category || "other";
          categoryTotals[cat] = (categoryTotals[cat] || 0) + item.amount;
          total += item.amount;
        });

        // แปลงเป็น array สำหรับ chart
        const chartDataArray: CategoryData[] = Object.entries(categoryTotals)
          .map(([category, value]) => ({
            name: CATEGORY_NAMES[category] || category,
            value: value,
            percentage: total > 0 ? Math.round((value / total) * 100) : 0,
            category: category,
          }))
          .sort((a, b) => b.value - a.value);

        setChartData(chartDataArray);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
    fetchExpenses();
  }, []);

  const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <div className="text-pink-500 text-lg font-medium">กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-50 pb-32 font-sans">
      {/* Header */}
      <div className="bg-gradient-to-br from-pink-400 to-pink-500 p-8 pt-12 rounded-b-[50px] shadow-lg">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 text-white">
            <TrendingDown size={20} />
          </div>
          <span className="text-white font-bold text-xl">สรุปค่าใช้จ่าย</span>
        </div>

        <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-3xl p-2">
          <div className="text-center text-white mb-2">ยอดรวมทั้งหมด</div>
          <div className="text-center text-4xl font-black text-white mb-2">
            ฿{totalExpense.toLocaleString()}
          </div>
          <div className="text-center text-pink-100 text-sm">
            จาก {expenses.length} รายการ
          </div>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="px-6 mt-4">
        <div className="bg-white rounded-[40px] shadow-lg p-6 border border-pink-100">
          <h2 className="text-pink-600 font-bold text-lg mb-4 text-center">
            สัดส่วนค่าใช้จ่าย
          </h2>

          {chartData.length > 0 ? (
            <>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ percent = 0 }) =>
                        `${Math.round(percent * 100)}%`
                      }
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
                        <span className="text-gray-600 text-sm p-1">
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Category Details */}
              <div className="mt-6 space-y-3">
                {chartData.map((item) => (
                  <div
                    key={item.category}
                    className="flex items-center justify-between p-3 bg-pink-50 rounded-2xl"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{
                          backgroundColor:
                            COLORS[item.category] || COLORS.other,
                        }}
                      >
                        <CategoryIcon category={item.category} />
                      </div>
                      <div>
                        <div className="font-bold text-gray-700">
                          {item.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          {item.percentage}% ของทั้งหมด
                        </div>
                      </div>
                    </div>
                    <div className="text-pink-600 font-bold">
                      ฿{item.value.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-400">
              ยังไม่มีข้อมูลค่าใช้จ่าย
            </div>
          )}
        </div>
      </div>

      <NavBar />
    </div>
  );
}
