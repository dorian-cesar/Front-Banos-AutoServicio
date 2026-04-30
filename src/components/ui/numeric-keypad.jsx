"use client";

import { Delete, Eraser } from "lucide-react";

export default function NumericKeypad({ onKeyPress, onDelete, onClear }) {
  const keys = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "Clear",
    "0",
    "Delete",
  ];

  const handleKeyPress = (key) => {
    if (key === "Delete") {
      onDelete();
    } else if (key === "Clear") {
      onClear();
    } else {
      onKeyPress(key);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-4 w-full max-w-md mx-auto mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
      {keys.map((key) => {
        const isSpecial = key === "Delete" || key === "Clear";

        return (
          <button
            key={key}
            type="button"
            onClick={() => handleKeyPress(key)}
            className={`
              flex items-center justify-center py-6 rounded-2xl text-4xl font-black transition-all duration-200
              active:scale-95 active:bg-white/30 select-none
              ${
                isSpecial
                  ? "bg-white/5 text-blue-200 hover:bg-white/10 border border-white/10"
                  : "bg-white/10 text-white hover:bg-white/20 border border-white/20 shadow-xl shadow-black/20"
              }
            `}
          >
            {key === "Delete" ? (
              <Delete className="w-10 h-10" />
            ) : key === "Clear" ? (
              <Eraser className="w-10 h-10" />
            ) : (
              key
            )}
          </button>
        );
      })}
    </div>
  );
}
