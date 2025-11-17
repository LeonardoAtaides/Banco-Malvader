"use client";

import React, { useState, useEffect } from "react";
import { X, ChevronRight, Check, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import Confirmacao from "@/components/confirmacao";
import Decimal from "decimal.js";

const Saque: React.FC = () => {
  const router = useRouter();
  const [step, setStep] = useState<"valor" | "senha">("valor");
  const [valor, setValor] = useState("0,00");
  const [senha, setSenha] = useState("");
  const [confirmacaoAberta, setConfirmacaoAberta] = useState(false);
  const [loadingMensagem, setLoadingMensagem] = useState("");
  const [successMensagem, setSuccessMensagem] = useState("");
  const [saldoConta, setSaldoConta] = useState<number | null>(null);
  const [mostrarSaldo, setMostrarSaldo] = useState(true);

  // Formata valor para BRL
  const formatarBRL = (numero: number | Decimal | null) => {
    if (numero === null) return "0,00";
    const n = numero instanceof Decimal ? numero.toNumber() : numero;
    return n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Gera bolinhas do mesmo tamanho do valor
  const gerarBolinhas = (valor: number | Decimal | null) => {
    if (valor === null) return "•••••";
    const formatado = formatarBRL(valor);
    return "•".repeat(formatado.length);
  };

  // Busca saldo ao montar a página
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

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, "");
    if (!input) input = "0";
    const numero = parseInt(input, 10) / 100;
    setValor(numero.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  };

  const handleSenhaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSenha(e.target.value);
  };

  const handleBack = () => {
    if (step === "senha") {
      setStep("valor");
      setSenha("");
    } else {
      router.back();
    }
  };

  const handleNext = async () => {
    const valorNumerico = parseFloat(valor.replace(/\./g, "").replace(",", "."));
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
      const numero_conta = localStorage.getItem("numero_conta");
      if (!token || !numero_conta) {
        alert("Usuário não autenticado.");
        return;
      }

      setLoadingMensagem("Processando saque...");
      setConfirmacaoAberta(true);

      try {
        const res = await fetch("/api/transacao/saque", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            numero_conta,
            valor: valorNumerico,
            senha,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.error || "Erro ao realizar saque");
          setConfirmacaoAberta(false);
          return;
        }

        setSuccessMensagem("Saque efetuado com sucesso!");
        setSenha("");
        setSaldoConta(data.dados.saldo_atual); // Atualiza saldo
      } catch (err) {
        console.error(err);
        alert("Erro ao processar saque.");
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
        <div className="relative">
          <button className="absolute top-0 left-0 hover:text-white/70 transition" onClick={handleBack}>
            <X className="w-8 h-8" />
          </button>
        </div>

        <h1 className="pt-12 text-center text-2xl font-bold">
          {step === "valor" ? "Qual o valor deseja sacar?" : "Confirme sua senha"}
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

        {step === "senha" && (
          <div className="flex justify-center mt-8 w-full px-5">
            <div className="relative w-full max-w-xs">
              <input
                type="password"
                placeholder=" "
                value={senha}
                onChange={handleSenhaChange}
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

      <button
        className="absolute bottom-8 right-6 bg-transparent border border-white rounded-full p-3 hover:bg-white/10 transition"
        onClick={handleNext}
      >
        {step === "valor" ? <ChevronRight className="w-6 h-6 text-white" /> : <Check className="w-6 h-6 text-white" />}
      </button>
    </main>
  );
};

export default Saque;
