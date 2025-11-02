"use client";

import { Wrench, MessagesSquare, ChartNoAxesCombined, CirclePlus } from "lucide-react";
import { ReactElement } from "react";

interface TituloItem {
  icone: ReactElement;
  texto: string;
}

interface TituloProps {
  tipo: 1 | 2 | 3 | 4; // define os tipos possíveis (você pode adicionar mais)
}

export default function Titulo({ tipo }: TituloProps) {
  const titulos: Record<TituloProps["tipo"], TituloItem> = {
    1: {
      icone: <Wrench className="text-[#012E4B] w-[18px] h-[18px] mr-2" />,
      texto: "Serviços",
    },
    2: {
      icone: <MessagesSquare className="text-[#012E4B] text-xl mr-2" />,
      texto: "Dicas Malvader",
    },
    3: {
      icone: <ChartNoAxesCombined className="text-[#012E4B] text-xl mr-2" />,
      texto: "Investimentos",
    },
    4: {
      icone: <CirclePlus className="text-[#012E4B] text-xl mr-2" />,
      texto: "Conheça Mais",
    },
  };

  const item = titulos[tipo];

  if (!item) {
    return <h2 className="text-gray-500">Título não encontrado</h2>;
  }

  return (
    <div className="flex items-center pt-4 mx-5">
      {item.icone}
      <h1 className="text-[16px] font-semibold text-[#012E4B]">{item.texto}</h1>
    </div>
  );
}
