"use client";

import React, { useState } from "react";
import { X, PencilLine, Save, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import DadosSearch from "@/components/pesquisadados";


const maskTelefone = (v: string) => {
  v = v.replace(/\D/g, "");
  v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
  v = v.replace(/(\d{5})(\d)/, "$1-$2");
  return v.slice(0, 15);
};

const formatarEnderecoUnico = (end: any) => {
  if (!end) return "";
  return `${end.rua ?? ""} ${end.numero ?? ""} - ${end.bairro ?? ""}, ${
    end.cidade ?? ""
  } - ${end.estado ?? ""}`;
};


const quebrarEndereco = (texto: string) => {


  const [parte1 = "", parte2 = ""] = texto.split(" - ");
  const [ruaNumero = "", bairroCidadeUF = ""] = [parte1, parte2];

  const ruaMatch = ruaNumero.trim().split(" ");
  const numero = ruaMatch.pop();
  const rua = ruaMatch.join(" ");

  const [bairro = "", cidadeUF = ""] = bairroCidadeUF.split(",");
  const [cidade = "", estado = ""] = cidadeUF.split(" - ");

  return {
    rua: rua.trim(),
    numero: numero?.trim() ?? "",
    bairro: bairro.trim(),
    cidade: cidade.trim(),
    estado: estado.trim(),
    complemento: "",
  };
};

export default function ConsultarDados() {
  const router = useRouter();
  const [cpfBusca, setCpfBusca] = useState("");
  const [dados, setDados] = useState<any | null>(null);
  const [backup, setBackup] = useState<any | null>(null);
  const [editando, setEditando] = useState(false);

  // -------- BUSCA -------- //
  const handleSearch = async (term: string) => {
    setCpfBusca(term);
    if (!term) return setDados(null);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`/api/funcionario/consultardados?cpf=${term}`, {
        method: "GET",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });

      if (!res.ok) throw new Error();

      const data = await res.json();

      const formatado = {
        nome: data.nome,
        cpf: data.cpf,
        telefone: data.telefone,
        data_nascimento: data.data_nascimento?.substring(0, 10),
        tipo_usuario: data.tipo_usuario,
        endereco_unico: data.endereco
          ? formatarEnderecoUnico(data.endereco)
          : "",
        endereco_original: data.endereco || null,
      };

      setDados(formatado);
      setBackup(formatado);
    } catch {
      setDados(null);
    }
  };

  const handleBack = () => router.back();

  const handleLimpar = () => {
    if (backup) setDados(JSON.parse(JSON.stringify(backup)));
    setEditando(false);
  };

const handleSalvar = async () => {
  try {
    const token = localStorage.getItem("token");

    const enderecoSeparado = quebrarEndereco(dados.endereco_unico);

    const payload = {
      cpf: dados.cpf, 
      nome: dados.nome,
      telefone: dados.telefone,
      data_nascimento: dados.data_nascimento,
      endereco: enderecoSeparado,
    };

    const res = await fetch("/api/funcionario/consultardados", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(payload),
    });

    const resposta = await res.json();

    if (!res.ok) {
      alert(resposta.error || "Erro ao atualizar os dados.");
      return;
    }

    alert("Dados atualizados com sucesso!");

    setBackup(JSON.parse(JSON.stringify(dados)));
    setEditando(false);

  } catch (err) {
    console.error(err);
    alert("Erro inesperado ao tentar atualizar!");
  }
};

  const renderFormulario = () => {
    if (!dados) return null;

    return (
      <>

          <Campo
          label="Tipo de Usuário"
          valor={dados.tipo_usuario}
        />
        <CampoEditavel
          label="Nome Completo"
          valor={dados.nome}
          editando={editando}
          onChange={(v) => setDados({ ...dados, nome: v })}
        />

        <Campo label="CPF" valor={dados.cpf} />

        <CampoDate
          label="Data de Nascimento"
          valor={dados.data_nascimento}
          editando={editando}
          onChange={(v) => setDados({ ...dados, data_nascimento: v })}
        />

        <CampoEditavel
          label="Telefone"
          valor={dados.telefone}
          editando={editando}
          onChange={(v) => setDados({ ...dados, telefone: maskTelefone(v) })}
        />

        {/* ----------- ENDEREÇO EM UM ÚNICO CAMPO ----------- */}
        <CampoEditavel
          label="Endereço Completo"
          valor={dados.endereco_unico}
          editando={editando}
          onChange={(v) => setDados({ ...dados, endereco_unico: v })}
        />

       
      </>
    );
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
                {editando ? <Save className="w-4 h-4" /> : <PencilLine className="w-4 h-4" />}
                {editando ? "Salvar" : "Editar"}
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

const Campo = ({ label, valor }: { label: string; valor: string }) => (
  <div>
    <label className="block text-sm text-white/70">{label}</label>
    <input
      type="text"
      disabled
      value={valor}
      className="w-full bg-transparent border-b border-white/30 outline-none text-sm text-white/70"
    />
  </div>
);

const CampoEditavel = ({
  label,
  valor,
  editando,
  onChange,
}: {
  label: string;
  valor: any;
  editando: boolean;
  onChange: (valor: string) => void;
}) => (
  <div>
    <label className="block text-sm text-white/70">{label}</label>
    <input
      type="text"
      disabled={!editando}
      value={valor || ""}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full bg-transparent border-b border-white/30 outline-none text-sm ${
        editando ? "text-white" : "text-white/70"
      }`}
    />
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
      value={valor || ""}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full border-b text-sm border-white/50 outline-none bg-transparent ${
        editando ? "text-white" : "text-white/70"
      }`}
      style={{ colorScheme: "dark" }}
    />
  </div>
);
