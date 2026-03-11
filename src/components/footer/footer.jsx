import Image from "next/image";

export default function Footer() {
  return (
    <div
      className="fixed bottom-0 left-0 flex items-center justify-between w-full"
      style={{
        padding: "0 40px",
        minHeight: "150px",
        backgroundColor: "#013ba7",
      }}
    >
      <div className="text-white font-bold text-4xl">Baños Terminal Sur</div>

      <Image
        src="/LOGOTIPO_WIT.png"
        alt="Logo WIT"
        width={70}
        height={70}
        className="invert brightness-0 mr-3"
      />
    </div>
  );
}
