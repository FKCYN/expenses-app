"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import ExpenseForm, { ExpenseData } from "@/app/components/ExpenseForm";

export default function Edit() {
  const params = useParams();
  const id = params.id as string;
  const [expenseData, setExpenseData] = useState<ExpenseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchExpense() {
      try {
        const response = await axios.get(`/api/expenses/${id}`);
        setExpenseData(response.data.data);
      } catch (err) {
        console.log(err);
        setError("ไม่สามารถโหลดข้อมูลได้");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchExpense();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <div className="text-pink-500 text-lg font-medium">กำลังโหลด...</div>
      </div>
    );
  }

  if (error || !expenseData) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <div className="text-red-500 text-lg font-medium">
          {error || "ไม่พบรายการ"}
        </div>
      </div>
    );
  }

  return (
    <ExpenseForm mode="edit" initialData={expenseData} expenseId={Number(id)} />
  );
}
