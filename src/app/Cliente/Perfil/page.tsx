"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Titulo from "@/components/titles";
import Navbar from "@/components/navbar";
import { ChevronRight, HandHelping, FileText, CircleFadingPlus } from "lucide-react";

export default function Cliente() {
  const router = useRouter();

  const [nomeUsuario, setNomeUsuario] = useState(" ");
  const [cpf, setCpf] = useState(" ");
  const [telefone, setTelefone] = useState(" ");
  const [endereco, setEndereco] = useState(" ");
  const [numeroConta, setNumeroConta] = useState(" ");
  const [dataNascimento, setDataNascimento] = useState(" ");

  const OpenAjuda = () => router.push("/Cliente/Ajuda");
  const OpenSobre = () => router.push("/Cliente/Devs");
  const OpenTermos = () => router.push("/Termos");


  const formatarData = (dataStr?: string) => {
    if (!dataStr) return "-";
    const partes = dataStr.split("T")[0].split("-");  ["2005","11","03"]
    const dia = partes[2];
    const mes = partes[1];
    const ano = partes[0];
    return `${dia}/${mes}/${ano}`;
  };

    const formatarCPF = (cpf?: string) => {
  if (!cpf) return "-";
  
  const cpfLimpo = cpf.replace(/\D/g, "");
  
  return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
};
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/Login");
      return;
    }

    async function fetchPerfil() {
      try {
        const res = await fetch("/api/cliente/perfil", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Erro ao buscar perfil");

        const data = await res.json();

        setNomeUsuario(data.nome || " ");
        setCpf(formatarCPF(data.cpf || " "));
        setTelefone(data.telefone || " ");
        setDataNascimento(formatarData(data.data_nascimento));
        setNumeroConta(data.numero_conta || " ");

        if (data.endereco) {
          const end = data.endereco;
          const endFormat = `${end.rua} ${end.numero} - ${end.bairro}, ${end.cidade}, ${end.estado}`;
          setEndereco(endFormat);
        }
      } catch (err) {
        console.error("Erro ao buscar perfil:", err);
      }
    }

    fetchPerfil();
  }, []);

  return (
    <main className="bg-white min-h-screen text-[14px] font-bold pb-18">
      <div className="bg-[#012E4B] pt-2 flex-col justify-center px-5 w h-[250px] z-50 bg-wave bg-no-repeat bg-bottom bg-cover">
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-5 relative">
            <img src="/assets/Logo.png" alt="logo" className="w-8 h-8" />
            <h2 className="text-white">{nomeUsuario}</h2>
            <div className="absolute bottom-0 left-13 w-75 border-b border-white/50"></div>
          </div>
          <div className="flex text-center">
            <h2>Cc. <span>{numeroConta}</span></h2>
          </div>
        </div>

        <div className="flex flex-col pt-5 gap-2">
          <div className="flex-col text-start">
            <h2 className="text-gray-300">CPF</h2>
            <p>{cpf}</p>
          </div>

          <div className="flex-col text-start">
            <h2 className="text-gray-300">Data de Nascimento</h2>
            <p>{dataNascimento}</p>
          </div>

          <div className="flex-col text-start">
            <h2 className="text-gray-300">Telefone</h2>
            <p>{telefone}</p>
          </div>

          <div className="flex-col text-start">
            <h2 className="text-gray-300">Endereço</h2>
            <p>{endereco}</p>
          </div>
        </div>
      </div>

      <div className="w-full flex justify-center">
        <img src="/assets/Wave.png" alt="wave" className="w-full h-auto object-cover repeat-y" />
      </div>

      <Titulo tipo={0} />

      <div className="flex justify-center text-[12px] mt-2">
        <button onClick={OpenAjuda} className="flex justify-between items-center w-90 text-center mt-2 bg-[#012E4B] py-3 px-5 rounded-[10px]">
          <div className="flex justify-center items-center gap-5">
            <HandHelping />
            Ajuda
          </div>
          <ChevronRight className="w-5 h-5"/>
        </button>
      </div>

      <div className="flex justify-center text-[12px]">
        <button onClick={OpenTermos} className="flex justify-between items-center w-90 text-center mt-2 bg-[#012E4B] py-3 px-5 rounded-[10px]">
          <div className="flex justify-center items-center gap-5">
            <FileText />
            Termos
          </div>
          <ChevronRight className="w-5 h-5"/>
        </button>
      </div>

      <div className="flex justify-center text-[12px]">
        <button onClick={OpenSobre} className="flex justify-between items-center w-90 text-center mt-2 bg-[#012E4B] py-3 px-5 rounded-[10px]">
          <div className="flex justify-center items-center gap-5">
            <CircleFadingPlus />
            Sobre
          </div>
          <ChevronRight className="w-5 h-5"/>
        </button>
      </div>

      <Navbar />
    </main>
  );
}
