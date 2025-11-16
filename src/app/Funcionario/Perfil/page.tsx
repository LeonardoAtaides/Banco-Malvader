"use client";

import React from "react";
import { } from "lucide-react";
import { useRouter } from "next/navigation";
import Titulo from "@/components/titles";
import Navbar from "@/components/funcnavbar";
import {ChevronRight, HandHelping, FileText, CircleFadingPlus} from "lucide-react";

export default function Cliente() {
    
    const router = useRouter();

   const Ajuda = () => {
  router.push("/Funcionario/Ajuda");
  };

    const Termos = () => {
  router.push("/Termos");
  };

  return ( 
    <main className="bg-white min-h-screen text-[14px] font-bold pb-18 ">
    <div className="bg-[#012E4B] pt-2 flex-col justify-center px-5 w h-[250px] z-50 bg-wave bg-no-repeat bg-bottom bg-cover"
    
    >

      <div className="relative flex items-center justify-between  ">
        <div className="flex items-center gap-5 relative">
          <img src="/assets/Logo.png" alt="logo" className="w-8 h-8" />
          <h2 className="text-white">Nome do Fulano</h2>
          {/* Linha passando por baixo de tudo */}
          <div className="absolute bottom-0 left-13 w-75 border-b border-white/50"></div>
        </div>
        <div className=" flex text-center gap-4">
            <h2>Cargo</h2>
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
        <div className="flex justify-center text-[12px]">
        <button onClick={Termos} className=" flex justify-between items-center w-90 text-center mt-2 bg-[#012E4B] py-3 px-5 rounded-[10px]">
            <div className="flex justify-center items-center gap-5">
                <FileText />
                Termos
            </div>
        <ChevronRight  className="w-5 h-5"/>
        </button> 
        </div>

    <Navbar />
    </main>
  );
}
