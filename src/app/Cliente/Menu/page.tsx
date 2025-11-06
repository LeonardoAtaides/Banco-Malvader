"use client";

import React, { useState } from "react";
import {
  ChevronRight,
  HandHelping,
  FileText,
  CircleFadingPlus,
  ChartNoAxesCombined,
  ChartCandlestick,
  ArrowLeftRight,
  BanknoteArrowDown,
  BanknoteArrowUp,
  FileChartColumn,
  Search,
  MessageCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import AIChat from "@/components/ai-chat";

export default function Cliente() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [showChat, setShowChat] = useState(false);

  // Pegar token do localStorage (ajuste conforme seu sistema de auth)
  const getToken = () => {
    if (typeof window !== "undefined") {
      // Tenta pegar do localStorage
      const token = localStorage.getItem("authToken");
      if (token) return token;
      
      // FALLBACK TEMPORÁRIO: gera um token fake para teste
      // TODO: Remover isso quando integrar auth real
      console.warn("⚠️ Usando token fake para teste. Implemente auth real!");
      return "fake-token-for-testing";
    }
    return "";
  };

  // Lista de opções com rotas correspondentes
  const opcoes = [
    {
      nome: "Extrato",
      icone: <FileChartColumn />,
      rota: "/Cliente/Extrato",
    },
    {
      nome: "Depositar",
      icone: <BanknoteArrowUp />,
      rota: "/Cliente/Depositar",
    },
    {
      nome: "Sacar",
      icone: <BanknoteArrowDown />,
      rota: "/Cliente/Sacar",
    },
    {
      nome: "Transferir",
      icone: <ArrowLeftRight />,
      rota: "/Cliente/Transferir",
    },
    {
      nome: "Limite",
      icone: <ChartCandlestick />,
      rota: "/Cliente/Limite",
    },
    {
      nome: "Investimento",
      icone: <ChartNoAxesCombined />,
      rota: "/Cliente/Investimentos",
    },
    {
      nome: "Ajuda",
      icone: <HandHelping />,
      rota: "/Cliente/Ajuda",
    },
    {
      nome: "Termos",
      icone: <FileText />,
      rota: "/Termos",
    },
    {
      nome: "Sobre",
      icone: <CircleFadingPlus />,
      rota: "/Cliente/Devs",
    },
  ];

  // Filtragem das opções pela busca
  const opcoesFiltradas = opcoes.filter((opcao) =>
    opcao.nome.toLowerCase().includes(search.toLowerCase())
  );

  // Navegação para a rota correspondente
  const handleNavigation = (rota: string) => {
    router.push(rota);
  };

  return (
    <main className="bg-white min-h-screen text-[14px] font-bold pb-18">
      {/* Topo com gradiente e barra de busca */}
      <div className="bg-[#012E4B] pt-0 flex flex-col justify-center px-5 h-[60px] bg-wave bg-no-repeat bg-bottom bg-cover relative z-10">


        {/* Search */}
        <div className="flex items-center bg-white/10 border border-white/30 rounded-full px-4 py-2 mt-6">
          <Search className="w-5 h-5 text-white/70" />
          <input
            type="text"
            placeholder="Buscar funcionalidade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent flex-1 ml-2 text-white placeholder-white/70 outline-none"
          />
        </div>
      </div>

      {/* Wave decorativa */}
      <div className="w-full flex justify-center">
        <img
          src="/assets/Wave.png"
          alt="wave"
          className="w-full h-auto object-cover repeat-y"
        />
      </div>

      {/* Botões de opções */}
      <div className="pb-28">
        {opcoesFiltradas.length > 0 ? (
          opcoesFiltradas.map((opcao, index) => (
            <div key={index} className="flex justify-center text-[12px] mt-2">
              <button
                onClick={() => handleNavigation(opcao.rota)}
                className="flex justify-between items-center w-90 text-center mt-2 bg-[#012E4B] py-3 px-5 rounded-[10px] text-white hover:bg-[#02385b] transition-all duration-200"
              >
                <div className="flex justify-center items-center gap-5">
                  {opcao.icone}
                  {opcao.nome}
                </div>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400 mt-10">
            Nenhuma opção encontrada.
          </p>
        )}
      </div>

      <Navbar />

      {/* Botão flutuante do chat IA */}
      {!showChat && (
        <button
          onClick={() => setShowChat(true)}
          className="fixed bottom-24 right-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 z-50 animate-pulse"
          title="Assistente Virtual"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Modal do chat */}
      {showChat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <AIChat token={getToken()} onClose={() => setShowChat(false)} />
        </div>
      )}
    </main>
  );
}
