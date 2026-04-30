"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function Header({ onClick }) {
  const { t, language, setLanguage } = useLanguage();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 flex items-center justify-between w-full z-50"
      style={{
        padding: "0 40px",
        minHeight: "150px",
        backgroundColor: "#013ba7",
      }}
    >
      <div className="flex items-center gap-10">
        <div
          className="w-16 h-16 flex items-center justify-center cursor-pointer"
          onClick={onClick}
        >
          <Image
            src="/LOGOTIPO_BANO_V1.png"
            alt="Logo WIT"
            className="w-15 h-15 filter invert"
            width={50}
            height={50}
          />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white">{t("header.title")}</h1>
          <p className="text-2xl text-gray-200">{t("header.subtitle")}</p>
        </div>
      </div>

      <div className="flex items-center gap-12">
        {/* Language Switcher */}
        <div className="flex bg-white/10 rounded-full p-2 gap-4 items-center">
          <button
            onClick={() => setLanguage("es")}
            className={`transition-all rounded-full overflow-hidden w-16 h-16 border-4 flex items-center justify-center ${
              language === "es"
                ? "border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                : "border-transparent opacity-60 hover:opacity-100"
            }`}
            title="Español"
          >
            <svg viewBox="0 0 750 500" className="w-full h-full object-cover">
              <rect width="750" height="500" fill="#c60b1e" />
              <rect width="750" height="250" y="125" fill="#ffc400" />
            </svg>
          </button>
          <button
            onClick={() => setLanguage("en")}
            className={`transition-all rounded-full overflow-hidden w-16 h-16 border-4 flex items-center justify-center ${
              language === "en"
                ? "border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                : "border-transparent opacity-60 hover:opacity-100"
            }`}
            title="English"
          >
            <svg
              viewBox="0 0 60 30"
              preserveAspectRatio="none"
              className="w-full h-full object-cover scale-150"
            >
              <clipPath id="s">
                <path d="M0,0 v30 h60 v-30 z" />
              </clipPath>
              <clipPath id="t">
                <path d="M30,15 h30 v15 z v-15 h-30 z h-30 v-15 z v15 h30 z" />
              </clipPath>
              <g clipPath="url(#s)">
                <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
                <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
                <path
                  d="M0,0 L60,30 M60,0 L0,30"
                  clipPath="url(#t)"
                  stroke="#C8102E"
                  strokeWidth="4"
                />
                <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
                <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
              </g>
            </svg>
          </button>
          <button
            onClick={() => setLanguage("pt")}
            className={`transition-all rounded-full overflow-hidden w-16 h-16 border-4 flex items-center justify-center ${
              language === "pt"
                ? "border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                : "border-transparent opacity-60 hover:opacity-100"
            }`}
            title="Português"
          >
            <svg viewBox="0 0 600 400" className="w-full h-full object-cover">
              <rect width="600" height="400" fill="#ff0000" />
              <rect width="240" height="400" fill="#006600" />
              <circle cx="240" cy="200" r="85" fill="#ffcc00" />
            </svg>
          </button>
        </div>

        <div className="text-right ml-4">
          <div className="text-3xl font-bold text-white">
            {currentTime.toLocaleTimeString(
              language === "en" ? "en-US" : language === "pt" ? "pt-BR" : "es-CL",
              {
                timeZone: "America/Santiago",
                hour: "2-digit",
                minute: "2-digit",
              }
            )}
          </div>
          <div className="text-2xl text-gray-200">
            {currentTime.toLocaleDateString(
              language === "en" ? "en-US" : language === "pt" ? "pt-BR" : "es-CL",
              {
                timeZone: "America/Santiago",
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              }
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
