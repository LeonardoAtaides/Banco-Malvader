"use client";

import { useState } from "react";
import Intro from "@/components/intro";
import { User, Users, LogOut } from "lucide-react";


export default function LoginFuncionario() {
  const [showIntro, setShowIntro] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [loginType, setLoginType] = useState<"cliente" | "funcionario" | null>(null);
const [active, setActive] = useState<"cliente" | "funcionario" | "sair" | null>(null);

  const handleIntroFinish = () => setShowIntro(false);

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  let value = e.target.value.replace(/\D/g, ""); // remove tudo que não é número

  // Aplica a máscara
  if (value.length > 9) {
    value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{0,2}).*/, "$1.$2.$3-$4");
  } else if (value.length > 6) {
    value = value.replace(/^(\d{3})(\d{3})(\d{0,3}).*/, "$1.$2.$3");
  } else if (value.length > 3) {
    value = value.replace(/^(\d{3})(\d{0,3}).*/, "$1.$2");
  }

  e.target.value = value;
};


  return (
    <>
      {showIntro && (
        <div className="fixed inset-0 w-full h-full z-50">
          <Intro onFinish={handleIntroFinish} />
        </div>
      )}

      <main className="bg-gradient-to-b from-[#012E4B] to-[#064F75] min-h-screen w-full flex flex-col justify-between">
        {/* Conteúdo do topo */}
        <div className="flex flex-col items-center pt-10">
          <img src="/assets/Logo.png" alt="Logo" className="w-10 h-10" />

          {!showLogin ? (
            <>
              <div className="text-center font-bold text-xl uppercase pt-10">
                <h2>
                  Bem-vindo! <br />
                  <span className="text-[15px] font-bold">
                    É um prazer ter você com a gente.
                  </span>
                </h2>
              </div>

              <p className="pt-20 text-center text-[15px] font-bold w-50">
                Faça login e desfrute do melhor do nosso banco!
              </p>
            </>
          ) : loginType === "cliente" ? (
            <form className="pt-14 w-[80%] max-w-xs flex flex-col gap-6 text-white">

            <div className="justify-center flex mb-10 font-bold">
              <h2 className="w-50">Acesse e conheça tudo que podemos oferecer</h2>
            </div>

              <div className="relative w-full">
                <input
                  type="text"
                  id="cpf"
                  placeholder=" "
                  required
                  className="peer w-full bg-transparent border-b border-white/50 p-2 text-white outline-none focus:border-white"
                  maxLength={14}
                  onChange={handleCPFChange}
                />
                <label
                  htmlFor="cpf"
                  className="absolute left-2 top-2 text-white text-sm transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-white/50 peer-placeholder-shown:text-base peer-focus:-top-4 peer-focus:text-white peer-focus:text-sm peer-valid:-top-4 peer-valid:text-white peer-valid:text-sm"
                >
                CPF
                </label>
              </div>


              <div className="relative w-full">
                <input
                  type="password"
                  id="senha"
                  placeholder=" "
                  required
                  className="peer w-full bg-transparent border-b border-white/50 p-2 text-white outline-none focus:border-white"
                />
                <label
                  htmlFor="senha"
                  className="absolute left-2 top-2 text-white text-sm transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-white/50 peer-placeholder-shown:text-base peer-focus:-top-4 peer-focus:text-white peer-focus:text-sm peer-valid:-top-4 peer-valid:text-white peer-valid:text-sm"
                >
                Senha
                </label>
              </div>

              <button
                type="submit"
                className="border border-white/60 bg-white/10 rounded-[10px] py-2 mt-6 font-bold hover:bg-white/90 hover:text-[#012E4B] transition"
              >
              Acessar
              </button>
            </form>
          ) : loginType === "funcionario" ? (
            <form className="pt-14 w-[80%] max-w-xs flex flex-col gap-6 text-white">

              <div className="justify-center flex mb-10 font-bold">
                <h2 className="w-70 text-center">Olá Prezado, que ótimo ter você de volta, bom expediente!</h2>
              </div>

              <div className="relative w-full">
                <input
                  type="text"
                  id="cpf"
                  placeholder=" "
                  required
                  className="peer w-full bg-transparent border-b border-white/50 p-2 text-white outline-none focus:border-white"
                  maxLength={14}
                  onChange={handleCPFChange}
                />
                <label
                  htmlFor="cpf"
                  className="absolute left-2 top-2 text-white text-sm transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-white/50 peer-placeholder-shown:text-base peer-focus:-top-4 peer-focus:text-white peer-focus:text-sm peer-valid:-top-4 peer-valid:text-white peer-valid:text-sm"
                >
                CPF
                </label>
              </div>


              <div className="relative w-full">
                <input
                  type="password"
                  id="senha"
                  placeholder=" "
                  required
                  className="peer w-full bg-transparent border-b border-white/50 p-2 text-white outline-none focus:border-white"
                />
                <label
                  htmlFor="senha"
                  className="absolute left-2 top-2 text-white text-sm transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-white/50 peer-placeholder-shown:text-base peer-focus:-top-4 peer-focus:text-white peer-focus:text-sm peer-valid:-top-4 peer-valid:text-white peer-valid:text-sm"
                >
                Senha
                </label>
              </div>


              <button
                type="submit"
                className="border border-white/60 bg-white/10 rounded-[10px] py-2 mt-6 font-bold hover:bg-white/90 hover:text-[#012E4B] transition"
              >
              Acessar
              </button>
            </form>
          ) : null}
        </div>

        {/* Menu fixado no rodapé */}
        <div className="flex justify-center gap-5 pb-2">
          <button
            onClick={() => {
              setShowLogin(true);
              setLoginType("cliente");
              setActive("cliente")
            }}
            className={`w-[110px] h-[90px] border border-white/50 rounded-[10px] flex flex-col items-center justify-center text-center
          ${active === "cliente" ? "bg-white/10" : ""}`}
          >
            <User className="w-8 h-8 mb-2" />
            <p className="text-[14px]">Cliente</p>
          </button>

          <button
            onClick={() => {
              setShowLogin(true);
              setLoginType("funcionario");
              setActive("funcionario")
            }}
           className={`w-[110px] h-[90px] border border-white/50 rounded-[10px] flex flex-col items-center justify-center text-center
          ${active === "funcionario" ? "bg-white/10" : ""}`}
      >
            <Users className="w-8 h-8 mb-2" />
            <p className="text-[14px]">Funcionário</p>
          </button>

          <button
            onClick={() => {
              setShowLogin(false);
              setLoginType(null);
              setActive(null)
              setShowIntro(true)
            }}
            className="w-[110px] h-[90px] border border-white/50 rounded-[10px] flex flex-col items-center justify-center text-center hover:bg-white/10"
          >
            <LogOut className="w-8 h-8 mb-2" />
            <p className="text-[14px]">Sair</p>
          </button>
        </div>
      </main>
    </>
  );
}
