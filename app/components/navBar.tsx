import { Plus, LayoutDashboard, History } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
export default function NavBar() {
  const [page, setPage] = useState("dashboard");

  const router = useRouter();
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-pink-100 flex justify-around py-4 px-6 rounded-t-3xl shadow-lg">
      <button
        onClick={() => {
          setPage("dashboard");
          router.push("/dashboard");
        }}
        className={`p-2 rounded-xl transition-all ${
          page === "dashboard"
            ? "bg-pink-500 text-white shadow-md"
            : "text-pink-300"
        }`}
      >
        <LayoutDashboard size={24} />
      </button>
      <button
        onClick={() => {
          setPage("add");
          router.push("/add");
        }}
        className="p-4 bg-pink-400 text-white rounded-full -mt-10 shadow-lg border-4 border-white active:scale-95 transition-transform"
      >
        <Plus size={28} />
      </button>
      <button
        onClick={() => {
          setPage("history");
          router.push("/history");
        }}
        className={`p-2 rounded-xl transition-all ${
          page === "history"
            ? "bg-pink-500 text-white shadow-md"
            : "text-pink-300"
        }`}
      >
        <History size={24} />
      </button>
    </div>
  );
}
