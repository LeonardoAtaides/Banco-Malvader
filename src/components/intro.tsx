"use client";
import { useEffect, useState } from "react";
interface IntroProps {
  onFinish: () => void;
}

// Versão Desktop
const IntroDesktop: React.FC<IntroProps> = ({ onFinish }) => {
  const [phase, setPhase] = useState<number>(0);
  const [fadeOut, setFadeOut] = useState<boolean>(false);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 500);   
    const t2 = setTimeout(() => setPhase(2), 1500); 
    const t3 = setTimeout(() => setFadeOut(true), 4500);
    const t4 = setTimeout(() => onFinish(), 5200);   

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onFinish]);

return (
    <div
      className={`fixed inset-0 z-50 bg-gradient-to-b from-[#012E4B] to-[#064F75] flex items-center justify-center transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="relative flex items-center justify-center w-full h-full">
        {/* LOGO */}
        <div
          className={`absolute transition-all duration-1000 ease-in-out ${
            phase >= 1 ? "opacity-100" : "opacity-0"
          }`}
          style={{
            top: "50%",
            left: phase >= 2 ? "40%" : "50%", 
            transform: "translate(-50%, -50%)",
          }}
        >
          <img
            src="/assets/Logo.png"
            alt="Logo"
            className="w-40 h-40"
          />
        </div>

        {/* TEXTO */}
        <div
          className={`absolute transition-all duration-1200 ease-in-out ${
            phase >= 2 ? "opacity-100" : "opacity-0"
          }`}
          style={{
            top: "50%",
            left: "calc(40% + 150px)", 
            transform: "translate(0, -50%)",
          }}
        >
          <h1 className="text-6xl font-bold tracking-wide uppercase text-white">
            Malvader<br />
            Bank
          </h1>
        </div>
      </div>
    </div>
);

};

// Versão Mobile
const IntroMobile: React.FC<IntroProps> = ({ onFinish }) => {
  const [phase, setPhase] = useState<number>(0);
  const [fadeOut, setFadeOut] = useState<boolean>(false);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 500);
    const t2 = setTimeout(() => setPhase(2), 1500);
    const t3 = setTimeout(() => setFadeOut(true), 4500);
    const t4 = setTimeout(() => onFinish(), 5200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50  bg-gradient-to-b from-[#012E4B] to-[#064F75] flex items-center justify-center transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="relative flex items-center justify-center w-full h-full">
        {/* Logo animada */}
        <div
          className={`absolute transition-all duration-1000 ease-in-out ${
            phase >= 1 ? "opacity-100" : "opacity-0"
          }`}
          style={{
            top: "50%",
            left: phase >= 2 ? "30%" : "50%", 
            transform: "translate(-50%, -50%)",
          }}
        >
          <img src="/assets/Logo.png" alt="Logo" className="w-22 h-22" />
        </div>

        {/* Texto próximo à logo */}
        <div
          className={`absolute transition-all duration-1200 ease-in-out ${
            phase >= 2 ? "opacity-100" : "opacity-0"
          }`}
          style={{
            top: "50%",
            left: "calc(10% + 130px)",
            transform: "translate(0, -50%)", 
          }}
        >
          <h1 className="text-2xl font-bold tracking-wide uppercase text-white">
            Malvader<br />
            Bank
          </h1>
        </div>
      </div>
    </div>
  );
};


const Intro: React.FC<IntroProps> = ({ onFinish }) => {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile ? <IntroMobile onFinish={onFinish} /> : <IntroDesktop onFinish={onFinish} />;
};

export default Intro;
