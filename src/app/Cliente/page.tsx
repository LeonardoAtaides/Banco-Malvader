"use client";

import React, { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  LogOut,
  FileChartColumn,
  BanknoteArrowUp,
  BanknoteArrowDown,
  ArrowLeftRight,
  ChartCandlestick,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Titulo from "@/components/titles";
import Navbar from "@/components/navbar";
import { jwtDecode } from "jwt-decode";
import { TokenPayload } from "@/types/TokenPayload";

export default function Cliente() {
  const dicas = [
    "Com o MV você consegue tirar o seu Corolla Hybrid ainda mais rápido!",
    "Acho lindo você gereciando o seu dinheiro em nosso banco!",
    'Está devendo? "Calma que vai piorar", conosco não, te ajudamos com as dívidas.',
  ];

  const [index, setIndex] = useState(0);
  const [ocultar, setOcultar] = useState(false); // controla ocultar/exibir saldo

  // Aqui é onde pega os conteúdos do JWT -> vide o arquivo TokenPayload.ts
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [numeroConta, setNumeroConta] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/Login");
      return;
    }

    try {
      const decoded = jwtDecode<TokenPayload>(token);
      setNomeUsuario(decoded.nome);
    } catch (err) {
      router.push("/Login");
    }
  }, []);
  // Aqui é o final, nesse meio aí que define sobre as coisas do JWT
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % dicas.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [dicas.length]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/Login");
  };

  const toggleOcultar = () => setOcultar(!ocultar);

  // Rotas
  const OpenExtrato = () => router.push("/Cliente/Extrato");
  const OpenDepositar = () => router.push("/Cliente/Depositar");
  const OpenSacar = () => router.push("/Cliente/Sacar");
  const OpenTransferir = () => router.push("/Cliente/Transferir");
  const OpenLimite = () => router.push("/Cliente/Limite");
  const goToInvestimentos = () => router.push("/Cliente/Investimentos");
  const goToConvidar = () => router.push("/Cliente/Convidar");
  const goToTermos = () => router.push("/Termos");
  const goToDevs = () => router.push("/Cliente/Devs");

  return (
    <main className="bg-white min-h-screen text-[14px] font-bold pb-18 ">
      <div className="bg-[#012E4B] pt-2 flex-col justify-center px-5 w h-[110px] z-50 bg-wave bg-no-repeat bg-bottom bg-cover">
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-5 relative">
            <img src="/assets/Logo.png" alt="logo" className="w-8 h-8" />
            <h2 className="text-white">Olá, {nomeUsuario}</h2>
            <div className="absolute bottom-0 left-13 w-74 border-b border-white/50"></div>
          </div>

          <div className="flex gap-2 relative z-10">
            <button onClick={toggleOcultar}>
              {ocultar ? (
                <EyeOff className="w-5 h-5 text-white" />
              ) : (
                <Eye className="w-5 h-5 text-white" />
              )}
            </button>
            <LogOut className="w-5 h-5" onClick={handleLogout} />
          </div>
        </div>

        <div className="flex justify-between pt-5 z-10">
          <div className="text-center">
            <h2>Saldo disponível</h2>
            <p>{ocultar ? "•••••" : "R$ 1200,00"}</p>
          </div>

          <div className="text-center">
            <h2>Conta</h2>
            <p>{ocultar ? "•••••" : "1234-5"}</p>
          </div>
        </div>
      </div>

      {/*waves*/}
      <div className="w-full flex justify-center">
        <img
          src="/assets/Wave.png"
          alt="wave"
          className="w-full h-auto object-cover repeat-y"
        />
      </div>

      <Titulo tipo={1} />

      {/* Botões do cliente */}
      <div className="w-full overflow-x-auto">
        <div className="flex gap-5 px-4 py-4 min-w-max">
          {/* Extrato */}
          <button
            onClick={OpenExtrato}
            className="flex flex-col items-center flex-shrink-0"
          >
            <div className="flex justify-center items-center bg-[#012E4B] w-20 h-20 rounded-full">
              <FileChartColumn className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-center text-[#012E4B] pt-1">Extrato</h1>
          </button>

          {/* Depositar */}
          <button
            onClick={OpenDepositar}
            className="flex flex-col items-center flex-shrink-0"
          >
            <div className="flex justify-center items-center bg-[#012E4B] w-20 h-20 rounded-full">
              <BanknoteArrowUp className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-center text-[#012E4B] pt-1">Depositar</h1>
          </button>

          {/* Sacar */}
          <button
            onClick={OpenSacar}
            className="flex flex-col items-center flex-shrink-0"
          >
            <div className="flex justify-center items-center bg-[#012E4B] w-20 h-20 rounded-full">
              <BanknoteArrowDown className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-center text-[#012E4B] pt-1">Sacar</h1>
          </button>

          {/* Transferir */}
          <button
            onClick={OpenTransferir}
            className="flex flex-col items-center flex-shrink-0"
          >
            <div className="flex justify-center items-center bg-[#012E4B] w-20 h-20 rounded-full">
              <ArrowLeftRight className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-center text-[#012E4B] pt-1">Transferir</h1>
          </button>

          {/* Limite */}
          <button
            onClick={OpenLimite}
            className="flex flex-col items-center flex-shrink-0"
          >
            <div className="flex justify-center items-center bg-[#012E4B] w-20 h-20 rounded-full">
              <ChartCandlestick className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-center text-[#012E4B] pt-1">Limite</h1>
          </button>
        </div>
      </div>

      <Titulo tipo={2} />

      {/* Dicas */}
      <div className="flex flex-col items-center mt-4 text-[13px]">
        <div className="flex justify-center items-center w-80 text-center bg-[#012E4B] text-white px-3 py-3 rounded-[10px] shadow-md transition-all duration-500 ease-in-out">
          <p key={index} className="animate-fade font-medium">
            {dicas[index]}
          </p>
        </div>
        <div className="flex justify-center mt-2 space-x-2">
          {dicas.map((_, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full ${
                i === index ? "bg-[#0274B6] w-4" : "bg-[#012E4B]"
              } transition-all duration-300`}
            />
          ))}
        </div>
      </div>

      <Titulo tipo={3} />

      {/* Investimentos */}
      <div className="flex justify-center text-[12px]">
        <button
          onClick={goToInvestimentos}
          className=" flex justify-between items-center w-90 text-center mt-2 bg-[#012E4B] py-8 px-5 rounded-[10px]"
        >
          <div className="flex justify-center gap-20">
            <div className="flex-col text-center">
              <h2>Saldo total Investido</h2>
              <p>{ocultar ? "•••••" : "R$ 1200,00"}</p>
            </div>
            <div className="flex-col text-center">
              <h2>Rendimento</h2>
              <p className="text-[#42D23A]">
                {ocultar ? "•••••" : "+ R$ 52,50"}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Cards */}
      <Titulo tipo={4} />
      <div className="w-full overflow-x-auto">
        <div className="flex gap-5 px-4 py-4 min-w-max">
          {/* Card de convite, termos e devs */}
          <button
            onClick={goToConvidar}
            className="relative w-54 h-40 rounded-[10px] overflow-hidden shadow-lg"
          >
            <img
              src="assets/Indicar.png"
              alt="indicar"
              className="w-full h-full object-cover center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0274B6]/50 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
              <div className="flex justify-between items-center">
                <h1 className="font-semibold">Indique para Amigos</h1>
                <ChevronRight className="w-5 h-5" />
              </div>
              <p className="text-[10px] mt-1">
                Mostre como é bom fazer parte do nosso banco, com o que
                oferecemos
              </p>
            </div>
          </button>

          <button
            onClick={goToTermos}
            className="relative w-54 h-40 rounded-[10px] overflow-hidden shadow-lg"
          >
            <img
              src="assets/Banco.png"
              alt="indicar"
              className="w-full h-full object-cover center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0274B6]/50 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
              <div className="flex justify-between items-center">
                <h1 className="font-semibold">Termos de Uso</h1>
                <ChevronRight className="w-5 h-5" />
              </div>
              <p className="text-[10px] mt-1">
                Saiba mais sobre nossos termos de uso e como realmente
                trabalhamos
              </p>
            </div>
          </button>

          <button
            onClick={goToDevs}
            className="relative w-54 h-40 rounded-[10px] overflow-hidden shadow-lg"
          >
            <img
              src="assets/Devs.png"
              alt="indicar"
              className="w-full h-full object-cover center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0274B6]/50 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
              <div className="flex justify-between items-center">
                <h1 className="font-semibold">Nossos Devs</h1>
                <ChevronRight className="w-5 h-5" />
              </div>
              <p className="text-[10px] mt-1">
                Conheça o nossos desenvolvedores, que deram vida ao nosso banco
              </p>
            </div>
          </button>
        </div>
      </div>

      <Navbar />
    </main>
  );
}
