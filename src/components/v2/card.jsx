import Image from "next/image"
export default function Card({ image, name, price, onClick, disabled = false }) {
    return (
        <div
            className={`flex py-10 px-20 rounded-4xl gap-20 w-full justify-between transition-all duration-300
                ${disabled
                    ? "bg-white/10 border-gray-400 opacity-70"
                    : "bg-[rgba(1,59,167,0.5)] border-[5px] border-[var(--primary)]"}`
            }
        >
            <Image
                src={`/${image}.png`}
                alt="Logo"
                className={`filter invert transition-opacity ${disabled ? "opacity-60" : "opacity-100"}`}
                width={200}
                height={200}
            />
            <div className="flex flex-col justify-between"
                style={{
                    width: "400px"
                }}
            >
                <div className="flex items-center justify-between gap-10">
                    <h2 className="text-7xl font-bold text-white m-0">
                        {name}
                    </h2>
                    <p className="text-4xl font-bold text-white m-0">${price}</p>
                </div>

                <button
                    className={`w-full p-7 rounded-full font-bold text-4xl transition-colors duration-200
                        ${disabled
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-[var(--secondary)] text-white hover:bg-[var(--secondary)]/80"}`}
                    disabled={disabled}
                    onClick={onClick}
                >
                    {disabled ? "No disponible" : "Pagar"}
                </button>
            </div>
        </div>
    )
}