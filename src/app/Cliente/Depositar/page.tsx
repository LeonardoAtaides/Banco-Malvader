"use client";

import React, { useState } from "react";
import { X, ChevronRight, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import Confirmacao from "@/components/confirmacao";

const Depositar: React.FC = () => {
  const router = useRouter();
  const [step, setStep] = useState<"valor" | "senha">("valor");
  const [valor, setValor] = useState("0,00");
  const [senha, setSenha] = useState("");
  const [confirmacaoAberta, setConfirmacaoAberta] = useState(false);
  const [loadingMensagem, setLoadingMensagem] = useState("");
  const [successMensagem, setSuccessMensagem] = useState("");

  const handleBack = () => {
    if (step === "senha") {
      setStep("valor");
      setSenha("");
    } else {
      router.back();
    }
  };

  const formatarValor = (numero: number) => {
    return numero.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, "");
    if (!input) input = "0";

    const numero = parseInt(input, 10) / 100;
    setValor(formatarValor(numero));
  };

  const handleSenhaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSenha(e.target.value);
  };

  const handleNext = async () => {
    const valorNumerico = parseFloat( valor.replace(/\./g, "").replace(",", ".")
    );

    if (step === "valor") {
      if (isNaN(valorNumerico) || valorNumerico <= 0) {
        alert("Digite um valor válido maior que zero.");
        return;
      }
      setStep("senha");
    } else {
      if (!senha) {
        alert("Digite sua senha para confirmar.");
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        alert("Usuário não autenticado.");
        return;
      }

      setLoadingMensagem("Processando depósito...");
      setConfirmacaoAberta(true);

      try {
        const res = await fetch("/api/transacao/deposito", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            valor: valorNumerico,
            senha,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.error || "Erro ao realizar depósito");
          setConfirmacaoAberta(false);
          return;
        }

        setSuccessMensagem("Depósito efetuado com sucesso!");
        setSenha("");
      } catch (err) {
        console.error(err);
        alert("Erro ao processar depósito.");
        setConfirmacaoAberta(false);
      }
    }
  };

  if (confirmacaoAberta) {
    return (
      <Confirmacao
        mensagemLoading={loadingMensagem}
        mensagemSuccess={successMensagem}
        tempoLoading={2000}
        onComplete={() => router.push("/Cliente")}
      />
    );
  }

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-[#012E4B] to-[#064F75] text-white flex flex-col">
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

        <h1 className="pt-12 text-center text-2xl font-bold">
          {step === "valor" ? "Qual o valor que deseja depositar?" : "Confirme sua senha"}
        </h1>

        {/* Campo de valor */}
        {step === "valor" && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center text-2xl font-medium border-b border-white/50 pb-2 w-75 justify-center">
              <span className="text-white mr-1 select-none">R$</span>
              <input
                type="text"
                inputMode="numeric"
                value={valor}
                onChange={handleValorChange}
                className="bg-transparent text-white text-left w-full outline-none caret-transparent"
              />
            </div>
          </div>
        )}

        {/* Campo de senha */}
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
                onChange={handleSenhaChange}
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

      {/* Botão de avançar */}
      <button
        className="absolute bottom-8 right-6 bg-transparent border border-white rounded-full p-3 hover:bg-white/10 transition"
        onClick={handleNext}
      >
        {step === "valor" ? (
          <ChevronRight className="w-6 h-6 text-white" />
        ) : (
          <Check className="w-6 h-6 text-white" />
        )}
      </button>
    </main>
  );
};

export default Depositar;
