"use client";

import React, { useState, useEffect } from "react";
import { ChevronRight, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import Titulo from "@/components/titles";
import Navbar from "@/components/funcnavbar";

export default function FuncionarioPerfil() {
  const router = useRouter();

  const [nomeFuncionario, setNomeFuncionario] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [cargo, setCargo] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");

  // Função de formatar data
  const formatarData = (dataStr?: string) => {
    if (!dataStr) return "-";
    const partes = dataStr.split("T")[0].split("-");
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/Login");
      return;
    }

    async function fetchPerfil() {
      try {
        const res = await fetch("/api/funcionario/perfil", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Erro ao buscar perfil");

        const data = await res.json();

        setNomeFuncionario(data.nome || "");
        setCpf(data.cpf || "");
        setTelefone(data.telefone || "");
        setCargo(data.cargo || "");
        setDataNascimento(formatarData(data.data_nascimento));

        if (data.endereco) {
          const end = data.endereco;
          const endFormat = `${end.rua} ${end.numero} - ${end.bairro}, ${end.cidade} - ${end.estado}`;
          setEndereco(endFormat);
        }
      } catch (err) {
        console.error("Erro ao buscar perfil:", err);
      }
    }

    fetchPerfil();
  }, [router]);

  const Termos = () => {
    router.push("/Termos");
  };

  return (
    <main className="bg-white min-h-screen text-[14px] font-bold pb-18">
      <div className="bg-[#012E4B] pt-2 px-5 h-[250px] bg-wave bg-no-repeat bg-bottom bg-cover">

        {/* Cabeçalho */}
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-5 relative">
            <img src="/assets/Logo.png" alt="logo" className="w-8 h-8" />
            <h2 className="text-white">{nomeFuncionario}</h2>

            <div className="absolute bottom-0 left-13 w-75 border-b border-white/50"></div>
          </div>

          <div className="flex text-center gap-4 text-white">
            <h2>{cargo}</h2>
          </div>
        </div>

        {/* Dados do funcionário */}
        <div className="flex flex-col pt-5 gap-2 text-white">
          <div className="flex-col">
            <h2 className="text-gray-300">CPF</h2>
            <p>{cpf}</p>
          </div>

          <div className="flex-col">
            <h2 className="text-gray-300">Data de Nascimento</h2>
            <p>{dataNascimento}</p>
          </div>

          <div className="flex-col">
            <h2 className="text-gray-300">Telefone</h2>
            <p>{telefone}</p>
          </div>

          <div className="flex-col">
            <h2 className="text-gray-300">Endereço</h2>
            <p>{endereco}</p>
          </div>
        </div>
      </div>

      {/* Waves */}
      <div className="w-full flex justify-center">
        <img
          src="/assets/Wave.png"
          alt="wave"
          className="w-full h-auto object-cover repeat-y"
        />
      </div>

      <Titulo tipo={0} />

      {/* Botão Termos */}
      <div className="flex justify-center text-[12px]">
        <button
          onClick={Termos}
          className="flex justify-between items-center w-90 mt-2 bg-[#012E4B] text-white py-3 px-5 rounded-[10px]"
        >
          <div className="flex items-center gap-5">
            <FileText />
            Termos
          </div>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <Navbar />
    </main>
  );
}
