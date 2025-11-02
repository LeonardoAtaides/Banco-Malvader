"use client";

import React from "react";
import { X, MessageSquareWarning } from "lucide-react";
import { useRouter } from "next/navigation";


const Limite: React.FC = () => {
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
        Meu Limite
      </h1>

    <div className="mt-6 p-4 bg-white/10 rounded-xl border-1 border-white/40 mb-5">
        <div className="flex justify-between mb-2">
            <div>
                <p className="text-sm text-gray-300">Limite Total</p>
                <p className="text-lg font-semibold">R$ 2280,00</p>
            </div>
            <div className="text-right">
                <p className="text-sm text-gray-300">Limite disponível</p>
                <p className="text-[#42D23A] font-semibold">R$ 250,00</p>
            </div>
        </div>
        <div className=" flex-col text-sm text-gray-300 space-y-1">
            <div className="flex justify-between">
               <p>Limite Utilizado:</p>
               <span>R$ 1700,00</span> 
            </div>

            <div className="flex justify-between">
               <p>Data de Vencimento:</p>
               <span>Todo Dia 10</span> 
            </div>

            <div className="flex justify-between">
               <p>Taxa de Juros:</p>
               <span>2,5% a.m</span> 
            </div>            
        </div>      
    </div>

        {/* Aviso*/}
        <div className="flex justify-center items-center w-full text-center bg-white/10 text-white px-2 py-2 rounded-[10px] transition-all duration-500 ease-in-out border border-white/20 space-x-2 text-xs">
        <MessageSquareWarning className="w-6 h-6 text-white/80" />
        <p>Mantenha um bom histórico de pagamentos <br/> para aumentar o seu limite no nosso banco</p>
        </div>


      </div>
    </main>
  );
};

export default Limite;
