"use client";

import React, { useState } from "react";
import { X, ChevronRight, Check, ChevronDown, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AberturaConta() {
  const router = useRouter();
  const [step, setStep] = useState<"dados" | "senha">("dados");
  const [senha, setSenha] = useState("");
  const [openSelect, setOpenSelect] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nome: "",
    nascimento: "",
    tipoConta: "Conta Corrente (CC)",
    agencia: "",
    cpf: "",
    telefone: "",
    vencimento: "Dia 5",
    manutencao: "",
    endereco: "",
  });

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setOpenSelect(null);
  };

  const handleNext = () => {
    if (step === "dados") {
      setStep("senha");
    } else {
      if (senha === "321") {
        alert("Conta cadastrada com sucesso!");
        router.push("/Cliente");
      } else {
        alert("Senha incorreta. Tente novamente.");
      }
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#012E4B] to-[#064F75] text-white flex flex-col relative">
      {/* Cabeçalho */}
      <div className="px-5 py-5">
        <button
          className="absolute top-5 left-5 hover:text-white/70 transition"
          onClick={() => {
            if (step === "senha") {
              setStep("dados");
            } else {
              router.back();
            }
          }}
        >
          {step === "senha" ? (
            <ChevronLeft className="w-7 h-7" />
          ) : (
            <X className="w-7 h-7" />
          )}
        </button>

        <h1 className="pt-12 text-center text-2xl font-bold">
          {step === "dados" ? "Abertura de Conta" : "Confirme sua senha"}
        </h1>

        {step === "senha" && (
          <h2 className="text-center text-xs font-bold text-white/70">
            digite sua senha para validar a abertura da conta
          </h2>
        )}

        {/* FORMULÁRIO DE DADOS */}
        {step === "dados" && (
          <div className="px-3 mt-8 flex flex-col gap-4 mb-28">
            {/* Nome */}
            <div>
              <label className="block text-sm text-white/70">Nome Completo</label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => handleChange("nome", e.target.value)}
                className="w-full bg-transparent border-b border-white/50 text-white outline-none text-sm"
              />
            </div>

            {/* Data de nascimento */}
            <div>
              <label className="block text-sm text-white/70">Data de Nascimento</label>
              <input
                type="date"
                value={formData.nascimento}
                onChange={(e) => handleChange("nascimento", e.target.value)}
                className="w-full border-b border-white/50 outline-none text-white bg-transparent"
                style={{ colorScheme: "dark" }}
              />
            </div>

            {/* Tipo de conta */}
            <div className="relative">
              <label className="block text-sm text-white/70">Tipo de Conta</label>
              <div
                className="w-full border-b border-white/50 flex justify-between items-center cursor-pointer"
                onClick={() =>
                  setOpenSelect(openSelect === "tipoConta" ? null : "tipoConta")
                }
              >
                <span>{formData.tipoConta}</span>
                <ChevronDown
                  className={`w-4 h-4 text-white transition-transform ${
                    openSelect === "tipoConta" ? "rotate-180" : ""
                  }`}
                />
              </div>

              {openSelect === "tipoConta" && (
                <div className="absolute z-20 w-full mt-1 bg-[#012E4B] rounded-md shadow-md border border-white/20 overflow-hidden">
                  {[
                    "Conta Corrente (CC)",
                    "Conta Poupança (CP)",
                    "Conta Investimento (CI)",
                  ].map((tipo) => (
                    <div
                      key={tipo}
                      onClick={() => handleChange("tipoConta", tipo)}
                      className={`px-3 py-2 text-sm flex justify-between items-center hover:bg-white/10 cursor-pointer ${
                        formData.tipoConta === tipo ? "text-white" : "text-white/80"
                      }`}
                    >
                      <span>{tipo}</span>
                      {formData.tipoConta === tipo && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Agência */}
            <div>
              <label className="block text-sm text-white/70">Agência</label>
              <input
                type="text"
                required
                value={formData.agencia}
                onChange={(e) => handleChange("agencia", e.target.value)}
                className="w-full bg-transparent border-b border-white/50 text-white outline-none"
              />
            </div>

            {/* CPF */}
            <div>
              <label className="block text-sm text-white/70">CPF</label>
              <input
                type="text"
                required
                value={formData.cpf}
                maxLength={14}
                onChange={(e) => handleChange("cpf", e.target.value)}
                className="w-full bg-transparent border-b border-white/50 text-white outline-none"
              />
            </div>

            {/* Telefone */}
            <div>
              <label className="block text-sm text-white/70">Telefone</label>
              <input
                type="text"
                required
                value={formData.telefone}
                onChange={(e) => handleChange("telefone", e.target.value)}
                className="w-full bg-transparent border-b border-white/50 text-white outline-none"
              />
            </div>

            {/* Vencimento */}
            <div className="relative">
              <label className="block text-sm text-white/70">Data de Vencimento</label>
              <div
                className="w-full border-b border-white/50 flex justify-between items-center cursor-pointer"
                onClick={() =>
                  setOpenSelect(openSelect === "vencimento" ? null : "vencimento")
                }
              >
                <span>{formData.vencimento}</span>
                <ChevronDown
                  className={`w-4 h-4 text-white transition-transform ${
                    openSelect === "vencimento" ? "rotate-180" : ""
                  }`}
                />
              </div>

              {openSelect === "vencimento" && (
                <div className="absolute z-20 w-full mt-1 bg-[#012E4B] rounded-md shadow-md border border-white/20 overflow-hidden">
                  {["Dia 5", "Dia 10", "Dia 15"].map((dia) => (
                    <div
                      key={dia}
                      onClick={() => handleChange("vencimento", dia)}
                      className={`px-3 py-2 text-sm flex justify-between items-center hover:bg-white/10 cursor-pointer ${
                        formData.vencimento === dia ? "text-white" : "text-white/80"
                      }`}
                    >
                      <span>{dia}</span>
                      {formData.vencimento === dia && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Taxa */}
            <div>
              <label className="block text-sm text-white/70">Taxa de Manutenção</label>
              <input
                type="text"
                value={formData.manutencao}
                onChange={(e) => handleChange("manutencao", e.target.value)}
                className="w-full bg-transparent border-b border-white/50 text-white outline-none"
              />
            </div>

            {/* Endereço */}
            <div>
              <label className="block text-sm text-white/70">Endereço Completo</label>
              <input
                type="text"
                placeholder="Rua, número, complemento..."
                value={formData.endereco}
                onChange={(e) => handleChange("endereco", e.target.value)}
                className="w-full bg-transparent border-b border-white/50 text-white outline-none"
              />
            </div>
          </div>
        )}
        {/* SENHA DE CONFIRMAÇÃO*/}
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
                className="peer w-full bg-transparent border-b border-white/50  text-white outline-none focus:border-white"
            />
            <label
                htmlFor="senha"
                className="absolute left-2 to text-white text-sm transition-all
                        peer-placeholder-shown:to peer-placeholder-shown:text-white/50 peer-placeholder-shown:text-base
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
