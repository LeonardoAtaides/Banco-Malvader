"use client";

import React, { useState } from "react";
import { X, ChevronRight, Check, ChevronDown, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Confirmacaof from "@/components/confirmacao";

export default function AberturaConta() {
  const router = useRouter();
  const [step, setStep] = useState<"dados" | "senha">("dados");
  const [senha, setSenha] = useState("");
  const [agencia, setAgencia] = useState("");
  const [CPF, setCPF] = useState("");
  const [telefone, setTelefone] = useState("");
  const [taxa, setTaxa] = useState("");
  const [openSelect, setOpenSelect] = useState<string | null>(null);
    const [confirmacaoAberta, setConfirmacaoAberta] = useState(false);

  const [formData, setFormData] = useState({
    nome: "",
    nascimento: "",
    tipoConta: "Conta Corrente (CC)",
    agencia: "Agencia Central",
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
      // Verifica se todos os campos obrigatórios estão preenchidos
      if (
        !formData.nome.trim() ||
        !formData.nascimento ||
        !formData.tipoConta.trim() ||
        !agencia.trim() ||
        !CPF.trim() ||
        !telefone.trim() ||
        !formData.vencimento.trim() ||
        !taxa.trim() ||
        !formData.endereco.trim()
      ) {
        alert("Por favor, preencha todos os campos antes de continuar.");
        return; // Impede avanço se algo estiver vazio
      }

      setStep("senha"); // Vai para a próxima etapa se estiver tudo ok
    } else {
      // Validação da senha na etapa final
      if (senha === "321") {
        // 👉 Ao invés de alert, abre o componente de confirmação
        setConfirmacaoAberta(true);
      } else {
        alert("Senha incorreta. Tente novamente.");
      }
    }
  };

  
    if (confirmacaoAberta) {
    return (
      <Confirmacaof
        mensagemLoading="Cadastrando Cliente"
        mensagemSuccess="Cadastro Realizado com Sucesso!"
        tempoLoading={2000}
        onComplete={() => router.push("/Funcionario")}
      />
    );
  }

    // Máscara para o Input de Agência
  const handleContaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, ""); // remove tudo que não é número

    if (input.length > 6) input = input.slice(0, 6); // limita a 6 números

    // adiciona o hífen automaticamente
    if (input.length > 5) {
      input = input.slice(0, 5) + "-" + input.slice(5);
    }

    setAgencia(input);
  };

  // Máscara para o Input de CPF
  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); 

    // Aplica a máscara
    if (value.length > 9) {
      value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{0,2}).*/, "$1.$2.$3-$4");
    } else if (value.length > 6) {
      value = value.replace(/^(\d{3})(\d{3})(\d{0,3}).*/, "$1.$2.$3");
    } else if (value.length > 3) {
      value = value.replace(/^(\d{3})(\d{0,3}).*/, "$1.$2");
    }

    setCPF(value);
  };

// Máscara para o Input de Telefone
  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); // Remove tudo que não for número

    // Aplica a máscara dinamicamente
    if (value.length > 10) {
      // (99) 99999-9999
      value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
    } else if (value.length > 6) {
      // (99) 9999-9999
      value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
    } else if (value.length > 2) {
      // (99) 9...
      value = value.replace(/^(\d{2})(\d{0,5}).*/, "($1) $2");
    } else {
      // Apenas DDD incompleto
      value = value.replace(/^(\d{0,2}).*/, "($1");
      // Remove o "(" se estiver vazio
      if (value === "(") value = "";
    }

    setTelefone(value);
  };

  // Máscara para o Input de Taxa de Manutenção (R$)
  const handleTaxaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); // Remove tudo que não for número

    // Se não houver valor, limpa o campo
    if (value === "") {
      setTaxa("");
      return;
    }

    // Converte para centavos
    value = (Number(value) / 100).toFixed(2);

    // Substitui ponto por vírgula e adiciona separador de milhar
    value = value
      .replace(".", ",")
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    // Adiciona o prefixo R$
    value = "R$ " + value;

    setTaxa(value);
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
          <h2 className="text-center text-xs font-bold text-white/70 mt-[-2px]">
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
            <div className="relative">
              <label className="block text-sm text-white/70">Agência</label>
              <div
                className="w-full border-b border-white/50 flex justify-between items-center cursor-pointer"
                onClick={() =>
                  setOpenSelect(openSelect === "agencia" ? null : "agencia")
                }
              >
                <span>{formData.agencia}</span>
                <ChevronDown
                  className={`w-4 h-4 text-white transition-transform ${
                    openSelect === "agencia" ? "rotate-180" : ""
                  }`}
                />
              </div>

              {openSelect === "agencia" && (
                <div className="absolute z-20 w-full mt-1 bg-[#012E4B] rounded-md shadow-md border border-white/20 overflow-hidden">
                  {[
                    "Agencia Central",
                  ].map((tipo) => (
                    <div
                      key={tipo}
                      onClick={() => handleChange("tipoConta", tipo)}
                      className={`px-3 py-2 text-sm flex justify-between items-center hover:bg-white/10 cursor-pointer ${
                        formData.agencia === tipo ? "text-white" : "text-white/80"
                      }`}
                    >
                      <span>{tipo}</span>
                      {formData.agencia === tipo && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CPF */}
            <div>
              <label className="block text-sm text-white/70">CPF</label>
              <input
                type="text"
                required
                value={CPF}
                maxLength={14}
                onChange={handleCPFChange}
                className="w-full bg-transparent border-b border-white/50 text-white outline-none"
              />
            </div>

            {/* Telefone */}
            <div>
              <label className="block text-sm text-white/70">Telefone</label>
              <input
                type="text"
                required
                value={telefone}
                onChange={handleTelefoneChange}
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
                value={taxa}
                onChange={handleTaxaChange}
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
        <div className="flex justify-center mt-[18px] w-full px-5">
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
        {step === "dados" ? (
          <ChevronRight className="w-6 h-6 text-white" />
        ) : (
          <Check className="w-6 h-6 text-white" />
        )}
      </button>
    </main>
  );
}
