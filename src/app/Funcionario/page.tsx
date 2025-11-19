"use client";

import React, { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  LogOut,
  UserPlus,
  UserSearch,
  Settings2,
  IdCardLanyard,
  FileSpreadsheet,
  User,
  ChartNoAxesCombined,
  Users,
  UserX,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Titulo from "@/components/titles";
import FuncNavBar from "@/components/funcnavbar";

export default function Cliente() {
  const [ocultar, setOcultar] = useState(false);
  const [nomeFuncionario, setNomeFuncionario] = useState("");
  const [cargo, setCargo] = useState("");

  const [cards, setCards] = useState({
    totalContasAbertas: 0,
    totalMovimentacoes: 0,
    totalFuncionarios: 0,
  });

  const [ultimasContas, setUltimasContas] = useState([]);
  const [atividadesRecentes, setAtividadesRecentes] = useState([]);

  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/Login");
  };

  const toggleOcultar = () => setOcultar(!ocultar);

const formatarData = (dataStr?: string) => {
  if (!dataStr) return { data: "-", hora: "-" };
  const data = new Date(dataStr);

  const dia = String(data.getUTCDate()).padStart(2, "0");
  const mes = String(data.getUTCMonth() + 1).padStart(2, "0");
  const ano = String(data.getUTCFullYear()).slice(-2);

  const hora = String(data.getUTCHours()).padStart(2, "0");
  const min = String(data.getUTCMinutes()).padStart(2, "0");

  return { data: `${dia}/${mes}/${ano}`, hora: `${hora}:${min}` };
};

const formatarHora = (dataStr?: string) => {
  if (!dataStr) return "-";
  const data = new Date(dataStr);
  const hora = String(data.getUTCHours()).padStart(2, "0");
  return `${hora}h`;
};

  // Rotas
  const AbrirConta = () => router.push("/Funcionario/AbrirConta");
  const ConsultarDados = () => router.push("/Funcionario/ConsultarDados");
  const AlterarLimite = () => router.push("/Funcionario/AlterarLimite");
  const NovoFuncionario = () => router.push("/Funcionario/NovoFuncionario");
  const GerarRelatorios = () => router.push("/Funcionario/GerarRelatorios");
  const EncerrarConta = () => router.push("/Funcionario/EncerrarConta");

  // ============================
  // 📌 BUSCAR PERFIL
  // ============================
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/Login");
      return;
    }

    async function fetchPerfil() {
      try {
        const res = await fetch("/api/funcionario", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Erro ao buscar perfil");

        const data = await res.json();

        setNomeFuncionario(data.nome || "");
        setCargo(data.cargo || "");

        // Cards
        setCards(data.cards || {});

        // Listas
        setUltimasContas(data.ultimasContas || []);
        setAtividadesRecentes(data.atividadesRecentes || []);

      } catch (err) {
        console.error("Erro ao buscar perfil:", err);
      }
    }

    fetchPerfil();
  }, [router]);

  return (
    <main className="bg-white min-h-screen text-[14px] font-bold pb-18">

      {/* Header */}
      <div className="bg-[#012E4B] pt-2 flex-col justify-center px-5 h-[120px] z-50 bg-wave bg-no-repeat bg-bottom bg-cover">
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-5 relative">
            <img src="/assets/Logo.png" alt="logo" className="w-8 h-8" />
            <h2 className="text-white">
              {nomeFuncionario} - {cargo}
            </h2>
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
              <p>{ocultar ? "•••••" : cards.totalContasAbertas}</p>
            </div>
          </div>

          <div className="text-center border border-white/60 rounded-[10px] p-2 bg-white/5">
            <h2 className="text-xs">Movimentação</h2>
            <div className="flex justify-between pt-1">
              <ChartNoAxesCombined className="w-5 h-5" />
              <p>{ocultar ? "••••" : cards.totalMovimentacoes}</p>
            </div>
          </div>

          <div className="text-center border border-white/60 rounded-[10px] p-2 bg-white/5">
            <h2 className="text-xs">Funcionários</h2>
            <div className="flex justify-between pt-1">
              <Users className="w-5 h-5" />
              <p>{ocultar ? "••" : cards.totalFuncionarios}</p>
            </div>
          </div>

        </div>
      </div>

      {/* Wave */}
      <div className="w-full flex justify-center">
        <img src="/assets/Wave.png" alt="wave" className="w-full h-auto object-cover repeat-y" />
      </div>

      <Titulo tipo={7} />

      {/* Botões */}
      <div className="w-full overflow-x-auto">
        <div className="flex gap-5 px-4 py-4 min-w-max">

          <button onClick={AbrirConta} className="flex flex-col items-center flex-shrink-0">
            <div className="flex justify-center items-center bg-[#012E4B] w-20 h-20 rounded-full">
              <UserPlus className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-center w-20 text-[#012E4B] pt-1">Abrir Conta</h1>
          </button>

          <button onClick={ConsultarDados} className="flex flex-col items-center flex-shrink-0">
            <div className="flex justify-center items-center bg-[#012E4B] w-20 h-20 rounded-full">
              <UserSearch className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-center w-20 text-[#012E4B] pt-1">Consultar Dados</h1>
          </button>

          <button onClick={AlterarLimite} className="flex flex-col items-center flex-shrink-0">
            <div className="flex justify-center items-center bg-[#012E4B] w-20 h-20 rounded-full">
              <Settings2 className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-center w-20 text-[#012E4B] pt-1">Alterar Limite</h1>
          </button>

          <button onClick={NovoFuncionario} className="flex flex-col items-center flex-shrink-0">
            <div className="flex justify-center items-center bg-[#012E4B] w-20 h-20 rounded-full">
              <IdCardLanyard strokeWidth={1.5} className="w-11 h-11 text-white" />
            </div>
            <h1 className="text-center w-20 text-[#012E4B] pt-1">Novo Funcionário</h1>
          </button>

          <button onClick={GerarRelatorios} className="flex flex-col items-center flex-shrink-0">
            <div className="flex justify-center items-center bg-[#012E4B] w-20 h-20 rounded-full">
              <FileSpreadsheet className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-center w-20 text-[#012E4B] pt-1">Gerar Relatórios</h1>
          </button>

          <button onClick={EncerrarConta} className="flex flex-col items-center flex-shrink-0">
            <div className="flex justify-center items-center bg-[#012E4B] w-20 h-20 rounded-full">
              <UserX className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-center w-20 text-[#012E4B] pt-1">Encerrar Conta</h1>
          </button>

        </div>
      </div>

      {/* Últimas Contas */}
      <Titulo tipo={8} />

      <div className="px-5 mt-3">
        <div className="bg-[#012E4B] text-white rounded-[10px] p-4">
          {ultimasContas.slice(0, 3).map((conta: any, i: number) => (
            <div
              key={i}
              className={`flex justify-between items-center py-2 ${
                i !== ultimasContas.length - 1 ? "border-b border-white/30" : ""
              }`}
            >
              <div>
                <p className="font-semibold">{conta.cliente}</p>

                <p className="text-[12px] opacity-90">
                  {conta.tipo_conta} - {conta.numero_conta}
                </p>
              </div>

              <div className="text-center">
                <p className="text-[11px] opacity-80 text-center]">{formatarData(conta.data_abertura).data} <br />
                {formatarData(conta.data_abertura).hora}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Atividades Recentes */}
      <Titulo tipo={9} />

      <div className="px-5 mt-3 mb-16">
        <div className="bg-[#012E4B] text-white rounded-[10px] p-4">
          {atividadesRecentes.slice(0,3).map((a: any, i: number) => (
            <div
              key={i}
              className={`flex justify-between items-center py-2 ${
                i !== atividadesRecentes.length - 1 ? "border-b border-white/30" : ""
              }`}
            >
              <div>
                <p className="font-semibold">{a.tipo}</p>
                <p className="text-[12px] opacity-90">
                  {a.conta_origem ? `Cc. ${a.conta_origem}` : ""}
                  {a.conta_destino ? `  - Dest. ${a.conta_destino}` : ""}
                </p>
              </div>
              <p className="text-[11px] opacity-80 text-center"> Há {formatarHora(a.data_hora)}
              </p>

            </div>
          ))}
        </div>
      </div>
      <FuncNavBar />
    </main>
  );
}
