"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronDown, ChevronUp, Search } from "lucide-react";
import { useRouter } from "next/navigation";

const Ajuda: React.FC = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleBack = () => {
    router.back();
  };

  const faqs = [
    {
      pergunta: "Como sacar meu dinheiro?",
      resposta:
        'Acesse a opção "Sacar" no menu principal, informe o valor e confirme com sua senha.',
    },
    {
      pergunta: "Como transferir meu dinheiro?",
      resposta:
        'Acesse a opção "Transferir" no menu principal, informe a conta de destino e o valor. Confirme com sua senha.',
    },
    {
      pergunta: "Como depositar o meu dinheiro?",
      resposta:
        'Para depositar, acesse a opção "Depositar" no menu principal, o valor e confirme com sua senha.',
    },
    {
      pergunta: "Como ver o meu limite?",
      resposta:
        'Você pode visualizar seu limite acessando a opção "Limite" no menu principal.',
    },
    {
      pergunta: "Como ver o meu extrato?",
      resposta:
        'Entre em "Extrato" no menu principal para ver todas as movimentações da sua conta.',
    },
  ];

  // Filtra as FAQs conforme o termo de busca
  const faqsFiltradas = faqs.filter((faq) =>
    faq.pergunta.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#012E4B] to-[#064F75] text-white flex flex-col">
      <div className="px-5 py-5 flex-1">
        {/* Header */}
        <div className="relative">
          <button
            className="absolute top-0 left-0 hover:text-white/70 transition"
            onClick={handleBack}
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
        </div>

        <h1 className="pt-12 text-center text-2xl font-bold">Ajuda</h1>

        {/* Barra de pesquisa */}
        <div className="flex items-center bg-white/10 border border-white/30 rounded-full px-4 py-2 mt-6">
          <Search className="w-5 h-5 text-white/70" />
          <input
            type="text"
            placeholder="Buscar"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent flex-1 ml-2 text-white placeholder-white/70 outline-none"
          />
        </div>

        {/* FAQs */}
        <div className="flex flex-col space-y-3 mt-6">
          {faqsFiltradas.length > 0 ? (
            faqsFiltradas.map((faq, index) => (
              <div
                key={index}
                className="border border-white/30 bg-white/10 rounded-lg p-3 transition-all"
              >
                <button
                  className="w-full flex justify-between items-center text-left"
                  onClick={() =>
                    setOpenIndex(openIndex === index ? null : index)
                  }
                >
                  <span className="text-base font-medium">
                    {index + 1}. {faq.pergunta}
                  </span>
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-white/70" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-white/70" />
                  )}
                </button>

                {/* Resposta */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openIndex === index ? "max-h-40 mt-2" : "max-h-0"
                  }`}
                >
                  <p className="text-sm text-white/80">{faq.resposta}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-white/70 mt-10">
              Nenhum resultado encontrado.
            </p>
          )}
        </div>
      </div>

      {/* Wave no rodapé */}
      <div className="w-full flex justify-center">
        <img
          src="/assets/Wave_white.png"
          alt="wave"
          className="w-full h-auto object-cover opacity-60"
        />
      </div>
    </main>
  );
};

export default Ajuda;
