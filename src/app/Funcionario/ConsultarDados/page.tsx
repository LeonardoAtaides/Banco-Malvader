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
import SearchBar from "@/components/pesquisadados";

export default function ConsultarConta() {
  const router = useRouter();
  const [cpfBusca, setCpfBusca] = useState("");
  const [conta, setConta] = useState<any | null>(null);
  const [editando, setEditando] = useState(false);
  const [openSelect, setOpenSelect] = useState<string | null>(null);
  const [backupConta, setBackupConta] = useState<any | null>(null);

  // Base simulada
  const contasFake = [
    {
      cpf: "123.168.178-09",
      tipoConta: "Conta Corrente (CC)",
      numeroConta: "1234-5",
      titular: "José Antonio Marcos",
      saldo: "R$ 1200,00",
      limite: "R$ 5000,00",
      vencimento: "Dia 5",
      status: "Ativa",
      abertura: "15/01/2025",
    },
  ];

  const handleSearch = (term: string) => {
    setCpfBusca(term);
    const encontrada = contasFake.find((c) => c.cpf === term);
    if (encontrada) {
      setConta({ ...encontrada });
      setBackupConta({ ...encontrada }); // guarda cópia original
    } else {
      setConta(null);
    }
  };

  const handleChange = (campo: string, valor: string) => {
    if (!conta || !editando) return;
    setConta({ ...conta, [campo]: valor });
  };

  const handleBack = () => router.back();

  const handleLimpar = () => {
    if (backupConta) setConta({ ...backupConta }); // restaura estado anterior
    setEditando(false);
    setOpenSelect(null);
  };

  const handleSalvar = () => {
    console.log("Dados salvos:", conta);
    setBackupConta({ ...conta }); // atualiza backup com os novos dados
    setEditando(false);
    setOpenSelect(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#012E4B] to-[#064F75] text-white flex flex-col">
      <div className="px-5 py-5">
        {/* Voltar */}
        <button onClick={handleBack} className="hover:text-white/70 transition">
          <X className="w-8 h-8" />
        </button>

        <h1 className="pt-6 text-center text-2xl font-bold">
          Consultar Conta
        </h1>

        {/* Campo CPF */}
        <SearchBar
          onSearch={(term) => handleSearch(term)}
          onClear={handleLimpar}
        />

        {conta ? (
          <>
            {/* Botões fora do formulário */}
<div className="flex justify-end gap-3 mt-6">
  {/* Botão Editar / Salvar */}
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

  {/* Botão Limpar */}
  <button
    onClick={handleLimpar}
    disabled={!editando}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-white/20 transition
      ${
        editando
          ? "bg-white/10 text-white/80 hover:text-white"
          : "bg-white/5 text-white/50 cursor-not-allowed opacity-60"
      }`}
  >
    <RotateCcw className="w-4 h-4" /> Limpar
  </button>
</div>

            {/* Formulário */}
            <div className="mt-6 p-5 rounded-2xl border border-white/20 bg-white/5">
              <div className="flex flex-col gap-4">
                {/* Tipo de Conta */}
                <div>
                  <label className="block text-sm text-white/70">
                    Tipo de Conta
                  </label>
                  <input
                    type="text"
                    disabled
                    value={conta.tipoConta}
                    className="w-full bg-transparent border-b border-white/30 outline-none text-sm text-white/70"
                  />
                </div>

                {/* Número da Conta */}
                <div>
                  <label className="block text-sm text-white/70">
                    Número da Conta
                  </label>
                  <input
                    type="text"
                    disabled
                    value={conta.numeroConta}
                    className="w-full bg-transparent border-b border-white/30 outline-none text-sm text-white/70"
                  />
                </div>

                {/* Nome do Titular */}
                <div>
                  <label className="block text-sm text-white/70">
                    Nome do Titular
                  </label>
                  <input
                    type="text"
                    disabled
                    value={conta.titular}
                    className="w-full bg-transparent border-b border-white/30 outline-none text-sm text-white/70"
                  />
                </div>

                {/* CPF */}
                <div>
                  <label className="block text-sm text-white/70">CPF</label>
                  <input
                    type="text"
                    disabled
                    value={conta.cpf}
                    className="w-full bg-transparent border-b border-white/30 outline-none text-sm text-white/70"
                  />
                </div>

                {/* Saldo Atual */}
                <div>
                  <label className="block text-sm text-white/70">
                    Saldo Atual
                  </label>
                  <input
                    type="text"
                    disabled
                    value={conta.saldo}
                    className="w-full bg-transparent border-b border-white/30 outline-none text-sm text-white/70"
                  />
                </div>

                {/* Limite Disponível */}
                <div>
                  <label className="block text-sm text-white/70">
                    Limite Disponível
                  </label>
                  <input
                    type="text"
                    disabled={!editando}
                    value={conta.limite}
                    onChange={(e) => handleChange("limite", e.target.value)}
                    className={`w-full bg-transparent border-b border-white/30 outline-none text-sm transition ${
                      editando ? "text-white" : "text-white/70"
                    }`}
                  />
                </div>

                {/* Data de Vencimento */}
                <div className="relative">
                  <label className="block text-sm text-white/70">
                    Data de Vencimento
                  </label>
                  <div
                    className={`w-full border-b border-white/30 flex justify-between items-center transition ${
                      editando
                        ? "cursor-pointer text-white"
                        : "text-white/70 cursor-not-allowed"
                    }`}
                    onClick={() =>
                      editando &&
                      setOpenSelect(
                        openSelect === "vencimento" ? null : "vencimento"
                      )
                    }
                  >
                    <span>{conta.vencimento}</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        openSelect === "vencimento" ? "rotate-180" : ""
                      }`}
                    />
                  </div>

                  {openSelect === "vencimento" && editando && (
                    <div className="absolute z-20 w-full mt-1 bg-[#012E4B] rounded-md shadow-md border border-white/20 overflow-hidden">
                      {["Dia 5", "Dia 10", "Dia 15"].map((dia) => (
                        <div
                          key={dia}
                          onClick={() => {
                            handleChange("vencimento", dia);
                            setOpenSelect(null);
                          }}
                          className={`px-3 py-2 text-sm flex justify-between items-center hover:bg-white/10 cursor-pointer ${
                            conta.vencimento === dia
                              ? "text-white"
                              : "text-white/80"
                          }`}
                        >
                          <span>{dia}</span>
                          {conta.vencimento === dia && (
                            <Check className="w-4 h-4 text-white" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm text-white/70">Status</label>
                  <input
                    type="text"
                    disabled
                    value={conta.status}
                    className={`w-full bg-transparent border-b border-white/30 outline-none text-sm ${
                      conta.status === "Ativa"
                        ? "text-[#42D23A]"
                        : "text-red-400"
                    }`}
                  />
                </div>

                {/* Data de Abertura */}
                <div>
                  <label className="block text-sm text-white/70">
                    Data de Abertura
                  </label>
                  <input
                    type="text"
                    disabled
                    value={conta.abertura}
                    className="w-full bg-transparent border-b border-white/30 outline-none text-sm text-white/70"
                  />
                </div>
              </div>
            </div>
          </>
        ) : (
          cpfBusca && (
            <p className="text-center text-sm text-gray-300 mt-10">
              Nenhuma conta encontrada para o CPF informado.
            </p>
          )
        )}
      </div>
    </main>
  );
}
