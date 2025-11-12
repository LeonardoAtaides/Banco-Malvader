"use client";

import React, { useState } from "react";
import {
  X,
  ChevronDown,
  Check,
  PencilLine,
  Save,
  RotateCcw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import DadosSearch from "@/components/pesquisadados";

// ----------- Funções auxiliares de máscara -----------
const maskTelefone = (v: string) => {
  v = v.replace(/\D/g, "");
  v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
  v = v.replace(/(\d{5})(\d)/, "$1-$2");
  return v.slice(0, 15);
};

const maskMoney = (v: string) => {
  v = v.replace(/\D/g, "");
  v = (Number(v) / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  return v;
};

export default function ConsultarDados() {
  const router = useRouter();
  const [cpfBusca, setCpfBusca] = useState("");
  const [tipoSelecionado, setTipoSelecionado] = useState<
    "conta" | "cliente" | "funcionario" | ""
  >("");
  const [dados, setDados] = useState<any | null>(null);
  const [backup, setBackup] = useState<any | null>(null);
  const [editando, setEditando] = useState(false);
  const [openSelect, setOpenSelect] = useState<string | null>(null);

  // --------- Dados Fake ---------
  const contasFake = [
    {
      cpf: "123.168.178-09",
      tipoConta: "Conta Corrente (CC)",
      numeroConta: "1234-5",
      titular: "José Antonio Marcos",
      saldo: "R$ 1.200,00",
      limite: "R$ 5.000,00",
      vencimento: "Dia 5",
      status: "Ativa",
      abertura: "15/01/2025",
    },
  ];

  const clientesFake = [
    {
      cpf: "111.222.333-44",
      nome: "Carlos Pereira",
      nascimento: "1998-03-12",
      telefone: "(61) 99999-8888",
      endereco: "Rua das Flores, 120",
    },
  ];

  const funcionariosFake = [
    {
      codigo: "F001",
      cargo: "Atendente",
      nome: "Maria Santos",
      cpf: "222.333.444-55",
      nascimento: "1995-08-05",
      telefone: "(61) 98888-7777",
      endereco: "Av. Central, 45",
      agencia: "Agência 001",
    },
  ];

  // --------- Busca Dinâmica ---------
  const handleSearch = (term: string, tipo: string) => {
    setCpfBusca(term);
    const tipoLower = tipo.toLowerCase();
    setTipoSelecionado(tipoLower as any);

    if (!term) {
      setDados(null);
      return;
    }

    let encontrada = null;

    if (tipoLower === "conta") encontrada = contasFake.find((c) => c.cpf === term);
    else if (tipoLower === "cliente")
      encontrada = clientesFake.find((c) => c.cpf === term);
    else if (tipoLower === "funcionário" || tipoLower === "funcionario")
      encontrada = funcionariosFake.find((c) => c.cpf === term);

    if (encontrada) {
      setDados({ ...encontrada });
      setBackup({ ...encontrada });
    } else {
      setDados(null);
    }
  };

  const handleChange = (campo: string, valor: string) => {
    if (!dados || !editando) return;
    setDados({ ...dados, [campo]: valor });
  };

  const handleBack = () => router.back();

  const handleLimpar = () => {
    if (backup) setDados({ ...backup });
    setEditando(false);
    setOpenSelect(null);
  };

  const handleSalvar = () => {
    console.log("Dados salvos:", dados);
    setBackup({ ...dados });
    setEditando(false);
    setOpenSelect(null);
  };

  // --------- Renderização ---------
  const renderFormulario = () => {
    if (!dados) return null;

    // -------- CONTA --------
    if (tipoSelecionado === "conta") {
      return (
        <>
          <Campo label="Tipo de Conta" valor={dados.tipoConta} />
          <Campo label="Número da Conta" valor={dados.numeroConta} />
          <Campo label="Nome do Titular" valor={dados.titular} />
          <Campo label="CPF" valor={dados.cpf} />
          <Campo label="Saldo Atual" valor={dados.saldo} />
          <CampoEditavel
            label="Limite Disponível"
            valor={dados.limite}
            editando={editando}
            onChange={(v) => handleChange("limite", maskMoney(v))}
            
          />

          {/* Select de vencimento */}
          <div className="relative">
            <label className="block text-sm text-white/70">
              Data de Vencimento
            </label>
            <div
              className={`w-full border-b border-white/30 flex justify-between items-center transition ${
                editando
                  ? "cursor-pointer text-white"
                  : "text-white/70 cursor-not-allowed"
              }`}
              onClick={() =>
                editando &&
                setOpenSelect(openSelect === "vencimento" ? null : "vencimento")
              }
            >
              <span>{dados.vencimento}</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  openSelect === "vencimento" ? "rotate-180" : ""
                }`}
              />
            </div>

            {openSelect === "vencimento" && editando && (
              <div className="absolute z-20 w-full mt-1 bg-[#012E4B] rounded-md shadow-md border border-white/20 overflow-hidden">
                {["Dia 5", "Dia 10", "Dia 15"].map((dia) => (
                  <div
                    key={dia}
                    onClick={() => {
                      handleChange("vencimento", dia);
                      setOpenSelect(null);
                    }}
                    className={`px-3 py-2 text-sm flex justify-between items-center hover:bg-white/10 cursor-pointer ${
                      dados.vencimento === dia
                        ? "text-white"
                        : "text-white/80"
                    }`}
                  >
                    <span>{dia}</span>
                    {dados.vencimento === dia && (
                      <Check className="w-4 h-4 text-white" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <Campo
            label="Status"
            valor={dados.status}
            color={dados.status === "Ativa" ? "#42D23A" : "red"}
          />
          <Campo label="Data de Abertura" valor={dados.abertura} />
        </>
      );
    }

    // -------- CLIENTE --------
    if (tipoSelecionado === "cliente") {
      return (
        <>
          <CampoEditavel
            label="Nome Completo"
            valor={dados.nome}
            editando={editando}
            onChange={(v) => handleChange("nome", v)}
          />
          <Campo label="CPF" valor={dados.cpf} />
          <CampoDate
            label="Data de Nascimento"
            valor={dados.nascimento}
            editando={editando}
            onChange={(v) => handleChange("nascimento", v)}
          />
          <CampoEditavel
            label="Telefone"
            valor={dados.telefone}
            editando={editando}
            onChange={(v) => handleChange("telefone", maskTelefone(v))}
          />
          <CampoEditavel
            label="Endereço"
            valor={dados.endereco}
            editando={editando}
            onChange={(v) => handleChange("endereco", v)}
          />
        </>
      );
    }

    // -------- FUNCIONÁRIO --------
    if (tipoSelecionado === "funcionario") {
      return (
        <>
          <Campo label="Código do Funcionário" valor={dados.codigo} />
          <Campo label="Cargo" valor={dados.cargo} />
          <CampoEditavel
            label="Nome Completo"
            valor={dados.nome}
            editando={editando}
            onChange={(v) => handleChange("nome", v)}
          />
          <Campo label="CPF" valor={dados.cpf} />
          <CampoDate
            label="Data de Nascimento"
            valor={dados.nascimento}
            editando={editando}
            onChange={(v) => handleChange("nascimento", v)}
          />
          <CampoEditavel
            label="Telefone"
            valor={dados.telefone}
            editando={editando}
            onChange={(v) => handleChange("telefone", maskTelefone(v))}
          />
          <CampoEditavel
            label="Endereço"
            valor={dados.endereco}
            editando={editando}
            onChange={(v) => handleChange("endereco", v)}
          />
          <Campo label="Agência" valor={dados.agencia} />
        </>
      );
    }

    return null;
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#012E4B] to-[#064F75] text-white flex flex-col">
      <div className="px-5 py-5">
        <button onClick={handleBack} className="hover:text-white/70 transition">
          <X className="w-8 h-8" />
        </button>

        <h1 className="pt-6 text-center text-2xl font-bold">
          Consultar Dados
        </h1>

        <DadosSearch onSearch={handleSearch} onClear={handleLimpar} />

        {dados ? (
          <>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={editando ? handleSalvar : () => setEditando(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition"
                style={{
                  backgroundColor: editando ? "#42D23A" : "rgba(255,255,255,0.1)",
                  color: "#fff",
                }}
              >
                {editando ? (
                  <>
                    <Save className="w-4 h-4" /> Salvar
                  </>
                ) : (
                  <>
                    <PencilLine className="w-4 h-4" /> Editar
                  </>
                )}
              </button>

              <button
                onClick={handleLimpar}
                disabled={!editando}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-white/20 transition ${
                  editando
                    ? "bg-white/10 text-white/80 hover:text-white"
                    : "bg-white/5 text-white/50 cursor-not-allowed opacity-60"
                }`}
              >
                <RotateCcw className="w-4 h-4" /> Limpar
              </button>
            </div>

            <div className="mt-6 p-5 rounded-2xl border border-white/20 bg-white/5">
              <div className="flex flex-col gap-4">{renderFormulario()}</div>
            </div>
          </>
        ) : (
          cpfBusca && (
            <p className="text-center text-sm text-gray-300 mt-10">
              Nenhum registro encontrado para o CPF informado.
            </p>
          )
        )}
      </div>
    </main>
  );
}

