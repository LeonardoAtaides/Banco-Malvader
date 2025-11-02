import { Home, User, Menu } from "lucide-react"; // usando lucide-react para os ícones

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#012E4B] flex justify-around items-center py-3 text-white shadow-t z-50">
      {/* Perfil */}
      <button className="flex flex-col items-center text-xs">
        <User className="w-6 h-6 mb-1" />
        Perfil
      </button>

      {/* Home */}
      <button className="flex flex-col items-center text-xs">
        <Home className="w-6 h-6 mb-1" />
        Home
      </button>

      {/* Menu */}
      <button className="flex flex-col items-center text-xs">
        <Menu className="w-6 h-6 mb-1" />
        Menu
      </button>
    </nav>
  );
}
