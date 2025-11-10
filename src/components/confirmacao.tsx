"use client";

import React, { useEffect, useState } from "react";
import { Check } from "lucide-react";

interface ConfirmacaoProps {
  mensagemLoading?: string;
  mensagemSuccess?: string;
  tempoLoading?: number;
  onComplete?: () => void;
}

const Confirmacao: React.FC<ConfirmacaoProps> = ({
  mensagemLoading = "Processando...",
  mensagemSuccess = "Operação realizada com sucesso!",
  tempoLoading = 2000,
  onComplete,
}) => {
  const [step, setStep] = useState<"loading" | "success">("loading");
  const [animarSucesso, setAnimarSucesso] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStep("success");
      setTimeout(() => setAnimarSucesso(true), 150);
    }, tempoLoading);

    const completeTimer = setTimeout(() => {
      if (onComplete) onComplete();
    }, tempoLoading + 2300);

    return () => {
      clearTimeout(timer);
      clearTimeout(completeTimer);
    };
  }, [tempoLoading, onComplete]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#012E4B] to-[#064F75] text-white flex-col overflow-visible p-10">
      {/* Loading */}
      {step === "loading" && (
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 border-4 border-white/30 border-t-white rounded-full animate-spin mb-6"></div>
          <p className="text-lg font-medium text-center animate-pulse">
            {mensagemLoading}
          </p>
        </div>
      )}

      {/* Sucesso */}
      {step === "success" && (
        <div
          className={`flex flex-col items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            animarSucesso ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
          style={{ overflow: "visible" }}
        >
          {/* Círculo verde (agora com espaço garantido) */}
          <div
            className={`relative flex items-center justify-center w-24 h-24 rounded-full bg-[#42D23A] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              animarSucesso ? "scale-100" : "scale-75"
            }`}
            style={{
              transformOrigin: "center",
              marginBottom: "1.5rem",
              boxSizing: "content-box",
              animation: animarSucesso ? "pop 0.4s ease-out 0.7s both" : "none",
            }}
          >
            <Check
              className="text-white"
              style={{
                width: 46,
                height: 46,
                opacity: animarSucesso ? 1 : 0,
                transform: animarSucesso
                  ? "scale(1)"
                  : "scale(0.6)",
                transition:
                  "opacity 0.4s ease 0.5s, transform 0.5s cubic-bezier(0.16,1,0.3,1) 0.5s",
              }}
            />
          </div>

          {/* Texto de sucesso */}
          <p
            className={`text-xl font-semibold text-center transition-all duration-700 ${
              animarSucesso
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-3"
            }`}
          >
            {mensagemSuccess}
          </p>
        </div>
      )}

      {/* Animação do “pop” */}
      <style jsx>{`
        @keyframes pop {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default Confirmacao;
