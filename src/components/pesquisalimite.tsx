// components/pesquisa.tsx
"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";

type Props = {
  onSearch?: (searchTerm: string, startDate: string, endDate: string) => void;
  onClear?: () => void;
};

const LimiteSearch: React.FC<Props> = ({ onSearch, onClear }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleClear = () => {
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
    if (onClear) onClear();
  };

  const handleSearch = () => {
    if (onSearch) onSearch(searchTerm, startDate, endDate);
    else console.log("Pesquisar:", { searchTerm, startDate, endDate });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  // Função para aplicar máscara de agência: 1234-5
  const handleAgencyChange = (value: string) => {
    // Remove tudo que não é número
    let digits = value.replace(/\D/g, "");
    // Limita a 5 dígitos
    if (digits.length > 5) digits = digits.slice(0, 5);
    // Adiciona hífen antes do último dígito se houver mais de 4
    if (digits.length > 4) {
      digits = digits.slice(0, 4) + "-" + digits.slice(4);
    }
    setSearchTerm(digits);
  };

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto gap-2 pt-5 justify-center">
      <div className="flex items-center gap-2">
        <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 flex-1">
          <Search className="w-5 h-5 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Número da agência"
            value={searchTerm}
            onKeyDown={handleKeyDown}
            onChange={(e) => handleAgencyChange(e.target.value)}
            className="w-full focus:outline-none"
          />
        </div>
      </div>

      <style jsx>{`
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
        }
      `}</style>
    </div>
  );
};

export default LimiteSearch;
