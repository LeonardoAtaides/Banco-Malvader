"use client";

import React, { useState } from "react";
import {
  X,
  ChevronDown,
  Check,
  PencilLine,
  Save,
  RotateCcw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import LimiteSearch from "@/components/pesquisalimite";

// ----------- Máscaras ----------- //
const maskMoney = (v: string) => {
  if (!v) return "";
  v = v.replace(/\D/g, "");
  if (!v) return "";
  return (Number(v) / 100).toLocaleString("pt-BR", {
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
  const [openSelect, setOpenSelect] = useState<string | null>(null);

  // -------- DADOS FAKE ---------- //
  const contasFake = [
    {
      agencia: "1234-5",
      tipoConta: "Conta Corrente (CC)",
      numeroConta: "98765-1",
      titular: "José Antonio Marcos",
      cpf: "000.000.000-00",
      saldo: "R$ 1.200,00",
      limite: "R$ 5.000,00",
      vencimento: "Dia 5",
      status: "Ativa",
      abertura: "15/01/2025",
    },
  ];

  // -------- Busca usando APENAS a agência -------- //
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
    setOpenSelect(null);
  };

  const handleChange = (campo: string, valor: string) => {
    if (!dados || !editando) return;
    setDados({ ...dados, [campo]: valor });
  };

  const handleBack = () => router.back();

  const handleSalvar = () => {
    console.log("Dados salvos:", dados);
    setBackup({ ...dados });
    setEditando(false);
    setOpenSelect(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#012E4B] to-[#064F75] text-white flex flex-col">
      <div className="px-5 py-5">
        <button onClick={handleBack} className="hover:text-white/70 transition">
          <X className="w-8 h-8" />
        </button>

        <h1 className="pt-6 text-center text-2xl font-bold">Alterar Limite</h1>

        {/* 🔎 Usa o SEU componente de pesquisa */}
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

            {/* NOVO CARD (IGUAL DA IMAGEM) */}
            <div className="mt-6 rounded-2xl border border-white/20 bg-white/5 p-5">
              {/* Topo com Nome + Tipo Conta */}
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

              {/* Limite Atual */}
              <div className="py-6 text-center">
                <h2 className="text-sm text-white/70">Limite atual</h2>
                <p className="text-3xl font-bold mt-1">{dados.limite}</p>
              </div>

              {/* Slider de aumento */}
              <div className="pt-2">
                <label className="block text-xs text-white/70">
                  Alterar Limite
                </label>

                <input
                  type="range"
                  min="0"
                  max="20000"
                  disabled={!editando}
                  value={parseInt(dados.limite.replace(/\D/g, ""))}
                  onChange={(e) =>
                    handleChange("limite", maskMoney(e.target.value))
                  }
                  className="w-full mt-3 accent-white"
                />
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
