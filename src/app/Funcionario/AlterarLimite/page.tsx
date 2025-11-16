"use client";

import React, { useState } from "react";
import { X, PencilLine, Save, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import LimiteSearch from "@/components/pesquisalimite";

// -------- MÁSCARA CORRIGIDA -------- //
const maskMoney = (v: string | number) => {
  if (!v) return "R$ 0,00";

  const onlyNumbers = String(v).replace(/\D/g, "");
  if (!onlyNumbers) return "R$ 0,00";

  return (Number(onlyNumbers) / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

export default function ConsultarDados() {
  const router = useRouter();

  const [agenciaBusca, setAgenciaBusca] = useState("");
  const [dados, setDados] = useState<any | null>(null);
  const [backup, setBackup] = useState<any | null>(null);
  const [editando, setEditando] = useState(false);

  // -------- DADOS TESTE -------- //
  const contasFake = [
    {
      agencia: "1234-5",
      tipoConta: "Conta Corrente",
      titular: "José Antonio Marcos",
      saldo: "R$ 1.200,00",
      limite: "R$ 500,00",
    },
  ];

  // -------- BUSCA POR AGÊNCIA -------- //
  const handleSearch = (term: string) => {
    setAgenciaBusca(term);

    if (!term) {
      setDados(null);
      return;
    }

    const encontrada = contasFake.find((c) => c.agencia === term);

    if (encontrada) {
      setDados({ ...encontrada });
      setBackup({ ...encontrada });
    } else {
      setDados(null);
    }
  };

  const handleLimpar = () => {
    if (backup) setDados({ ...backup });
    setEditando(false);
  };

  const handleChange = (campo: string, valor: string | number) => {
    if (!dados || !editando) return;
    setDados({ ...dados, [campo]: valor });
  };

  const handleSalvar = () => {
    console.log("Dados salvos:", dados);
    setBackup({ ...dados });
    setEditando(false);
  };

  const handleBack = () => router.back();

  // Valor numérico sem máscara
  const limiteNumber = dados
    ? Number(dados.limite.replace(/\D/g, ""))
    : 0;

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#012E4B] to-[#064F75] text-white flex flex-col">
      <div className="px-5 py-5">
        <button onClick={handleBack} className="hover:text-white/70 transition">
          <X className="w-8 h-8" />
        </button>

        <h1 className="pt-6 text-center text-2xl font-bold">Alterar Limite</h1>

        {/* 🔎 Campo de pesquisa */}
        <LimiteSearch onSearch={handleSearch} />

        {dados ? (
          <>
            {/* BOTÕES */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={editando ? handleSalvar : () => setEditando(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition"
                style={{
                  backgroundColor: editando ? "#42D23A" : "rgba(255,255,255,0.1)",
                  color: "#fff",
                }}
              >
                {editando ? (
                  <>
                    <Save className="w-4 h-4" /> Salvar
                  </>
                ) : (
                  <>
                    <PencilLine className="w-4 h-4" /> Editar
                  </>
                )}
              </button>

              <button
                onClick={handleLimpar}
                disabled={!editando}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-white/20 transition ${
                  editando
                    ? "bg-white/10 text-white/80 hover:text-white"
                    : "bg-white/5 text-white/50 cursor-not-allowed opacity-60"
                }`}
              >
                <RotateCcw className="w-4 h-4" /> Limpar
              </button>
            </div>

            {/* ----------- CARD ----------- */}
            <div className="mt-6 rounded-2xl border border-white/20 bg-white/5 p-5">
              
              {/* Nome + Tipo */}
              <div className="grid grid-cols-2 gap-4 pb-2 border-b border-white/30">
                <div>
                  <label className="block text-xs text-white/60">
                    Nome Completo
                  </label>
                  <p className="text-xs font-semibold">{dados.titular}</p>
                </div>

                <div>
                  <label className="block text-xs text-white/60">
                    Tipo de Conta
                  </label>
                  <p className="text-xs font-semibold">{dados.tipoConta}</p>
                </div>
              </div>

              {/* Limite atual */}
              <div className="py-6 text-center">
                <h2 className="text-sm text-white/70">Limite atual</h2>
                <p className="text-3xl font-bold mt-1">{dados.limite}</p>
              </div>

            {/* RANGE EDITÁVEL */}
            <div className="pt-2">
            <label className="block text-xs text-white/70">
                Alterar Limite
            </label>

            <input
                type="range"
                min="0"
                max="2000000"
                disabled={!editando}
                value={limiteNumber}
                onChange={(e) =>
                handleChange("limite", maskMoney(e.target.value))
                }
                className="w-full mt-3 cursor-pointer"
                style={{
                WebkitAppearance: "none",
                appearance: "none",
                width: "100%",
                height: "8px",
                background: "#026DB1",
                borderRadius: "9999px",
                }}
            />

            <div className="flex justify-between mt-1">
                <span className="text-sm">0</span>
                <span className="text-sm">Máx</span>
            </div>

            {/* ESTILO DO CURSOR (THUMB) */}
            <style>
                {`
                input[type="range"]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 18px;
                    height: 18px;
                    background: white;   /* Sempre branco */
                    border-radius: 9999px;
                    cursor: pointer;
                }

                input[type="range"]::-moz-range-thumb {
                    width: 18px;
                    height: 18px;
                    background: white;   /* Sempre branco */
                    border-radius: 9999px;
                    cursor: pointer;
                }
                `}
            </style>
            </div>
            </div>
          </>
        ) : (
          agenciaBusca && (
            <p className="text-center text-sm text-gray-300 mt-10">
              Nenhum registro encontrado para esta agência.
            </p>
          )
        )}
      </div>
    </main>
  );
}
