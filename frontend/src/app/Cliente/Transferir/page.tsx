"use client";

import React, { useState } from "react";
import { X, ChevronRight, Check, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import Confirmacao from "@/components/confirmacao";

const Transferir: React.FC = () => {
  const router = useRouter();
  const [step, setStep] = useState<"conta" | "valor" | "senha">("conta");
  const [conta, setConta] = useState("");
  const [valor, setValor] = useState("0,00");
  const [senha, setSenha] = useState("");
  const [confirmacaoAberta, setConfirmacaoAberta] = useState(false);
  const [mostrarSaldo, setMostrarSaldo] = useState(true);

  const senhaPadrao = "123";

  const handleBack = () => {
    if (step === "senha") {
      setStep("valor");
      setSenha("");
    } else if (step === "valor") {
      setStep("conta");
    } else {
      router.back();
    }
  };

  // Campo  com máscara e limite de caracteres
  const handleContaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, ""); // remove tudo que não é número

    if (input.length > 6) input = input.slice(0, 6); // limita a 6 números

    // adiciona o hífen automaticamente
    if (input.length > 5) {
      input = input.slice(0, 5) + "-" + input.slice(5);
    }

    setConta(input);
  };

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, "");
    if (input === "") input = "0";
    const numero = (parseInt(input, 10) / 100).toFixed(2);
    setValor(numero.replace(".", ","));
  };

  const handleSenhaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSenha(e.target.value);
  };

  const handleNext = () => {
    if (step === "conta") {
      if (conta.trim().length < 7) {
        alert("Digite um número de conta válido (ex: 12345-6).");
        return;
      }
      setStep("valor");
      return;
    }

    if (step === "valor") {
      const valorNumerico = parseFloat(valor.replace(",", "."));
      if (isNaN(valorNumerico) || valorNumerico <= 0) {
        alert("Digite um valor válido maior que zero.");
        return;
      }
      setStep("senha");
      return;
    }

    if (step === "senha") {
      if (senha === "") {
        alert("Digite sua senha para confirmar.");
        return;
      }
      if (senha !== senhaPadrao) {
        alert("Senha incorreta.");
        return;
      }
      setConfirmacaoAberta(true);
    }
  };

  if (confirmacaoAberta) {
    return (
      <Confirmacao
        mensagemLoading="Processando transferência..."
        mensagemSuccess="Transferência efetuada com sucesso!"
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

        <h1 className="pt-12 text-center text-2xl font-bold whitespace-pre-line">
          {step === "conta"
            ? "Para qual conta você deseja transferir?"
            : step === "valor"
            ? "Qual o valor que você\n deseja transferir?"
            : "Confirme sua senha"}
        </h1>

        {/* Campo da conta */}
        {step === "conta" && (
          <div className="flex justify-center mt-8 w-full px-5">
            <div className="relative w-full max-w-xs">
              <input
                type="text"
                id="conta"
                name="conta"
                placeholder=" "
                required
                value={conta}
                onChange={handleContaChange}
                maxLength={7} // garante que o usuário não digite mais que 7 caracteres
                className="peer w-full bg-transparent border-b border-white/50 p-2 text-white outline-none focus:border-white"
              />
              <label
                htmlFor="conta"
                className="absolute left-2 top-2 text-white text-sm transition-all
                           peer-placeholder-shown:top-2 peer-placeholder-shown:text-white/50 peer-placeholder-shown:text-base
                           peer-focus:-top-4 peer-focus:text-white peer-focus:text-sm
                           peer-valid:-top-4 peer-valid:text-white peer-valid:text-sm"
              >
                N° da Conta
              </label>
            </div>
          </div>
        )}

        {/* Campo de valor */}
        {step === "valor" && (
          <div className="flex flex-col justify-center items-center mt-8 space-y-6">
            {/* Campo de valor */}
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

            {/* Saldo disponível */}
            <div className="flex justify-start items-center text-sm text-white/80 space-x-2 w-full max-w-[300px]">
              <button
                onClick={() => setMostrarSaldo(!mostrarSaldo)}
                className="focus:outline-none hover:text-white transition"
              >
                {mostrarSaldo ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
              <span>Saldo disponível</span>
              <span
                className="ml-2 font-semibold text-white inline-block text-right min-w-[70px]"
              >
                {mostrarSaldo ? "R$ 20,00" : "••••••"}
              </span>
            </div>

            {/* Aviso de taxa */}
            <div className="flex justify-center items-center w-80 text-center bg-white/10 text-white px-3 py-3 rounded-[10px] transition-all duration-500 ease-in-out border border-white/20 space-x-2">
              <AlertTriangle className="w-10 h-10 text-white/80" />
              <p>Transferências acima de R$ 5.000,00 possuem taxa de R$ 10,00</p>
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

      {/* Botão absoluto */}
      <button
        className="absolute bottom-8 right-6 bg-transparent border border-white rounded-full p-3 hover:bg-white/10 transition"
        onClick={handleNext}
      >
        {step === "senha" ? (
          <Check className="w-6 h-6 text-white" />
        ) : (
          <ChevronRight className="w-6 h-6 text-white" />
        )}
      </button>
    </main>
  );
};

export default Transferir;
