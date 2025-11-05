"use client";

import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  LogOut,
  FileChartColumn,
  BanknoteArrowUp,
  BanknoteArrowDown,
  ArrowLeftRight,
  ChartCandlestick,
  User,
  ChartNoAxesCombined,
  Users,
  Import,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Titulo from "@/components/titles";
import FuncNavBar from "@/components/funcnavbar" 

export default function Cliente() {
  const [ocultar, setOcultar] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/Login");
  };

  const toggleOcultar = () => setOcultar(!ocultar);

  // Rotas
  const AbrirConta = () => router.push("/Funcionario/AbrirConta");
  const ConsultarDados = () => router.push("/Funcionario/ConsultarDados");
  const AlterarLimite = () => router.push("/Funcionario/AlterarLimite");
  const NovoFuncionario = () => router.push("/Funcionario/NovoFuncionario");
  const GerarRelatorios = () => router.push("/Funcionario/GerarRelatorios");
  const EncerrarConta = () => router.push("/Funcionario/EncerrarConta");
  const Termos = () => router.push("/Termos");

  // Dados simulados para o map
  const ultimasContas = [
    { nome: "Pedro Silva", tipo: "Conta Corrente - 12345", data: "01/10/25", hora: "15:40" },
    { nome: "Marcela Vitória", tipo: "Conta Corrente - 12345", data: "02/10/25", hora: "12:30" },
    { nome: "Ana Beatriz", tipo: "Conta Corrente - 12345", data: "06/10/25", hora: "10:10" },
  ];

  const atividadesRecentes = [
    { titulo: "Conta Aberta", detalhe: "Conta Corrente - 12345", tempo: "Há 2 horas" },
    { titulo: "Limite Alterado", detalhe: "Maria Santos - CC 1234-5", tempo: "Há 3 horas" },
    { titulo: "Funcionário cadastrado", detalhe: "Pedro Costa - Atendente", tempo: "Há 4 horas" },
  ];

  return (
    <main className="bg-white min-h-screen text-[14px] font-bold pb-18">
      {/* Header */}
      <div className="bg-[#012E4B] pt-2 flex-col justify-center px-5 h-[120px] z-50 bg-wave bg-no-repeat bg-bottom bg-cover">
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-5 relative">
            <img src="/assets/Logo.png" alt="logo" className="w-8 h-8" />
            <h2 className="text-white">Nome - Cargo</h2>
            <div className="absolute bottom-0 left-13 w-74 border-b border-white/50"></div>
          </div>

          <div className="flex gap-2 relative z-10">
            <button onClick={toggleOcultar}>
              {ocultar ? (
                <EyeOff className="w-5 h-5 text-white" />
              ) : (
                <Eye className="w-5 h-5 text-white" />
              )}
            </button>
            <LogOut className="w-5 h-5 text-white" onClick={handleLogout} />
          </div>
        </div>

        {/* Mini cards */}
        <div className="flex justify-center pt-5 gap-3 z-10">
          <div className="text-center border border-white/60 rounded-[10px] p-2 bg-white/5">
            <h2 className="text-xs">Contas Abertas</h2>
            <div className="flex justify-between pt-1">
              <User className="w-5 h-5" />
              <p>{ocultar ? "•••••" : "1000K"}</p>
            </div>
          </div>

          <div className="text-center border border-white/60 rounded-[10px] p-2 bg-white/5">
            <h2 className="text-xs">Movimentação</h2>
            <div className="flex justify-between pt-1">
              <ChartNoAxesCombined className="w-5 h-5" />
              <p>{ocultar ? "••••" : "R$ 100K"}</p>
            </div>
          </div>

          <div className="text-center border border-white/60 rounded-[10px] p-2 bg-white/5">
            <h2 className="text-xs">Funcionários</h2>
            <div className="flex justify-between pt-1">
              <Users className="w-5 h-5" />
              <p>{ocultar ? "••" : "50"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Wave */}
      <div className="w-full flex justify-center">
        <img
          src="/assets/Wave.png"
          alt="wave"
          className="w-full h-auto object-cover repeat-y"
        />
      </div>

      <Titulo tipo={7} />

      {/* Botões do Funcionário */}
      <div className="w-full overflow-x-auto">
        <div className="flex gap-5 px-4 py-4 min-w-max">
          <button onClick={AbrirConta} className="flex flex-col items-center flex-shrink-0">
            <div className="flex justify-center items-center bg-[#012E4B] w-20 h-20 rounded-full">
              <FileChartColumn className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-center w-20 text-[#012E4B] pt-1">Abrir Conta</h1>
          </button>

          <button onClick={ConsultarDados} className="flex flex-col items-center flex-shrink-0">
            <div className="flex justify-center items-center bg-[#012E4B] w-20 h-20 rounded-full">
              <BanknoteArrowUp className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-center w-20 text-[#012E4B] pt-1">Consultar Dados</h1>
          </button>

          <button onClick={AlterarLimite} className="flex flex-col items-center flex-shrink-0">
            <div className="flex justify-center items-center bg-[#012E4B] w-20 h-20 rounded-full">
              <BanknoteArrowDown className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-center w-20 text-[#012E4B] pt-1">Alterar Limite</h1>
          </button>

          <button onClick={NovoFuncionario} className="flex flex-col items-center flex-shrink-0">
            <div className="flex justify-center items-center bg-[#012E4B] w-20 h-20 rounded-full">
              <ArrowLeftRight className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-center w-20 text-[#012E4B] pt-1">Novo Funcionário</h1>
          </button>

          <button onClick={GerarRelatorios} className="flex flex-col items-center flex-shrink-0">
            <div className="flex justify-center items-center bg-[#012E4B] w-20 h-20 rounded-full">
              <ChartCandlestick className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-center w-20 text-[#012E4B] pt-1">Gerar Relatórios</h1>
          </button>

          <button onClick={EncerrarConta} className="flex flex-col items-center flex-shrink-0">
            <div className="flex justify-center items-center bg-[#012E4B] w-20 h-20 rounded-full">
              <ChartCandlestick className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-center w-20 text-[#012E4B] pt-1">Encerrar Conta</h1>
          </button>
        </div>
      </div>

      {/* Últimas Contas Abertas */}
      <Titulo tipo={8} />

      <div className="px-5 mt-3">
        <div className="bg-[#012E4B] text-white rounded-[10px] p-4">
          {ultimasContas.map((conta, i) => (
            <div
              key={i}
              className={`flex justify-between items-center py-2 ${
                i !== ultimasContas.length - 1 ? "border-b border-white/30" : ""
              }`}
            >
              <div>
                <p className="font-semibold">{conta.nome}</p>
                <p className="text-[12px] opacity-90">{conta.tipo}</p>
              </div>
              <div className="text-center">
                <p className="text-[12px]">{conta.data}</p>
                <p className="text-[11px] opacity-80">{conta.hora}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Atividades Recentes */}
      <Titulo tipo={9} />

      <div className="px-5 mt-3 mb-16">
        <div className="bg-[#012E4B] text-white rounded-[10px] p-4">
          {atividadesRecentes.map((atividade, i) => (
            <div
              key={i}
              className={`flex justify-between items-center py-2 ${
                i !== atividadesRecentes.length - 1 ? "border-b border-white/30" : ""
              }`}
            >
              <div>
                <p className="font-semibold">{atividade.titulo}</p>
                <p className="text-[12px] opacity-90">{atividade.detalhe}</p>
              </div>
              <p className="text-[11px] opacity-80">{atividade.tempo}</p>
            </div>
          ))}
        </div>
      </div>

      <FuncNavBar />
    </main>
  );
}
