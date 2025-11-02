"use client";

import React from "react";
import { Eye, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Cliente() {
 const router = useRouter();

  const handleLogout = () => {
    // Remove dados de login
    localStorage.removeItem("token"); // ou qualquer chave que você use
    // Redireciona para página de login
    router.push("/Login");
  };


  return (
    <main className="bg-white min-h-screen text-[14px] font-bold  ">
    <div className="bg-[#012E4B] pt-2 flex-col justify-center px-5 w h-[110px] z-50 bg-wave bg-no-repeat bg-bottom bg-cover"
    
    >

    
      <div className="relative flex items-center justify-between  ">
        <div className="flex items-center gap-5 relative">
          <img src="/assets/Logo.png" alt="logo" className="w-8 h-8" />
          <h2 className="text-white">Olá, Cliente</h2>
          {/* Linha passando por baixo de tudo */}
          <div className="absolute bottom-0 left-13 w-74 border-b border-white/50"></div>
        </div>

        <div className="flex gap-2 relative z-10">
          <Eye className="w-5 h-5" />
          <LogOut  className="w-5 h-5" onClick={handleLogout}/>
        </div>
      </div>

      <div className="flex justify-between pt-5 z-10">
        <div className="text-center">
            <h2>Saldo disponível</h2>
            <p>R$ 1200,00</p>
        </div>

        <div className="text-center">
            <h2>Conta</h2>
            <p>1234-5</p>
        </div>
        
      </div>
    </div>

    {/*waves*/ }
    <div className="w-full flex justify-center mt-0">
        <img 
        src="/assets/Wave.png" 
        alt="wave" 
        className="w-full max-w-[600px] h-auto object-cover repeat-y" 
        />
    </div>

    </main>
  );
}
