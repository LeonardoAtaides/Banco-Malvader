"use client";

import React from "react";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface Dev {
  nome: string;
  funcao: string;
  descricao: string;
  foto: string; 
}


const devs: Dev[] = [
  {
    nome: "Ataídes",
    funcao: "Frontend Developer",
    descricao:
      "Responsável pelo design e implementação das interfaces.",
    foto: "/assets/dev1.png",
  },
  {
    nome: "Lobo",
    funcao: "Backend Developer",
    descricao:
      "Cuida da arquitetura do servidor, APIs e integração com banco de dados.",
    foto: "/assets/dev2.png",
  },
  {
    nome: "Renan",
    funcao: "Backend Developer",
    descricao:
      "Cuida da arquitetura do servidor, APIs e integração com banco de dados.",
    foto: "/assets/dev3.png",
  },
  {
    nome: "Joel",
    funcao: "Database Developer",
    descricao:
      "Responsável pelo banco de dados e integração com o back-end.",
    foto: "/assets/dev4.png",
  },
];

const DevsPage: React.FC = () => {
  const router = useRouter();

  const handleBack = () => {
    router.back(); 
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#012E4B] to-[#064F75] text-white ">
        <div className="px-5 py-8">

        
      {/* Header */}
      <div className="flex  mb-2">
        <button
          className="mr-2  hover:text-white/70 transition"
          onClick={handleBack}
        >
          <ChevronLeft className="w-8 h-8" />
        </button>

      </div>
      <h1 className="flex-1 text-center text-2xl font-bold">
          Nossos <br/>Desenvolvedores
        </h1>

      {/* Subtítulo */}
      <p className="text-[12px] mt-4 mb-6 text-[#ccc] text-justify">
        O Banco Malvader foi desenvolvido por estudantes do curso de Ciência da Computação da UCB, sob a
        orientação do professor Willian Malvezzi.
      </p>

      {/* Lista de desenvolvedores */}
      <div className="space-y-6">
        {devs.map((dev, idx) => (
          <div
            key={idx}
            className="flex gap-4 items-center bg-white/5  p-3 rounded-lg  hover:bg-white/10 transition"
          >
            {/* Avatar com foto */}
            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border border-white">
              <img
                src={dev.foto}
                alt={dev.nome}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Informações */}
            <div className="flex-1 text-[13px]">
              <p className="font-semibold">
                {dev.nome} - {dev.funcao}
              </p>
              <p className="mt-1 leading-snug">{dev.descricao}</p>
            </div>
          </div>
        ))}
      </div>

    </div>        
    {/*waves*/ }
    <div className="w-full flex justify-center ">
        <img 
        src="/assets/Wave_white.png" 
        alt="wave" 
        className="w-full h-auto object-cover repeat-y opacity-60" 
        />
    </div>
    </main>
  );
};

export default DevsPage;
