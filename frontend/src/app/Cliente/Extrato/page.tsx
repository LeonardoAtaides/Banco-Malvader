// app/.../extrato.tsx (ou onde estiver sua page)
"use client";

import React, { useMemo, useState } from "react";
import { X, BanknoteArrowUp, BanknoteArrowDown, ArrowLeftRight, ChartCandlestick } from "lucide-react";
import { useRouter } from "next/navigation";
import Search from "@/components/pesquisa";

const parseBRDateTime = (br: string) => {
  // br: "12/05/2025 10:35" -> Date
  const [datePart, timePart] = br.split(" ");
  const [day, month, year] = datePart.split("/").map(Number);
  const [hour = 0, minute = 0] = timePart ? timePart.split(":").map(Number) : [];
  return new Date(year, month - 1, day, hour, minute);
};

const Extrato: React.FC = () => {
  const router = useRouter();
  const [filters, setFilters] = useState({ searchTerm: "", startDate: "", endDate: "" });

  const handleBack = () => {
    router.back();
  };

  // lista padrão de transações (datas em formato BR para manter visual)
  const transacoes = [
    { tipo: "Depósito", valor: "+ R$ 380,00", data: "12/05/2025 10:35", icone: BanknoteArrowUp, cor: "#42D23A" },
    { tipo: "Saque", valor: "- R$ 120,00", data: "12/05/2025 12:10", icone: BanknoteArrowDown, cor: "#E53935" },
    { tipo: "Transferência", valor: "+ R$ 980,00", data: "13/05/2025 09:12", icone: ArrowLeftRight, cor: "#42D23A" },
    { tipo: "Pagamento", valor: "- R$ 250,00", data: "13/05/2025 14:47", icone: ArrowLeftRight, cor: "#E53935" },
    { tipo: "Transferência", valor: "- R$ 360,00", data: "15/05/2025 16:05", icone: ArrowLeftRight, cor: "#E53935" },
    { tipo: "Depósito", valor: "+ R$ 1.200,00", data: "16/05/2025 08:50", icone: BanknoteArrowUp, cor: "#42D23A" },
    { tipo: "Depósito", valor: "+ R$ 283,34", data: "12/05/2025 15:33", icone: BanknoteArrowUp, cor: "#42D23A" },
    { tipo: "Depósito", valor: "+ R$ 25,14", data: "12/05/2025 16:23", icone: BanknoteArrowUp, cor: "#42D23A" },
  ];

  // filtra a lista com base em filters
  const filtered = useMemo(() => {
    const { searchTerm, startDate, endDate } = filters;
    // converte start/end (inputs date -> yyyy-mm-dd) para Date comparável
    const start = startDate ? new Date(`${startDate}T00:00:00`) : null;
    const end = endDate ? new Date(`${endDate}T23:59:59`) : null;

    return transacoes.filter((t) => {
      // filtro por texto (tipo ou valor)
      const lowerSearch = searchTerm.trim().toLowerCase();
      if (lowerSearch) {
        const matchText =
          t.tipo.toLowerCase().includes(lowerSearch) ||
          t.valor.toLowerCase().includes(lowerSearch);
        if (!matchText) return false;
      }

      // filtro por data
      if (start || end) {
        const dt = parseBRDateTime(t.data);
        if (start && dt < start) return false;
        if (end && dt > end) return false;
      }

      return true;
    });
  }, [filters]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#012E4B] to-[#064F75] text-white flex flex-col justify-between">
      <div className="px-5 py-5">
        {/* Header */}
        <div className="relative">
          <button
            className="absolute top-0 left-0 hover:text-white/70 transition"
            onClick={handleBack}
          >
            <X className="w-8 h-8" />
          </button>
        </div>

        <h1 className="pt-12 text-center text-2xl font-bold">Últimas Transações</h1>

        {/* Barra de Pesquisa (agora passamos onSearch) */}
        <Search
          onSearch={(searchTerm, startDate, endDate) =>
            setFilters({ searchTerm, startDate, endDate })
          }
          onClear={() => setFilters({ searchTerm: "", startDate: "", endDate: "" })}
        />

        {/* Lista de Transações */}
        <div className="mt-4 flex flex-col gap-3">
          {filtered.length === 0 && (
            <p className="text-center text-sm text-gray-300 py-6">Nenhuma transação encontrada</p>
          )}

          {filtered.map((item, index) => {
            const Icone = item.icone;
            return (
              <div
                key={index}
                className="flex items-center justify-between px-5 py-3 bg-white/10 rounded-2xl border border-white/20"
              >
                {/* Ícone e descrição */}
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full" style={{ backgroundColor: `${item.cor}20` }}>
                    <Icone className="w-6 h-6" style={{ color: item.cor }} />
                  </div>

                  <div className="flex flex-col">
                    <h2 className="text-sm font-medium text-white">{item.tipo}</h2>
                    <p className="text-[11px] text-gray-300">{item.data}</p>
                  </div>
                </div>

                {/* Valor */}
                <h2 className="font-semibold text-sm" style={{ color: item.cor }}>
                  {item.valor}
                </h2>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
};

export default Extrato;
