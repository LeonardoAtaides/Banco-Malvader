"use client";
import React, { useState } from "react";
import { Search, Funnel, Trash2, Check } from "lucide-react";

type Props = {
  onSearch?: (searchTerm: string, startDate: string, endDate: string) => void;
  onClear?: () => void;
};

const ExtratoSearch: React.FC<Props> = ({ onSearch, onClear }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilter, setShowFilter] = useState(false);

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

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto gap-2 pt-5 justify-center">
      {/* Campo de busca com ícone de filtro */}
      <div className="flex items-center gap-2">
        <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 flex-1">
          <Search className="w-5 h-5 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Buscar"
            value={searchTerm}
            onKeyDown={handleKeyDown}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full focus:outline-none"
          />
        </div>
        <button
          onClick={() => setShowFilter(!showFilter)}
          className="p-2 border border-gray-300 rounded-lg hover:bg-white/90"
        >
          <Funnel className="w-5 h-5 text-white hover:text-[#012E4B]" />
        </button>
      </div>

      {showFilter && (
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 flex-1">
            <input
              type="date"
              placeholder="Data Início"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-25 focus:outline-none text-white bg-transparent"
            />
          </div>

          <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 flex-1">
            <input
              type="date"
              placeholder="Data Fim"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-25 focus:outline-none text-white bg-transparent"
            />
          </div>

          {/* Botões de ação */}
          <button
            onClick={handleClear}
            className="bg-[#D04141] hover:bg-red-600 p-2 rounded-lg flex items-center justify-center"
          >
            <Trash2 className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={handleSearch}
            className="bg-[#42D23A] hover:bg-green-600 p-2 rounded-lg flex items-center justify-center"
          >
            <Check className="w-4 h-4 text-white" />
          </button>
        </div>
      )}

      <style jsx>{`
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
        }
      `}</style>
    </div>
  );
};

export default ExtratoSearch;
