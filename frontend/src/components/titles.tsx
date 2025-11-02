"use client";

import { Wrench, MenuSquare, ChartPie } from "lucide-react";
import { ReactElement } from "react";

interface TituloItem {
  icone: ReactElement;
  texto: string;
}

interface TituloProps {
  tipo: 1 | 2 | 3; // define os tipos possíveis (você pode adicionar mais)
}

export default function Titulo({ tipo }: TituloProps) {
  const titulos: Record<TituloProps["tipo"], TituloItem> = {
    1: {
      icone: <Wrench className="text-[#012E4B] w-5 h-5 mr-2" />,
      texto: "Serviços",
    },
    2: {
      icone: <MenuSquare className="text-[#012E4B] text-xl mr-2" />,
      texto: "Dicas",
    },
    3: {
      icone: <ChartPie className="text-[#012E4B] text-xl mr-2" />,
      texto: "Investimentos",
    },
  };

  const item = titulos[tipo];

  if (!item) {
    return <h2 className="text-gray-500">Título não encontrado</h2>;
  }

  return (
    <div className="flex items-center mx-5">
      {item.icone}
      <h1 className="text-xl font-semibold text-gray-900">{item.texto}</h1>
    </div>
  );
}
