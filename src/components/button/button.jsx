'use clint';

export default function Btn({ text, onClick }) {
    return (
        <button
            onClick={onClick}
            className="text-white text-5xl font-bold rounded-full transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
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