"use client";

import { Wrench, MessagesSquare, ChartNoAxesCombined, CirclePlus, PiggyBank, Plus} from "lucide-react";
import { ReactElement } from "react";

interface TituloItem {
  icone: ReactElement;
  texto: string;
}

interface TituloProps {
  tipo: 0 | 1 | 2 | 3 | 4 | 5 | 6; // tipos possíveis
}

export default function Titulo({ tipo }: TituloProps) {
  const titulos: Record<TituloProps["tipo"], TituloItem> = {
    0: { icone: <Plus className="text-[#012E4B] w-[18px] h-[18px] mr-2" />, texto: "Mais Opções" },
    1: { icone: <Wrench className="text-[#012E4B] w-[18px] h-[18px] mr-2" />, texto: "Serviços" },
    2: { icone: <MessagesSquare className="text-[#012E4B] text-xl mr-2" />, texto: "Dicas Malvader" },
    3: { icone: <ChartNoAxesCombined className="text-[#012E4B] text-xl mr-2" />, texto: "Investimentos" },
    4: { icone: <CirclePlus className="text-[#012E4B] text-xl mr-2" />, texto: "Conheça Mais" },
    5: { icone: <PiggyBank className="text-white text-xl mr-2" />, texto: "Conta Poupança" },
    6: { icone: <ChartNoAxesCombined className="text-white text-xl mr-2" />, texto: "Conta Investimento" },
  };

  const item = titulos[tipo];

  if (!item) {
    return <h2 className="text-gray-500">Título não encontrado</h2>;
  }

  // Definir cor do texto: branco a partir do tipo 5, caso contrário azul escuro
  const textoCor = tipo >= 5 ? "text-white" : "text-[#012E4B]";

  return (
    <div className="flex items-center pt-4 mx-5">
      {item.icone}
      <h1 className={`text-[16px] font-semibold ${textoCor}`}>
        {item.texto}
      </h1>
    </div>
  );
}
