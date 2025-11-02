"use client";

import React, { useEffect, useState } from "react";
import { Check } from "lucide-react";

interface ConfirmacaoProps {
  mensagemLoading?: string;
  mensagemSuccess?: string;
  tempoLoading?: number; // em ms
  onComplete?: () => void;
}

const Confirmacao: React.FC<ConfirmacaoProps> = ({
  mensagemLoading = "Quase lá...",
  mensagemSuccess = "Operação efetuada com sucesso!",
  tempoLoading = 2000,
  onComplete,
}) => {
  const [step, setStep] = useState<"loading" | "success">("loading");

  useEffect(() => {
    const timer = setTimeout(() => {
      setStep("success");
    }, tempoLoading);

    const completeTimer = setTimeout(() => {
      if (onComplete) onComplete();
    }, tempoLoading + 1500); // 1.5s depois do sucesso

    return () => {
      clearTimeout(timer);
      clearTimeout(completeTimer);
    };
  }, [tempoLoading, onComplete]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#012E4B] to-[#064F75] text-white flex-col">
      {step === "loading" && (
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 border-4 border-white border-t-transparent rounded-full animate-spin mb-6"></div>
          <p className="text-xl font-medium text-center">{mensagemLoading}</p>
        </div>
      )}

      {step === "success" && (
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 flex items-center justify-center mb-6">
            <Check className="w-16 h-16 text-green-500 animate-bounce" />
          </div>
          <p className="text-xl font-medium text-center">{mensagemSuccess}</p>
        </div>
      )}
    </div>
  );
};

export default Confirmacao;
