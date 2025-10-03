import Header from "@/components/v2/header";
import Card from "@/components/v2/card";
import Footer from "@/components/v2/footer";
import ProcessSteps from "@/components/loader/process-steps";

export default function TestPage() {
    return (
        <div
            className="min-h-screen w-full flex flex-col items-center justify-center font-sans bg-gradient-to-b from-blue-400 to-blue-100 "
            style={{ padding: "150px 80px" }}
        >

            <Header />

            <div
                className="font-bold mb-10 text-white"
                style={{ fontSize: "5rem" }}
            >
                ¡Selecciona tu Servicio!
            </div>
            <div className="flex flex-col w-full gap-20 mb-20">
                <Card image={"Baño"} name={"Baño"} price={"500"} />
                <Card image={"Ducha"} name={"Ducha"} price={"3500"} />
            </div>

            <ProcessSteps />

            <Footer />
        </div>
    )
}