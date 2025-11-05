import { Home, User, Menu } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BottomNavCliente() {
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#012E4B] flex justify-around items-center py-3 text-white shadow-t z-50">
      <button onClick={() => router.push("/Cliente/Perfil")} className="flex flex-col items-center text-xs">
        <User className="w-6 h-6 mb-1" />
        Perfil
      </button>

      <button onClick={() => router.push("/Cliente")} className="flex flex-col items-center text-xs">
        <Home className="w-6 h-6 mb-1" />
        Home
      </button>

      <button onClick={() => router.push("/Cliente/Menu")} className="flex flex-col items-center text-xs">
        <Menu className="w-6 h-6 mb-1" />
        Menu
      </button>
    </nav>
  );
}
