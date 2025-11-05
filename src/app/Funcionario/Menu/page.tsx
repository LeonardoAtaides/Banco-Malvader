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
} from "lucide-react";
import { useRouter } from "next/navigation";
import FuncNavbar from "@/components/funcnavbar";

export default function Cliente() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  // Lista de opções com rotas correspondentes
  const opcoes = [
    {
      nome: "Abrir Conta",
      icone: <FileChartColumn />,
      rota: "/Funcionario/AbrirConta",
    },
    {
      nome: "Consultar Dados",
      icone: <BanknoteArrowUp />,
      rota: "/Funcionario/ConsultarDados",
    },
    {
      nome: "Alterar Limite",
      icone: <BanknoteArrowDown />,
      rota: "/Funcionario/AlterarLimite",
    },
    {
      nome: "Novo Funcionario",
      icone: <ArrowLeftRight />,
      rota: "/Funcionario/NovoFuncionario",
    },
    {
      nome: "Gerar Relatorios",
      icone: <ChartCandlestick />,
      rota: "//Funcionario/GerarRelatorios",
    },
    {
      nome: "EncerrarConta",
      icone: <ChartNoAxesCombined />,
      rota: "Funcionario/EncerrarConta",
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

      <FuncNavbar />
    </main>
  );
}
