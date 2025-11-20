"use client";
import React from "react";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const TermosPage: React.FC = () => {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#012E4B] to-[#064F75] text-white flex flex-col">

    <div className="px-5 py-5 ">
    
      {/* Header */}
      <div className="relative">
      <button
      className="absolute top-0 left-0 hover:text-white/70 transition"
      onClick={handleBack}
      >
      <ChevronLeft className="w-8 h-8" />
      </button>
      </div>

        <h1 className=" pt-12 flex-1 text-center text-2xl font-bold">
          Termos de Uso
          <br />
          Banco Malvader
        </h1>      

      {/* Conteúdo dos termos */}
      <div className="flex-1 mt-14 overflow-y-auto text-[13px] leading-relaxed">
        <p className="mb-4">
          <strong>1. Finalidade do Projeto:</strong> <br />
          O Banco Malvader é um projeto acadêmico desenvolvido por estudantes do curso de Ciência da Computação, com o objetivo de aprovação na disciplina de Laboratório de Banco de Dados.
        </p>

        <p className="mb-4">
          <strong>2. Caráter Educacional e Não Comercial:</strong> <br />
          O sistema foi criado exclusivamente para fins educacionais, sem fins lucrativos e sem qualquer relação com bancos reais ou atividades financeiras verdadeiras.
        </p>

        <p className="mb-4">
          <strong>3. Uso de Dados Simulados:</strong> <br />
          Todos os dados apresentados como nomes, e-mails, CPFs e valores, são fictícios e gerados para simulação. Nenhuma informação pessoal real é coletada, armazenada ou utilizada.
        </p>

        <p className="mb-4">
          <strong>4. Responsabilidade de Uso:</strong> <br />
          Os desenvolvedores não se responsabilizam por qualquer uso indevido do sistema fora do contexto acadêmico para o qual foi criado.
        </p>

        <p className="mb-4">
          <strong>5. Direitos e Limitações:</strong> <br />
          O projeto é de uso estritamente educacional e não pode ser reproduzido ou comercializado sem autorização dos autores.
        </p>
      </div>
      
      </div>

      {/* Wave no rodapé */}
      <div className="w-full flex justify-center ">
        <img
          src="/assets/Wave_white.png"
          alt="wave"
          className="w-full h-auto object-cover opacity-60"
        />
      </div>
    </main>
  );
};

export default TermosPage;
