import { Plus, LayoutDashboard, History, MessageCircle } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <>
      <button
        onClick={() => router.push("/chat")}
        className={`fixed bottom-24 right-4 p-4 rounded-full shadow-xl transition-all z-50 ${
          pathname === "/chat"
            ? "bg-pink-600 text-white scale-110"
            : "bg-pink-500 text-white hover:bg-pink-600 active:scale-95"
        }`}
      >
        <MessageCircle size={22} />
      </button>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-pink-100 flex justify-around py-4 px-6 rounded-t-3xl shadow-lg">
        <button
          onClick={() => router.push("/dashboard")}
          className={`p-2 rounded-xl transition-all ${
            pathname === "/dashboard"
              ? "bg-pink-500 text-white shadow-md"
              : "text-pink-300"
          }`}
        >
          <LayoutDashboard size={24} />
        </button>
        <button
          onClick={() => router.push("/add")}
          className="p-4 bg-pink-400 text-white rounded-full -mt-10 shadow-lg border-4 border-white active:scale-95 transition-transform"
        >
          <Plus size={28} />
        </button>
        <button
          onClick={() => router.push("/history")}
          className={`p-2 rounded-xl transition-all ${
            pathname === "/history"
              ? "bg-pink-500 text-white shadow-md"
              : "text-pink-300"
          }`}
        >
          <History size={24} />
        </button>
      </div>
    </>
  );
}