/* ---------- COMPONENTES AUXILIARES ---------- */
const Campo = ({
  label,
  valor,
  color,
}: {
  label: string;
  valor: string;
  color?: string;
}) => (
  <div>
    <label className="block text-sm text-white/70">{label}</label>
    <input
      type="text"
      disabled
      value={valor}
      className="w-full bg-transparent border-b border-white/30 outline-none text-sm"
      style={{ color: color || "rgba(255,255,255,0.7)" }}
    />
  </div>
);

const CampoEditavel = ({
  label,
  valor,
  editando,
  onChange,
  prefixo,
}: {
  label: string;
  valor: string;
  editando: boolean;
  onChange: (valor: string) => void;
  prefixo?: string;
}) => (
  <div>
    <label className="block text-sm text-white/70">{label}</label>
    <div className="flex items-center border-b border-white/30">
      {prefixo && <span className="text-white/70 mr-1">{prefixo}</span>}
      <input
        type="text"
        disabled={!editando}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-transparent outline-none text-sm transition ${
          editando ? "text-white" : "text-white/70"
        }`}
      />
    </div>
  </div>
);

const CampoDate = ({
  label,
  valor,
  editando,
  onChange,
}: {
  label: string;
  valor: string;
  editando: boolean;
  onChange: (valor: string) => void;
}) => (
  <div>
    <label className="block text-sm text-white/70">{label}</label>
    <input
      type="date"
      disabled={!editando}
      value={valor}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full bg-transparent border-b border-white/30 outline-none text-sm transition ${
        editando ? "text-white" : "text-white/70"
      }`}
    />
  </div>
);
