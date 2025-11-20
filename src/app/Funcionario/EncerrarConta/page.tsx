"use client";

import React, { useState } from "react";
import { X, ChevronRight, Check, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Confirmacaof from "@/components/confirmacao";

export default function AberturaConta() {
  const router = useRouter();
  const [step, setStep] = useState<"dados" | "senha">("dados");
  const [senha, setSenha] = useState("");
  const [numeroConta, setNumeroConta] = useState(""); // Para enviar à API
  const [CPF, setCPF] = useState("");
  const [confirmacaoAberta, setConfirmacaoAberta] = useState(false);

  const handleNext = async () => {
    if (step === "dados") {
      if (!numeroConta) {
        alert("Número da conta é obrigatório.");
        return;
      }
      setStep("senha");
    } else {
      if (!senha) {
        alert("Senha é obrigatória.");
        return;
      }

      try {
        const token = localStorage.getItem("token"); 
        if (!token) {
          alert("Token não encontrado. Faça login novamente.");
          return;
        }

        const response = await fetch("/api/funcionario/excluirconta", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ senha, numeroConta }),
        });

        const data = await response.json();

        if (response.ok) {
          setConfirmacaoAberta(true);
        } else {
          alert(data.error || "Erro ao tentar excluir a conta.");
        }
      } catch (error) {
        console.error(error);
        alert("Erro ao tentar excluir a conta.");
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



  return (
    <main className="min-h-screen bg-gradient-to-b from-[#012E4B] to-[#064F75] text-white flex flex-col relative">
      <div className="px-5 py-5">
        <button
          className="absolute top-5 left-5 hover:text-white/70 transition"
          onClick={() => {
            if (step === "senha") setStep("dados");
            else router.back();
          }}
        >
          {step === "senha" ? <ChevronLeft className="w-7 h-7" /> : <X className="w-7 h-7" />}
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
            <div>
              <label className="block text-sm text-white/70">Número da Conta</label>
              <input
                type="text"
                className="w-full bg-transparent border-b border-white/50 text-white outline-none"
                value={numeroConta}
                onChange={(e) => setNumeroConta(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* SENHA */}
        {step === "senha" && (
          <div className="flex justify-center mt-8 w-full px-5">
            <div className="relative w-full max-w-xs">
              <input
                type="password"
                id="senha"
                name="senha"
                placeholder=" "
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="peer w-full bg-transparent border-b border-white/50 p-2 text-white outline-none focus:border-white"
              />
              <label
                htmlFor="senha"
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
        {step === "dados" ? <ChevronRight className="w-6 h-6 text-white" /> : <Check className="w-6 h-6 text-white" />}
      </button>
    </main>
  );
}
