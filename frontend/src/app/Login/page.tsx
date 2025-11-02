"use client";

import { useState } from "react";
import Intro from "@/components/intro";
import { User, LogOut, Users } from "lucide-react";

export default function Login() {
  const [showIntro, setShowIntro] = useState(true);

  const handleIntroFinish = () => {
    setShowIntro(false);
  };

  return (
    <>
      {showIntro && (
        <div className="fixed inset-0 w-full h-full z-50">
          <Intro onFinish={handleIntroFinish} />
        </div>
      )}

      <main className="bg-gradient-to-b from-[#012E4B] to-[#064F75] min-h-screen w-full flex flex-col justify-between">
        {/* Conteúdo do topo */}
        <div className="flex flex-col items-center pt-10">
          <img src="/assets/Logo.png" alt="Logo" className="w-10 h-10" />

          <div className="text-center font-bold text-xl uppercase pt-10">
            <h2>
              Bem-vindo! <br />
              <span className="text-[15px] font-bold">
                É um prazer ter você com a gente.
              </span>
            </h2>
          </div>

          <p className="pt-20 text-center text-[15px] font-bold w-50">
            Faça login e desfrute do melhor do nosso banco!
          </p>
        </div>

        {/* Menu fixado no rodapé */}
        <div className="flex justify-center gap-5 pb-2">
          <div className="w-[110px] h-[90px] border border-white/50 rounded-[10px] flex flex-col items-center justify-center text-center">
            <User className="w-8 h-8 mb-2" />
            <p className="text-[14px]">Cliente</p>
          </div>

          <div className="w-[110px] h-[90px] border border-white/50 rounded-[10px] flex flex-col items-center justify-center text-center">
            <Users className="w-8 h-8 mb-2" />
            <p className="text-[14px]">Funcionário</p>
          </div>

          <div className="w-[110px] h-[90px] border border-white/50 rounded-[10px] flex flex-col items-center justify-center text-center">
            <LogOut className="w-8 h-8 mb-2" />
            <p className="text-[14px]">Sair</p>
          </div>
        </div>
      </main>
    </>
  );
}
