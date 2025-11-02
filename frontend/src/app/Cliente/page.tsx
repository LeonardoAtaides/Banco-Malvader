"use client";

import React from "react";
import { Eye, LogOut, FileChartColumn, BanknoteArrowUp, BanknoteArrowDown, ArrowLeftRight, ChartCandlestick } from "lucide-react";
import { useRouter } from "next/navigation";
import Titulo from "@/components/titles";
import { useEffect, useState } from "react";

export default function Cliente() {
    const dicas = [
        'Com o MV você consegue tirar o seu Corolla Hybrid ainda mais rápido!',
        'Acho lindo você gereciando o seu dinheiro em nosso banco!',
        'Está devendo? "Calma que vai piorar", conosco não, te ajudamos com as dívidas.'
    ];

    const [index, setIndex] = useState(0);

    // Troca automática das dicas
    useEffect(() => {
        const interval = setInterval(() => {
        setIndex((prev) => (prev + 1) % dicas.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [dicas.length]);
    const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token"); 
    router.push("/Login");
  };


  return (
    <main className="bg-white min-h-screen text-[14px] font-bold  ">
    <div className="bg-[#012E4B] pt-2 flex-col justify-center px-5 w h-[110px] z-50 bg-wave bg-no-repeat bg-bottom bg-cover"
    
    >

      <div className="relative flex items-center justify-between  ">
        <div className="flex items-center gap-5 relative">
          <img src="/assets/Logo.png" alt="logo" className="w-8 h-8" />
          <h2 className="text-white">Olá, Cliente</h2>
          {/* Linha passando por baixo de tudo */}
          <div className="absolute bottom-0 left-13 w-74 border-b border-white/50"></div>
        </div>

        <div className="flex gap-2 relative z-10">
          <Eye className="w-5 h-5" />
          <LogOut  className="w-5 h-5" onClick={handleLogout}/>
        </div>
      </div>

      <div className="flex justify-between pt-5 z-10">
        <div className="text-center">
            <h2>Saldo disponível</h2>
            <p>R$ 1200,00</p>
        </div>

        <div className="text-center">
            <h2>Conta</h2>
            <p>1234-5</p>
        </div>
        
      </div>
    </div>

    {/*waves*/ }
    <div className="w-full flex justify-center ">
        <img 
        src="/assets/Wave.png" 
        alt="wave" 
        className="w-full h-auto object-cover repeat-y" 
        />
    </div>
    
    <Titulo tipo={1}/>

    <div className="w-full overflow-x-auto">
    <div className="flex gap-5 px-4 py-4 min-w-max">

         {/* EXTARTO */}
        <button className="flex flex-col items-center flex-shrink-0">
        <div className="flex justify-center items-center bg-[#012E4B] w-20 h-20 rounded-full">
            <FileChartColumn className="w-9 h-9 text-white" />
        </div>
        <h1 className="text-center text-[#012E4B] pt-1">Extrato</h1>
        </button>

        {/* DEPOSITAR */}
        <button className="flex flex-col items-center flex-shrink-0">
        <div className="flex justify-center items-center bg-[#012E4B] w-20 h-20 rounded-full">
            <BanknoteArrowUp className="w-9 h-9 text-white" />
        </div>
        <h1 className="text-center text-[#012E4B] pt-1">Depositar</h1>
        </button>

        {/* SACAR */}
        <button className="flex flex-col items-center flex-shrink-0">
        <div className="flex justify-center items-center bg-[#012E4B] w-20 h-20 rounded-full">
            <BanknoteArrowDown className="w-9 h-9 text-white" />
        </div>
        <h1 className="text-center text-[#012E4B] pt-1">Sacar</h1>
        </button>

        {/* TRANSFERIR */}
        <button className="flex flex-col items-center flex-shrink-0">
        <div className="flex justify-center items-center bg-[#012E4B] w-20 h-20 rounded-full">
            <ArrowLeftRight className="w-9 h-9 text-white" />
        </div>
        <h1 className="text-center text-[#012E4B] pt-1">Transferir</h1>
        </button>

        {/* LIMITE */}
        <button className="flex flex-col items-center flex-shrink-0">
        <div className="flex justify-center items-center bg-[#012E4B] w-20 h-20 rounded-full">
            <ChartCandlestick className="w-9 h-9 text-white" />
        </div>
        <h1 className="text-center text-[#012E4B] pt-1">Limite</h1>
        </button>
    </div>
    </div>

    <Titulo tipo={2} /> 

    <div className="flex flex-col items-center mt-4 text-[13px]">
      {/* Card de dica */}
      <div className="flex justify-center items-center w-80 text-center bg-[#012E4B] text-white px-3 py-3 rounded-[10px] shadow-md transition-all duration-500 ease-in-out">
        <p key={index} className="animate-fade font-medium">
          {dicas[index]}
        </p>
      </div>

      {/* Indicadores */}
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

    </main>
  );
}
