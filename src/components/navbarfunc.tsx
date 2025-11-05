import { Home, User, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
export default function BottomNav() {
  const router = useRouter();
  const MenuPerfil = () => {
  router.push("/Funcionario/Perfil");
  };
    const MenuHome = () => {
  router.push("/Funcionario");
  };

     const OpenMenu = () => {
  router.push("/Funcionario/Menu");
  };



  return (
    <nav  className="fixed bottom-0 left-0 right-0 bg-[#012E4B] flex justify-around items-center py-3 text-white shadow-t z-50">
      {/* Perfil */}
      <button onClick={MenuPerfil} className="flex flex-col items-center text-xs">
        <User className="w-6 h-6 mb-1" />
        Perfil
      </button>

      {/* Home */}
      <button onClick={MenuHome} className="flex flex-col items-center text-xs">
        <Home className="w-6 h-6 mb-1" />
        Home
      </button>

      {/* Menu */}
      <button onClick={OpenMenu} className="flex flex-col items-center text-xs">
        <Menu className="w-6 h-6 mb-1" />
        Menu
      </button>
    </nav>
  );
}
