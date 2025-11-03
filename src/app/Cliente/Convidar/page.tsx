"use client";

import React from "react";
import { ChevronLeft, Share } from "lucide-react";
import { useRouter } from "next/navigation";

const InvitePage: React.FC = () => {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent("Venha para o banco Malvader");
    const url = `https://api.whatsapp.com/send?text=${message}`;
    window.open(url, "_blank");
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#012E4B] to-[#064F75] text-white flex flex-col justify-between">
      
      {/* Header */}
      <div className="relative">
        <button
          className="absolute top-5 left-5 hover:text-white/70 transition"
          onClick={handleBack}
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
      </div>

      <h1 className="text-center text-2xl font-bold">
        Convide seus <br /> Amigos e Familiares
      </h1>

      {/* Conteúdo principal */}
      <div className="flex flex-col items-center px-5 space-y-5">
        <img
          src="/assets/Invite.png"
          alt="Convide seus amigos"
          className="w-60 h-auto"
        />
        <p className="text-justify text-[12px]">
          No MV, cada cliente é parte de algo maior. Indique para seus amigos e
          venha construir juntos o futuro das finanças digitais com a gente.
        </p>

        {/* Botão Convidar */}
        <button
          onClick={handleWhatsApp}
          className="mt-14 flex items-center justify-center gap-2 px-6 py-3 bg-white/10 rounded-lg hover:bg-white/90 hover:text-[#012E4B] transition"
        >
          <Share className="w-5 h-5" /> Convidar
        </button>
      </div>

      {/* Wave no rodapé */}
      <div className="w-full">
        <img
          src="/assets/Wave_white.png"
          alt="wave"
          className="w-full h-auto object-cover opacity-60"
        />
      </div>
    </main>
  );
};

export default InvitePage;
