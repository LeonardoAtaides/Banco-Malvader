"use client";

import React from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import Search from "@/components/pesquisa";

const Extrato: React.FC = () => {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#012E4B] to-[#064F75] text-white flex flex-col justify-between">
      {/* Conteúdo principal */}
      <div className="px-5 py-5">
      {/* Header */}
      <div className="relative">
        <button
          className="absolute top-0 left-0 hover:text-white/70 transition"
          onClick={handleBack}
        >
          <X className="w-8 h-8" />
        </button>
      </div>

      <h1 className=" pt-12 text-center text-2xl font-bold">
        Últimas Transações
      </h1>

    {/* Barra de Pesquisa */}
    <Search/>
    





      </div>
    </main>
  );
};

export default Extrato;
