"use client";

import React, { useState, useEffect } from "react";
import { X, ChevronRight, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import Confirmacao from "@/components/confirmacao";
import Decimal from "decimal.js";

const Saque: React.FC = () => {
  const router = useRouter();
  const [step, setStep] = useState<"valor" | "confirmacao">("valor");
  const [valor, setValor] = useState("0,00");
  const [confirmacaoAberta, setConfirmacaoAberta] = useState(false);
  const [mostrarSaldo, setMostrarSaldo] = useState(true);
  const [loadingMensagem, setLoadingMensagem] = useState("");
  const [successMensagem, setSuccessMensagem] = useState("");
  const [saldoConta, setSaldoConta] = useState<number | null>(null);

  // Busca saldo atual do usuário
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    async function fetchSaldo() {
      try {
        const response = await fetch("/api/conta/saldo", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          console.error("Erro ao buscar saldo");
          return;
        }

        const data = await response.json();
        setSaldoConta(Number(data.saldo));
      } catch (error) {
        console.error("Erro na requisição:", error);
      }
    }

    fetchSaldo();
  }, []);

  const handleBack = () => {
    if (step === "confirmacao") {
      setStep("valor");
    } else {
      router.back();
    }
  };

  // Formata valor para BRL
  const formatarBRL = (valor: number | Decimal | null) => {
    if (valor === null) return "0,00";
    const numero = valor instanceof Decimal ? valor.toNumber() : valor;
    return numero.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Gera bolinhas com o mesmo tamanho do valor real
  const gerarBolinhas = (valor: number | Decimal | null) => {
    if (valor === null) return "•••••";
    const formatado = formatarBRL(valor);
    return "•".repeat(formatado.length);
  };

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, "");
    if (input === "") input = "0";
    const numero = (parseInt(input, 10) / 100).toFixed(2);
    setValor(numero.replace(".", ","));
  };

  const handleNext = async () => {
    const valorDecimal = new Decimal(valor.replace(",", "."));
    if (valorDecimal.lte(0)) {
      alert("Digite um valor válido maior que zero.");
      return;
    }

    setStep("confirmacao");
    setLoadingMensagem("Processando saque...");
    setConfirmacaoAberta(true);

    try {
      const token = localStorage.getItem("token");
      const numero_conta = localStorage.getItem("numero_conta");
      if (!token || !numero_conta) {
        alert("Usuário não autenticado.");
        setConfirmacaoAberta(false);
        setStep("valor");
        return;
      }

      const res = await fetch("/api/transacao/saque", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          numero_conta,
          valor: parseFloat(valorDecimal.toFixed(2)),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Erro ao realizar saque");
        setConfirmacaoAberta(false);
        setStep("valor");
        return;
      }

      setSuccessMensagem("Saque efetuado com sucesso!");
      setSaldoConta(data.dados.saldo_atual); // Atualiza saldo após saque
    } catch (err) {
      console.error(err);
      alert("Erro ao processar saque.");
      setConfirmacaoAberta(false);
      setStep("valor");
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
        <div className="relative">
          <button className="absolute top-0 left-0 hover:text-white/70 transition" onClick={handleBack}>
            <X className="w-8 h-8" />
          </button>
        </div>

        <h1 className="pt-12 text-center text-2xl font-bold whitespace-pre-line">
          {step === "valor" ? "Qual o valor que você \n deseja sacar?" : "Confirmando saque..."}
        </h1>

        {step === "valor" && (
          <div className="flex flex-col justify-center items-center mt-8 space-y-6">
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

            <div className="flex justify-start items-center text-sm text-white/80 space-x-2 w-full max-w-[300px]">
              <button onClick={() => setMostrarSaldo(!mostrarSaldo)} className="focus:outline-none hover:text-white transition">
                {mostrarSaldo ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              <span>Saldo disponível</span>
              <span className="ml-2 font-semibold text-white inline-block text-right min-w-[70px]">
                {mostrarSaldo ? `R$ ${formatarBRL(saldoConta)}` : gerarBolinhas(saldoConta)}
              </span>
            </div>

            <div className="flex justify-center items-center w-80 text-center bg-white/10 text-white px-3 py-3 rounded-[10px] transition-all duration-500 ease-in-out border border-white/20 space-x-2">
              <AlertTriangle className="w-10 h-10 text-white/80" />
              <p>Saques acima de R$ 1.000,00 possuem taxa de R$ 5,00</p>
            </div>
          </div>
        )}
      </div>

      <button
        className="absolute bottom-8 right-6 bg-transparent border border-white rounded-full p-3 hover:bg-white/10 transition"
        onClick={handleNext}
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>
    </main>
  );
};

export default Saque;
