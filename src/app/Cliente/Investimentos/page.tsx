"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import Titulo from "@/components/titles";

const fmtMoney = (v: number | undefined | null) => {
  const n = Number(v) || 0;
  return n.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const fmtPercent = (v: number | undefined | null) => {
  const n = Number(v) || 0;
  return n.toString().replace(".", ",");
};

const formatarData = (dataStr?: string | null) => {
  if (!dataStr) return "-";
  const data = new Date(dataStr);
  const dia = String(data.getUTCDate()).padStart(2, "0");
  const mes = String(data.getUTCMonth() + 1).padStart(2, "0");
  const ano = String(data.getUTCFullYear()).slice(-2);
  return `${dia}/${mes}/${ano}`;
};

const Investimentos: React.FC = () => {
  const router = useRouter();
  const [poupanca, setPoupanca] = useState<any>(null);
  const [investimento, setInvestimento] = useState<any>(null);

  const handleBack = () => router.back();

  /* Buscar contas do Back */
  useEffect(() => {
    const fetchContas = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.log("Token não encontrado");
          return;
        }

        const res = await fetch("/api/cliente/contas", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          console.log("Erro na requisição:", await res.text());
          return;
        }

        const data = await res.json();
        console.log("RESPOSTA API:", data);

        /*  POUPANÇA */
        if (data.poupanca) {
          const saldo = Number(data.poupanca.saldo || 0);
          const taxa = Number(
            data.poupanca.conta_poupanca?.taxa_rendimento || 0
          );
          const rendimentoCalculado = (saldo * taxa) / 100;

          setPoupanca({
            saldo,
            rendimento: rendimentoCalculado,
            taxa_rendimento: taxa,
            ultimo_rendimento:
              data.poupanca.conta_poupanca?.ultimo_rendimento ?? null,
            abertura: data.poupanca.data_abertura || null,
          });
        }

        /* INVESTIMENTO */
        if (data.investimento) {
          const saldo = Number(data.investimento.saldo || 0);
          const taxa = Number(
            data.investimento.conta_investimento?.taxa_rendimento ||
              data.investimento.conta_investimento?.taxa_rendimento_base ||
              0
          );
          const valorMin = Number(
            data.investimento.conta_investimento?.valor_minimo || 0
          );

          const rendimentoCalculado = (saldo * taxa) / 100;

          setInvestimento({
            saldo,
            rendimento: rendimentoCalculado,
            taxa_base: taxa,
            valor_minimo: valorMin,
            perfil_risco:
              data.investimento.conta_investimento?.perfil_risco ?? "",
            abertura: data.investimento.data_abertura || null,
          });
        }
      } catch (error) {
        console.log("Erro ao buscar contas:", error);
      }
    };

    fetchContas();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#012E4B] to-[#064F75] text-white flex flex-col">
      <div className="px-5 py-5">
        <div className="relative">
          <button
            className="absolute top-0 left-0 hover:text-white/70 transition"
            onClick={handleBack}
          >
            <X className="w-8 h-8" />
          </button>
        </div>

        <h1 className="pt-12 text-center text-2xl font-bold">
          Meus Investimentos
        </h1>

        {/* CONTA POUPANÇA */}
        <Titulo tipo={5} />
        <div className="mt-6 p-4 bg-white/10 rounded-xl border border-white/40 mb-6">
          <div className="flex justify-between mb-2">
            <div>
              <p className="text-sm text-gray-300">Saldo Atual</p>
              <p className="text-lg font-semibold">
                {poupanca ? `R$ ${fmtMoney(poupanca.saldo)}` : ""}
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-300">Rendimento</p>
              <p className="text-[#42D23A] font-semibold">
                {poupanca
                  ? `+ R$ ${fmtMoney(poupanca.rendimento)}`
                  : ""}
              </p>
            </div>
          </div>

          <div className="text-sm text-gray-300 space-y-1">
            <p>
              Taxa de rendimento:{" "}
              {poupanca ? `${fmtPercent(poupanca.taxa_rendimento)}%` : ""}
            </p>

            <p>
              Abertura:{" "}
              {poupanca ? formatarData(poupanca.abertura) : ""}
            </p>

            <p>
              Último rendimento:{" "}
              {poupanca
                ? formatarData(poupanca.ultimo_rendimento)
                : ""}
            </p>
          </div>
        </div>

        {/* CONTA INVESTIMENTO */}
        <Titulo tipo={6} />
        <div className="mt-6 p-4 bg-white/10 rounded-xl border border-white/40">
          <div className="flex justify-between mb-2">
            <div>
              <p className="text-sm text-gray-300">Saldo Aplicado</p>
              <p className="text-lg font-semibold">
                {investimento
                  ? `R$ ${fmtMoney(investimento.saldo)}`
                  : ""}
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-300">Rendimento</p>
              <p className="text-[#42D23A] font-semibold">
                {investimento
                  ? `+ R$ ${fmtMoney(investimento.rendimento)}`
                  : ""}
              </p>
            </div>
          </div>

          <div className="text-sm text-gray-300 space-y-1">
            <p>
              Taxa de base:{" "}
              {investimento ? `${fmtPercent(investimento.taxa_base)}%` : ""}
            </p>

            <p>
              Perfil de risco:{" "}
              {investimento ? investimento.perfil_risco : ""}
            </p>

            <p>
              Valor mínimo:{" "}
              {investimento
                ? `R$ ${fmtMoney(investimento.valor_minimo)}`
                : "..."}
            </p>

            <p>
              Abertura:{" "}
              {investimento ? formatarData(investimento.abertura) : ""}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Investimentos;
