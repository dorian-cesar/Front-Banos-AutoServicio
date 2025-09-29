"use client"

export default function Card({ servicio, precio, onClick}) {
    return (
        <div
            className="card rounded-3xl flex flex-col items-center gap-6 shadow-2xl border-4 border-white border-opacity-20 backdrop-blur-sm transform hover:scale-102 transition-all duration-300"
            style={{
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                padding: "40px 100px",
                backdropFilter: "blur(10px)",
            }}
        >
            <h2 className="text-6xl font-bold text-white">{servicio}</h2>
           <div className="flex items-center gap-4"><p className="text-4xl">Precio: </p><p className="text-6xl font-bold" style={{ color: '#ff5c21' }}>${precio}</p></div> 
            <Btn text="Imprimir" onClick={onClick} />
        </div>
    )
}

function Btn({ text, onClick }) {
    return (
        <button
            onClick={onClick}
            className="text-white text-5xl font-bold rounded-full transition-all duration-200 hover:scale-105 active:scale-105 hover:bg-[#ff1c21] shadow-lg"
            style={{
                backgroundColor: "#ff5c21",
                minWidth: "500px",
                minHeight: "150px",
            }}
        >
            {text}
        </button>
    )
}