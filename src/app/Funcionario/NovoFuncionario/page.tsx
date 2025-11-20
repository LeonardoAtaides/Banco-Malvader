"use client";

import React, { useState } from "react";
import { X, ChevronRight, Check, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import Confirmacaof from "@/components/confirmacao";

export default function NovoFuncionario() {
  const router = useRouter();
  const [CPF, setCPF] = useState("");
  const [telefone, setTelefone] = useState("");
  const [openSelect, setOpenSelect] = useState<string | null>(null);
  const [confirmacaoAberta, setConfirmacaoAberta] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const [formData, setFormData] = useState({
    nome: "",
    nascimento: "",
    Cargo: "Gerente",
    endereco: "",
  });

  const cadastrarFuncionario = async () => {
    setCarregando(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!token) {
        alert('Sessão expirada. Faça login novamente.');
        router.push('/login');
        return;
      }
      const dadosParaAPI = {
        nome: formData.nome.trim(),
        data_nascimento: formData.nascimento,
        cpf: CPF.replace(/\D/g, ""),
        telefone: telefone.replace(/\D/g, ""),
        endereco: formData.endereco.trim(),
        cargo: formData.Cargo
      };

      if (dadosParaAPI.cpf.length !== 11) {
        alert('CPF inválido. Deve conter 11 dígitos.');
        setCarregando(false);
        return;
      }

      console.log('Enviando dados para API:', dadosParaAPI);

      const response = await fetch('/api/funcionario/novofunc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dadosParaAPI)
      });

      const resultado = await response.json();

      if (response.ok) {
        console.log('Funcionário cadastrado com sucesso:', resultado);
        setConfirmacaoAberta(true);
      } else {
        console.error('Erro na API:', resultado);
        alert(resultado.error || 'Erro ao cadastrar funcionário');
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      alert('Erro ao conectar com o servidor. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setOpenSelect(null);
  };

  const handleConfirmar = () => {
    // Validações dos campos
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

    const cpfLimpo = CPF.replace(/\D/g, "");
    if (cpfLimpo.length !== 11) {
      alert("CPF inválido. Deve conter 11 dígitos.");
      return;
    }

  
    const telefoneLimpo = telefone.replace(/\D/g, "");
    if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) {
      alert("Telefone inválido. Deve conter 10 ou 11 dígitos.");
      return;
    }

    cadastrarFuncionario();
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
          onClick={() => router.back()}
          disabled={carregando}
        >
          <X className="w-7 h-7" />
        </button>

        <h1 className="pt-12 text-center text-2xl font-bold">
          Novo Funcionário
        </h1>

        {/* FORMULÁRIO */}
        <div className="px-3 mt-8 flex flex-col gap-4 mb-28">
          {/* Nome */}
          <div>
            <label className="text-sm text-white/70">Nome Completo</label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => handleChange("nome", e.target.value)}
              className="w-full bg-transparent border-b border-white/50 text-white outline-none text-sm"
              placeholder="Digite o nome completo"
              disabled={carregando}
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
              disabled={carregando}
            />
          </div>

          {/* Cargo */}
          <div className="relative">
            <label className="text-sm text-white/70">Cargo</label>
            <div
              className="w-full border-b border-white/50 flex justify-between items-center cursor-pointer"
              onClick={() => !carregando && setOpenSelect(openSelect === "cargo" ? null : "cargo")}
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
              placeholder="000.000.000-00"
              disabled={carregando}
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
              placeholder="(00) 00000-0000"
              disabled={carregando}
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
              placeholder="Rua, número, bairro, cidade..."
              disabled={carregando}
            />
          </div>
        </div>
      </div>

      {/* BOTÃO */}
      <button
        className="absolute bottom-3 right-6 border border-white rounded-full p-3 hover:bg-white/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleConfirmar}
        disabled={carregando}
      >
        {carregando ? (
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <Check className="w-6 h-6" />
        )}
      </button>
    </main>
  );
}