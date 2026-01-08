"use client";
import React, { useState, useRef, useEffect } from "react";
import NavBar from "../components/navBar";
import { Send, Bot, Loader2 } from "lucide-react";
import axios from "axios";

type Message = {
  role: "user" | "bot";
  text: string;
};

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: "สวัสดีจ้าาา! อยากรู้เรื่องรายจ่ายเดือนนี้ถามมาได้เลยจ้า (เช่น 'เดือนนี้หมดค่ากาแฟไปเท่าไหร่?', 'ยอดรวมเดือนนี้กี่บาท')",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // เลื่อนจอลงล่างสุดเสมอเมื่อมีข้อความใหม่
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setLoading(true);

    try {
      const res = await axios.post("/api/ai/chat", { message: userMessage });
      const botReply = res.data.reply;
      setMessages((prev) => [...prev, { role: "bot", text: botReply }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "ขอโทษครับ เกิดข้อผิดพลาดในการเชื่อมต่อ" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pink-50 pb-32 font-sans flex flex-col">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm fixed top-0 w-full z-10 flex items-center gap-2">
        <div className="bg-pink-100 p-2 rounded-full">
          <Bot size={24} className="text-pink-600" />
        </div>
        <h1 className="text-lg font-bold text-gray-700">น้องหมูทอด</h1>
      </div>

      {/* Chat Area */}
      <div className="flex-1 mt-20 px-4 space-y-4 overflow-y-auto">
        {messages.map((m, index) => (
          <div
            key={index}
            className={`flex ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                m.role === "user"
                  ? "bg-pink-500 text-white rounded-br-none"
                  : "bg-white text-gray-700 shadow-sm border border-pink-100 rounded-bl-none"
              }`}
            >
              {m.text.split("\n").map((line, i) => (
                <p key={i} className="mb-1">
                  {line}
                </p> // รองรับการขึ้นบรรทัดใหม่
              ))}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2 text-gray-400 text-sm">
              <Loader2 className="animate-spin" size={16} />{" "}
              กำลังวิเคราะห์ข้อมูล...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="fixed bottom-20 left-0 w-full px-4 pt-2 pb-4 bg-gradient-to-t from-pink-50 to-transparent">
        <div className="bg-white p-2 rounded-full shadow-lg border border-pink-100 flex items-center gap-2">
          <input
            type="text"
            className="flex-1 bg-transparent px-4 py-2 outline-none text-gray-700 placeholder-gray-400"
            placeholder="ถามเกี่ยวกับรายจ่าย..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className={`p-3 rounded-full text-white transition-all ${
              loading || !input.trim()
                ? "bg-gray-300"
                : "bg-pink-500 hover:bg-pink-600 shadow-md"
            }`}
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      <NavBar />
    </div>
  );
}
