"use client";

import React, { useState } from "react";
import { X, ChevronRight, Check, ChevronDown, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Confirmacaof from "@/components/confirmacao";

export default function NovoFuncionario() {
  const router = useRouter();
  const [step, setStep] = useState<"dados" | "senha">("dados");

  const [senha, setSenha] = useState("");
  const [CPF, setCPF] = useState("");
  const [telefone, setTelefone] = useState("");
  const [openSelect, setOpenSelect] = useState<string | null>(null);
  const [confirmacaoAberta, setConfirmacaoAberta] = useState(false);

  const [formData, setFormData] = useState({
    nome: "",
    nascimento: "",
    Cargo: "Gerente",
    endereco: "",
  });

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setOpenSelect(null);
  };

  const handleNext = () => {
    if (step === "dados") {
      if (
        !formData.nome.trim() ||
        !formData.nascimento ||
        !formData.Cargo.trim() ||
        !CPF.trim() ||
        !telefone.trim() ||
        !formData.endereco.trim()
      ) {
        alert("Por favor, preencha todos os campos antes de continuar.");
        return;
      }
      setStep("senha");
    } else {
      if (senha === "321") {
        setConfirmacaoAberta(true);
      } else {
        alert("Senha incorreta.");
      }
    }
  };

  if (confirmacaoAberta) {
    return (
      <Confirmacaof
        mensagemLoading="Cadastrando Funcionário"
        mensagemSuccess="Cadastro Realizado com Sucesso!"
        tempoLoading={2000}
        onComplete={() => router.push("/Funcionario")}
      />
    );
  }

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

  // Máscara Telefone
  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");

    if (value.length > 10) {
      value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
    } else if (value.length > 6) {
      value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
    } else if (value.length > 2) {
      value = value.replace(/^(\d{2})(\d{0,5}).*/, "($1) $2");
    } else {
      value = value.replace(/^(\d{0,2}).*/, "($1");
      if (value === "(") value = "";
    }

    setTelefone(value);
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
          {step === "dados" ? "Novo Funcionário" : "Confirme sua senha"}
        </h1>

        {step === "senha" && (
          <h2 className="text-center text-xs font-bold text-white/70 mt-[-2px]">
            Digite sua senha para validar o cadastro
          </h2>
        )}

        {/* FORMULÁRIO */}
        {step === "dados" && (
          <div className="px-3 mt-8 flex flex-col gap-4 mb-28">
            {/* Nome */}
            <div>
              <label className="text-sm text-white/70">Nome Completo</label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => handleChange("nome", e.target.value)}
                className="w-full bg-transparent border-b border-white/50 text-white outline-none text-sm"
              />
            </div>

            {/* Nascimento */}
            <div>
              <label className="text-sm text-white/70">Data de Nascimento</label>
              <input
                type="date"
                value={formData.nascimento}
                onChange={(e) => handleChange("nascimento", e.target.value)}
                className="w-full border-b border-white/50 text-white bg-transparent outline-none"
                style={{ colorScheme: "dark" }}
              />
            </div>

            {/* Cargo */}
            <div className="relative">
              <label className="text-sm text-white/70">Cargo</label>
              <div
                className="w-full border-b border-white/50 flex justify-between items-center cursor-pointer"
                onClick={() =>
                  setOpenSelect(openSelect === "cargo" ? null : "cargo")
                }
              >
                <span>{formData.Cargo}</span>
                <ChevronDown
                  className={`w-4 h-4 transition ${
                    openSelect === "cargo" ? "rotate-180" : ""
                  }`}
                />
              </div>

              {openSelect === "cargo" && (
                <div className="absolute z-20 w-full mt-1 bg-[#012E4B] border border-white/20 rounded-md shadow-md">
                  {["Gerente", "Funcionário", "Estagiário"].map((tipo) => (
                    <div
                      key={tipo}
                      onClick={() => handleChange("Cargo", tipo)}
                      className={`px-3 py-2 text-sm flex justify-between cursor-pointer hover:bg-white/10 ${
                        formData.Cargo === tipo
                          ? "text-white"
                          : "text-white/80"
                      }`}
                    >
                      <span>{tipo}</span>
                      {formData.Cargo === tipo && (
                        <Check className="w-4 h-4" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CPF */}
            <div>
              <label className="text-sm text-white/70">CPF</label>
              <input
                type="text"
                value={CPF}
                maxLength={14}
                onChange={handleCPFChange}
                className="w-full bg-transparent border-b border-white/50 text-white outline-none"
              />
            </div>

            {/* Telefone */}
            <div>
              <label className="text-sm text-white/70">Telefone</label>
              <input
                type="text"
                value={telefone}
                onChange={handleTelefoneChange}
                className="w-full bg-transparent border-b border-white/50 text-white outline-none"
              />
            </div>

            {/* Endereço */}
            <div>
              <label className="text-sm text-white/70">Endereço Completo</label>
              <input
                type="text"
                value={formData.endereco}
                onChange={(e) => handleChange("endereco", e.target.value)}
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
                className="absolute left-2 top-2 text-white/50 text-base transition-all
                  peer-focus:-top-4 peer-focus:text-white peer-focus:text-sm
                  peer-not-placeholder-shown:-top-4 peer-not-placeholder-shown:text-sm"
              >
                Senha
              </label>
            </div>
          </div>
        )}
      </div>

      {/* BOTÃO */}
      <button
        className="absolute bottom-3 right-6 border border-white rounded-full p-3 hover:bg-white/10 transition"
        onClick={handleNext}
      >
        {step === "dados" ? (
          <ChevronRight className="w-6 h-6" />
        ) : (
          <Check className="w-6 h-6" />
        )}
      </button>
    </main>
  );
}
