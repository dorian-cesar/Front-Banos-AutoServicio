"use client"

export default function Card({ servicio, precio, onClick, disabled = false }) {
    return (
        <div
            className="card rounded-4xl flex flex-col items-center gap-6 border-4 border-white border-opacity-10 backdrop-blur-sm transform transition-all duration-300"
            style={{
                backgroundColor: disabled
                    ? "rgba(255, 255, 255, 0.08)"
                    : "rgba(255, 255, 255, 0.15)",
                padding: "40px 100px",
                backdropFilter: "blur(10px)",
                opacity: disabled ? 0.6 : 1,
            }}
        >
            <h2 className="text-8xl font-bold text-white">{servicio}</h2>
            <div className="flex items-center gap-4">
                <p className="text-4xl">Precio: </p>
                <p className="text-6xl font-bold" style={{ color: '#ff5c21' }}>${precio}</p>
            </div>
            <Btn text="Pagar" onClick={onClick} disabled={disabled} />
        </div>
    )
}

function Btn({ text, onClick, disabled = false }) {
    return (
        <button
            onClick={disabled ? undefined : onClick}
            disabled={disabled}
            className={`text-white text-5xl font-bold rounded-full transition-all duration-200 shadow-lg ${disabled
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-[#ff5c21] hover:scale-105 active:scale-105 hover:bg-[#ff1c21]'
                }`}
            style={{
                minWidth: "500px",
                minHeight: "150px",
            }}
        >
            {text}
        </button>
    )
}