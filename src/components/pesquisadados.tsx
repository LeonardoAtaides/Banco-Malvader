"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";

type Props = {
  onSearch?: (searchTerm: string) => void;
  onClear?: () => void;
};

const DadosSearch: React.FC<Props> = ({ onSearch, onClear }) => {
  const [searchTerm, setSearchTerm] = useState("");

  // 🔎 Função de busca
  const handleSearch = (term = searchTerm) => {
    if (onSearch) onSearch(term);
    else console.log("Pesquisar:", term);
  };



  return (
    <div className="flex flex-col w-full max-w-lg mx-auto gap-3 pt-5">
      {/* Campo de busca */}
      <div className="flex items-center gap-2">
        <div className="flex items-center border border-white/20 bg-white/5 rounded-lg px-3 py-2 flex-1">
          <Search className="w-5 h-5 text-white/60 mr-2" />
          <input
            type="text"
            placeholder="Busque pelo CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full bg-transparent text-white placeholder-white/40 focus:outline-none"
          />
        </div>

      </div>
    </div>
  );
};

export default DadosSearch;
