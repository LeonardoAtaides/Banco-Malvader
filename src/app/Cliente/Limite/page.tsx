"use client";

import React, { useEffect, useState } from "react";
import { X, MessageSquareWarning } from "lucide-react";
import { useRouter } from "next/navigation";

const Limite: React.FC = () => {
  const router = useRouter();

  const [limiteTotal, setLimiteTotal] = useState<number | null>(null);
  const [limiteDisponivel, setLimiteDisponivel] = useState<number | null>(null);
  const [limiteUtilizado, setLimiteUtilizado] = useState<number | null>(null);
  const [dataVencimento, setDataVencimento] = useState<string>("");
  const [taxaJuros, setTaxaJuros] = useState<number | null>(null);

  const handleBack = () => router.back();

const formatarData = (dataStr?: string) => {
  if (!dataStr) return "-";
  const data = new Date(dataStr);
  const dia = String(data.getUTCDate()).padStart(2, "0");
  const mes = String(data.getUTCMonth() + 1).padStart(2, "0");
  const ano = String(data.getUTCFullYear()).slice(-2);
  return `${dia}/${mes}/${ano}`;
};
  // Função para formatar valores em BRL
  const formatarBRL = (valor: number | null) =>
    (valor ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  // Buscar dados do limite da API
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/Login");
      return;
    }

    async function fetchLimite() {
      try {
        const response = await fetch("/api/conta/limite", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          console.error("Erro ao buscar limite");
          return;
        }

        const data = await response.json();

        const limite = Number(data.conta_corrente.limite);
        const saldo = Number(data.saldo);

        setLimiteTotal(limite);
        setLimiteUtilizado(0);
        setLimiteDisponivel(limite );
        setDataVencimento(data.conta_corrente.data_vencimento);
        setTaxaJuros(Number(data.conta_corrente.taxa_manutencao));
      } catch (error) {
        console.error("Erro na requisição:", error);
      }
    }

    fetchLimite();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#012E4B] to-[#064F75] text-white flex flex-col justify-between">
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

        <h1 className="pt-12 text-center text-2xl font-bold">Meu Limite</h1>

        <div className="mt-6 p-4 bg-white/10 rounded-xl border-1 border-white/40 mb-5">
          <div className="flex justify-between mb-2">
            <div>
              <p className="text-sm text-gray-300">Limite Total</p>
              <p className="text-lg font-semibold">
                {formatarBRL(limiteTotal)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-300">Limite disponível</p>
              <p className="text-[#42D23A] font-semibold">
                {formatarBRL(limiteDisponivel)}
              </p>
            </div>
          </div>

          <div className="flex-col text-sm text-gray-300 space-y-1">
            <div className="flex justify-between">
              <p>Limite Utilizado:</p>
              <span>{formatarBRL(limiteUtilizado)}</span>
            </div>

            <div className="flex justify-between">
              <p>Data de Vencimento:</p>
              <span>{formatarData(dataVencimento)}</span>
            </div>

            <div className="flex justify-between">
              <p>Taxa de Juros:</p>
              <span>{taxaJuros !== null ? `${taxaJuros}% a.m` : ""}</span>
            </div>
          </div>
        </div>

        {/* Aviso */}
        <div className="flex justify-center items-center w-full text-center bg-white/10 text-white px-2 py-2 rounded-[10px] transition-all duration-500 ease-in-out border border-white/20 space-x-2 text-xs">
          <MessageSquareWarning className="w-6 h-6 text-white/80" />
          <p>
            Mantenha um bom histórico de pagamentos <br /> para aumentar o seu
            limite no nosso banco
          </p>
        </div>
      </div>
    </main>
  );
};

export default Limite;
