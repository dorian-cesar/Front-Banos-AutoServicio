"use client"
import { MousePointerClickIcon, CreditCardIcon, QrCodeIcon, ChevronRight } from "lucide-react";

export default function ProcessSteps() {
    const steps = [
        {
            number: 1,
            title: "Elegir",
            description: "Escoge tu servicio",
            icon: (<MousePointerClickIcon size={48}/>),
        },
        {
            number: 2,
            title: "Pagar",
            description: "Usa tu tarjeta",
            icon: (<CreditCardIcon size={48}/>),
        },
        {
            number: 3,
            title: "Recibir",
            description: "Obtén tu ticket",
            icon: (<QrCodeIcon size={48}/>),
        },
    ]

    return (
        <div className="flex items-center justify-center gap-8 mb-8">
            {steps.map((step, index) => (
                <div key={step.number} className="flex items-center gap-8">
                    <div className="flex flex-col items-center gap-3">
                        <div
                            className="w-32 h-32 rounded-full flex items-center justify-center text-white transition-all duration-300 bg-[var(--primary)]"
                        >
                            {step.icon}
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-[var(--primary)]">
                                {step.title}
                            </div>
                            <div className="text-2xl text-gray-600">{step.description}</div>
                        </div>
                    </div>
                    {index < steps.length - 1 && (
                        <ChevronRight size={48}/>
                    )}
                </div>
            ))}
        </div>
    )
}
