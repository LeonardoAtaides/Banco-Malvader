"use client";

import React from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import Titulo from "@/components/titles";

const InvitePage: React.FC = () => {
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
        Meus Investimentos
      </h1>

    {/* Conta Poupança */}
    <Titulo tipo={5} />

    <div className="mt-6 p-4 bg-white/10 rounded-xl border-1 border-white/40 mb-5">
        <div className="flex justify-between mb-2">
            <div>
                <p className="text-sm text-gray-300">Saldo Atual</p>
                <p className="text-lg font-semibold">R$ 300,00</p>
            </div>
            <div className="text-right">
                <p className="text-sm text-gray-300">Rendimento</p>
                <p className="text-[#42D23A] font-semibold">+ R$ 1,50</p>
            </div>
        </div>
        <div className="text-sm text-gray-300 space-y-1">
            <p>Taxa de rendimento: 0,5%</p>
            <p>Abertura: 01/09/2025</p>
        </div>
    </div>

    {/* Conta Investimento */}
     <Titulo tipo={6} />
     
    <div className="mt-6 p-4 bg-white/10 rounded-xl border-1 border-white/40">
        <div className="flex justify-between mb-2">
            <div>
                <p className="text-sm text-gray-300">Saldo Aplicado</p>
                <p className="text-lg font-semibold">R$ 500,00</p>
            </div>
            <div className="text-right">
                <p className="text-sm text-gray-300">Rendimento</p>
                <p className="text-[#42D23A] font-semibold">+ R$ 52,50</p>
            </div>
        </div>
        <div className="text-sm text-gray-300 space-y-1">
            <p>Taxa de base: 10,5%</p>
            <p>Perfil de risco: Médio</p>
            <p>Valor mínimo: R$ 200,00</p>
            <p>Abertura: 01/10/2025</p>
        </div>
    </div>

      </div>
    </main>
  );
};

export default InvitePage;
