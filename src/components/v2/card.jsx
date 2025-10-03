import Image from "next/image"
export default function Card({ image, name, price }) {
    return (
        <div
            className="flex py-10 px-20 rounded-4xl gap-20 w-full justify-between"
            style={{
                border: "5px solid var(--primary)",
                backgroundColor: "rgba(1, 59, 167, 0.5)"
            }}
        >
            <Image
                src={`/${image}.png`}
                alt="Logo"
                className="filter invert"
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
                    className="bg-[var(--secondary)] w-full p-7 rounded-full font-bold text-4xl text-white"
                >
                    Pagar
                </button>
            </div>
        </div>
    )
}