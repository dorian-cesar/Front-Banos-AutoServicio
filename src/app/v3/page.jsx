import Image from "next/image";

import Header from "@/components/v3/header";
import Footer from "@/components/v3/footer";

export default function TestPage() {
    return (
        <div
            className="min-h-screen w-full flex flex-col items-center justify-center font-sans bg-gradient-to-b from-[var(--primary)] to-blue-200 "
            style={{ padding: "150px 80px" }}
        >

            <Header />

            <div
                className="bg-[var(--primary)] p-20 rounded-full"
                style={{
                    border: "20px solid white"
                }}
            >
                <Image
                    src="/LOGOTIPO_BANO_V1.png"
                    alt="Logo Baño"
                    className="w-40 h-40 filter invert"
                    width={300}
                    height={300}
                />
            </div>
            <div className="flex flex-col w-full gap-20 mb-20">
            </div>

            <Footer />
        </div>
    )
}