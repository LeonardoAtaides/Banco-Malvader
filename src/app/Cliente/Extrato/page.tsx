"use client";

import React, { useEffect, useState, useMemo } from "react";
import { X, BanknoteArrowUp, BanknoteArrowDown, ArrowLeftRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Search from "@/components/pesquisa";

interface Transacao {
  id_transacao: number;
  id_conta_origem: number | null;
  id_conta_destino: number | null;
  tipo_transacao: "DEPOSITO" | "SAQUE" | "TRANSFERENCIA" | "TAXA" | "RENDIMENTO";
  valor: string;
  data_hora: string;
}

const Extrato: React.FC = () => {
  const router = useRouter();
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [filters, setFilters] = useState({ searchTerm: "", startDate: "", endDate: "" });

  const handleBack = () => router.back();

  const parseBRDateTime = (dataStr: string) => {
    const dt = new Date(dataStr);
    const dia = String(dt.getDate()).padStart(2, "0");
    const mes = String(dt.getMonth() + 1).padStart(2, "0");
    const ano = String(dt.getFullYear()).slice(-2);
    const hora = String(dt.getHours()).padStart(2, "0");
    const min = String(dt.getMinutes()).padStart(2, "0");
    return `${dia}/${mes}/${ano} ${hora}:${min}`;
  };

  const formatBRCurrency = (valor: string) => {
    const num = Number(valor);
    if (isNaN(num)) return valor;
    return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/Login");
      return;
    }

    async function fetchTransacoes() {
      try {
        const res = await fetch("/api/transacao", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Erro ao buscar transações");

        const data = await res.json();
        setTransacoes(data);
      } catch (err) {
        console.error("Erro ao buscar transações:", err);
      }
    }

    fetchTransacoes();
  }, []);

  const filtered = useMemo(() => {
    const { searchTerm, startDate, endDate } = filters;
    const start = startDate ? new Date(`${startDate}T00:00:00`) : null;
    const end = endDate ? new Date(`${endDate}T23:59:59`) : null;

    return transacoes.filter((t) => {
      const lowerSearch = searchTerm.toLowerCase();
      const tipoDesc = t.tipo_transacao.toLowerCase();
      const valorDesc = t.valor.toString().toLowerCase();

      if (lowerSearch && !tipoDesc.includes(lowerSearch) && !valorDesc.includes(lowerSearch)) return false;

      if (start || end) {
        const dt = new Date(t.data_hora);
        if (start && dt < start) return false;
        if (end && dt > end) return false;
      }

      return true;
    });
  }, [filters, transacoes]);

  const mostrarLista = useMemo(() => {
    if (filters.searchTerm || filters.startDate || filters.endDate) {
      return filtered; 
    }
    return filtered.slice(0, 7); 
  }, [filtered, filters]);

  const getIconAndColor = (tipo: string) => {
    switch (tipo) {
      case "DEPOSITO":
      case "RENDIMENTO":
        return { icon: BanknoteArrowUp, color: "#42D23A" };
      case "SAQUE":
      case "TAXA":
        return { icon: BanknoteArrowDown, color: "#E53935" };
      case "TRANSFERENCIA":
        return { icon: ArrowLeftRight, color: "#42D23A" };
      default:
        return { icon: ArrowLeftRight, color: "#FFFFFF" };
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#012E4B] to-[#064F75] text-white flex flex-col justify-between">
      <div className="px-5 py-5">
        {/* Header */}
        <div className="relative">
          <button className="absolute top-0 left-0 hover:text-white/70 transition" onClick={handleBack}>
            <X className="w-8 h-8" />
          </button>
        </div>

        <h1 className="pt-12 text-center text-2xl font-bold">Últimas Transações</h1>

        {/* Barra de pesquisa */}
        <Search
          onSearch={(searchTerm, startDate, endDate) =>
            setFilters({ searchTerm, startDate, endDate })
          }
          onClear={() => setFilters({ searchTerm: "", startDate: "", endDate: "" })}
        />

        {/* Lista de transações */}
        <div className="mt-4 flex flex-col gap-3">
          {mostrarLista.length === 0 && (
            <p className="text-center text-sm text-gray-300 py-6">Nenhuma transação encontrada</p>
          )}

          {mostrarLista.map((item) => {
            const { icon: Icone, color } = getIconAndColor(item.tipo_transacao);
            const valorFormat = (item.tipo_transacao === "SAQUE" || item.tipo_transacao === "TAXA")
              ? `- ${formatBRCurrency(item.valor)}`
              : `+ ${formatBRCurrency(item.valor)}`;

            return (
              <div
                key={item.id_transacao}
                className="flex items-center justify-between px-5 py-3 bg-white/10 rounded-2xl border border-white/20"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full" style={{ backgroundColor: `${color}20` }}>
                    <Icone className="w-6 h-6" style={{ color }} />
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-sm font-medium text-white">{item.tipo_transacao}</h2>
                    <p className="text-[11px] text-gray-300">{parseBRDateTime(item.data_hora)}</p>
                  </div>
                </div>
                <h2 className="font-semibold text-sm" style={{ color }}>{valorFormat}</h2>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
};

export default Extrato;
