"use client";

import React, { useState, useEffect } from "react";
import { Search, Funnel, Check } from "lucide-react";

type Props = {
  onSearch?: (searchTerm: string, filtro: string) => void;
  onClear?: () => void;
};

const DadosSearch: React.FC<Props> = ({ onSearch, onClear }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filtro, setFiltro] = useState("Conta");
  const [showSelect, setShowSelect] = useState(false);
  const [openSelect, setOpenSelect] = useState(false);

  const filtros = ["Conta", "Cliente", "Funcionário"];

  // 👉 Máscara de CPF
  const formatarCPF = (valor: string) => {
    let v = valor.replace(/\D/g, ""); // remove tudo que não é número
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    return v;
  };

  // 🔎 Função de busca
  const handleSearch = (term = searchTerm, tipo = filtro) => {
    if (onSearch) onSearch(term, tipo);
    else console.log("Pesquisar:", { term, tipo });
  };

  // ❌ Limpar
  const handleClear = () => {
    setSearchTerm("");
    if (onClear) onClear();
  };

  // 🚀 Dispara busca automática ao trocar o tipo
  useEffect(() => {
    if (searchTerm.trim() !== "") {
      handleSearch(searchTerm, filtro);
    }
  }, [filtro]);

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto gap-3 pt-5 relative">
      {/* Campo de busca */}
      <div className="flex items-center gap-2">
        {/* Input */}
        <div className="flex items-center border border-white/20 bg-white/5 rounded-lg px-3 py-2 flex-1">
          <Search className="w-5 h-5 text-white/60 mr-2" />
          <input
            type="text"
            placeholder="Busque pelo CPF..."
            value={searchTerm}
            onChange={(e) => {
              const value = formatarCPF(e.target.value);
              setSearchTerm(value);

              // 🔥 dispara automaticamente conforme digita
              if (value.trim() !== "") handleSearch(value, filtro);
              else handleClear();
            }}
            className="w-full bg-transparent text-white placeholder-white/40 focus:outline-none"
          />
        </div>

        {/* Botão filtro */}
        <button
          onClick={() => {
            setShowSelect(!showSelect);
            setOpenSelect(!openSelect);
          }}
          className="p-2 border border-white/20 rounded-lg bg-white/5 hover:bg-white/10 transition relative"
        >
          <Funnel className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Dropdown */}
      {showSelect && (
        <div className="absolute right-0 top-16 w-40 z-30">
          <div className="relative">
            {openSelect && (
              <div className="absolute z-20 w-full bg-[#012E4B] rounded-md shadow-md border border-white/20 overflow-hidden">
                {filtros.map((tipo) => (
                  <div
                    key={tipo}
                    onClick={() => {
                      setFiltro(tipo);
                      setOpenSelect(false);
                      setShowSelect(false);
                      // 🔥 busca automática ao trocar filtro
                      if (searchTerm.trim() !== "") handleSearch(searchTerm, tipo);
                    }}
                    className={`px-3 py-2 text-sm flex justify-between items-center hover:bg-white/10 cursor-pointer ${
                      filtro === tipo ? "text-white" : "text-white/80"
                    }`}
                  >
                    <span>{tipo}</span>
                    {filtro === tipo && <Check className="w-4 h-4 text-white" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DadosSearch;
