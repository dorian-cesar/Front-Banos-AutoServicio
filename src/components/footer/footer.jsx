
import Image from "next/image";

export default function Footer() {
    return (
        <div
            className="fixed bottom-0 left-0 flex items-center justify-between w-full"
            style={{
                padding: "0 40px",
                minHeight: "150px",
                backgroundColor: "#013ba7"
            }}
        >

            <Image
                src="/LOGOTIPO_PB.png"
                alt="Logo PB"
                width={400}
                height={200}
            />

        </div>
    )
}
