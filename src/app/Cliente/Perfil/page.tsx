"use client";

import React, { useState, useEffect } from "react";
import { } from "lucide-react";
import { useRouter } from "next/navigation";
import Titulo from "@/components/titles";
import Navbar from "@/components/navbar";
import {ChevronRight, HandHelping, FileText, CircleFadingPlus} from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { TokenPayload } from "@/types/TokenPayload";

export default function Cliente() {
    
    const router = useRouter();

   const OpenAjuda = () => {
  router.push("/Cliente/Ajuda");
  };
    const OpenSobre = () => {
  router.push("/Cliente/Devs");
  };

    const OpenTermos = () => {
  router.push("/Termos");
  };

    // Aqui é onde pega os conteúdos do JWT -> vide o arquivo TokenPayload.ts
    const [nomeUsuario, setNomeUsuario] = useState("");
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

  return ( 
    <main className="bg-white min-h-screen text-[14px] font-bold pb-18 ">
    <div className="bg-[#012E4B] pt-2 flex-col justify-center px-5 w h-[250px] z-50 bg-wave bg-no-repeat bg-bottom bg-cover"
    
    >

      <div className="relative flex items-center justify-between  ">
        <div className="flex items-center gap-5 relative">
          <img src="/assets/Logo.png" alt="logo" className="w-8 h-8" />
          <h2 className="text-white">{nomeUsuario}</h2>
          {/* Linha passando por baixo de tudo */}
          <div className="absolute bottom-0 left-13 w-75 border-b border-white/50"></div>
        </div>
        <div className=" flex text-center gap-4">
            <h2>Ag. <span>0123-4</span></h2>
            <h2>Cc. <span>1234-5</span></h2>
        </div>
      </div>

      <div className="flex flex-col pt-5 gap-2">
        <div className=" flex-col text-start">
            <h2 className="text-gray-300">CPF</h2>
            <p>000.000.000-00</p>
        </div>

        <div className=" flex-col text-start">
            <h2 className="text-gray-300">Data de Nascimento</h2>
            <p>dd/mm/aaaa</p>
        </div>

        <div className=" flex-col text-start">
            <h2 className="text-gray-300">Telefone</h2>
            <p>(11)91234-5678</p>
        </div>

        <div className=" flex-col text-start">
            <h2 className="text-gray-300">Endereço</h2>
            <p>Rua das Flores 123- São Paulo, SP</p>
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
    
    <Titulo tipo={0}/>

        <div className="flex justify-center text-[12px] mt-2">
        <button onClick={OpenAjuda} className=" flex justify-between items-center w-90 text-center mt-2 bg-[#012E4B] py-3 px-5 rounded-[10px]">
            <div className="flex justify-center items-center gap-5">
                <HandHelping />
                Ajuda
            </div>
        <ChevronRight  className="w-5 h-5"/>
        </button> 
        </div>

        <div className="flex justify-center text-[12px]">
        <button onClick={OpenTermos} className=" flex justify-between items-center w-90 text-center mt-2 bg-[#012E4B] py-3 px-5 rounded-[10px]">
            <div className="flex justify-center items-center gap-5">
                <FileText />
                Termos
            </div>
        <ChevronRight  className="w-5 h-5"/>
        </button> 
        </div>

        <div className="flex justify-center text-[12px]">
        <button onClick={OpenSobre} className=" flex justify-between items-center w-90 text-center mt-2 bg-[#012E4B] py-3 px-5 rounded-[10px]">
            <div className="flex justify-center items-center gap-5">
                <CircleFadingPlus />
                Sobre
            </div>
        
        <ChevronRight  className="w-5 h-5"/>
        </button> 
        </div>

    <Navbar />
    </main>
  );
}
