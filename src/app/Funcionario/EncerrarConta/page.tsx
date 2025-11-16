"use client";

import React, { useState } from "react";
import { X, ChevronRight, Check, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Confirmacaof from "@/components/confirmacao";

export default function AberturaConta() {
  const router = useRouter();
  const [step, setStep] = useState<"dados" | "senha">("dados");
  const [senha, setSenha] = useState("");
  const [agencia, setAgencia] = useState("");
  const [CPF, setCPF] = useState("");
  const [confirmacaoAberta, setConfirmacaoAberta] = useState(false);

  // Validação e avanço
  const handleNext = () => {
    if (step === "dados") {
      if (!agencia.trim() || !CPF.trim()) {
        alert("Por favor, preencha todos os campos antes de continuar.");
        return;
      }
      setStep("senha");
    } else {
      if (senha === "321") {
        setConfirmacaoAberta(true);
      } else {
        alert("Senha incorreta. Tente novamente.");
      }
    }
  };

  if (confirmacaoAberta) {
    return (
      <Confirmacaof
        mensagemLoading="Encerrando Conta"
        mensagemSuccess="Conta Encerrada com Sucesso!"
        tempoLoading={2000}
        onComplete={() => router.push("/Funcionario")}
      />
    );
  }

  // Máscara Agência
  const handleContaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, "");
    if (input.length > 6) input = input.slice(0, 6);
    if (input.length > 5) {
      input = input.slice(0, 5) + "-" + input.slice(5);
    }
    setAgencia(input);
  };

  // Máscara CPF
  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");

    if (value.length > 9) {
      value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{0,2}).*/, "$1.$2.$3-$4");
    } else if (value.length > 6) {
      value = value.replace(/^(\d{3})(\d{3})(\d{0,3}).*/, "$1.$2.$3");
    } else if (value.length > 3) {
      value = value.replace(/^(\d{3})(\d{0,3}).*/, "$1.$2");
    }

    setCPF(value);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#012E4B] to-[#064F75] text-white flex flex-col relative">
      {/* Cabeçalho */}
      <div className="px-5 py-5">
        <button
          className="absolute top-5 left-5 hover:text-white/70 transition"
          onClick={() => {
            if (step === "senha") setStep("dados");
            else router.back();
          }}
        >
          {step === "senha" ? (
            <ChevronLeft className="w-7 h-7" />
          ) : (
            <X className="w-7 h-7" />
          )}
        </button>

        <h1 className="pt-12 text-center text-2xl font-bold">
          {step === "dados" ? "Encerrar Conta" : "Confirme sua senha"}
        </h1>

        {step === "senha" && (
          <h2 className="text-center text-xs font-bold text-white/70 mt-[-2px]">
            digite sua senha para encerrar a conta
          </h2>
        )}

        {/* FORMULÁRIO DE DADOS */}
        {step === "dados" && (
          <div className="px-3 mt-8 flex flex-col gap-4 mb-28">
            {/* CPF */}
            <div>
              <label className="block text-sm text-white/70">CPF do cliente</label>
              <input
                type="text"
                value={CPF}
                maxLength={14}
                onChange={handleCPFChange}
                className="w-full bg-transparent border-b border-white/50 text-white outline-none"
              />
            </div>

            {/* Agência */}
            <div>
              <label className="block text-sm text-white/70">Agência</label>
              <input
                type="text"
                value={agencia}
                onChange={handleContaChange}
                className="w-full bg-transparent border-b border-white/50 text-white outline-none"
              />
            </div>
          </div>
        )}

        {/* SENHA */}
        {step === "senha" && (
          <div className="flex justify-center mt-[18px] w-full px-5">
            <div className="relative w-full max-w-xs">
              <input
                type="password"
                placeholder=" "
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="peer w-full bg-transparent border-b border-white/50 p-2 text-white outline-none focus:border-white"
              />
              <label
                className="absolute left-2 top-2 text-white text-sm transition-all
                  peer-placeholder-shown:top-2 peer-placeholder-shown:text-white/50 peer-placeholder-shown:text-base
                  peer-focus:-top-4 peer-focus:text-white peer-focus:text-sm
                  peer-valid:-top-4 peer-valid:text-white peer-valid:text-sm"
              >
                Senha
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Botão flutuante */}
      <button
        className="absolute bottom-3 right-6 bg-transparent border border-white rounded-full p-3 hover:bg-white/10 transition"
        onClick={handleNext}
      >
        {step === "dados" ? (
          <ChevronRight className="w-6 h-6 text-white" />
        ) : (
          <Check className="w-6 h-6 text-white" />
        )}
      </button>
    </main>
  );
}
