"use client";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function Header({onClick}) {
    const [currentTime, setCurrentTime] = useState(new Date())
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date())
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    return (
        <div
            className="fixed top-0 left-0 flex items-center justify-between w-full"
            style={{
                padding: "0 40px",
                minHeight: "150px",
                backgroundColor: "#013ba7"
            }}
        >

            <div className="flex items-center gap-10">
                <div
                    className="w-16 h-16 flex items-center justify-center"
                    onClick={onClick}
                >
                    <Image
                        src="/LOGOTIPO_BANO_V1.png"
                        alt="Logo WIT"
                        className="w-15 h-15 filter invert"
                        width={50}
                        height={50}
                    />
                </div>
                <div>
                    <h1 className="text-4xl font-bold text-white">
                        Autoservicio
                    </h1>
                    <p className="text-2xl text-gray-200">Acceso a Baños</p>
                </div>
            </div>
            <div className="text-right">
                <div className="text-3xl font-bold text-white">
                    {currentTime.toLocaleTimeString("es-CL", {
                        timeZone: 'America/Santiago',
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </div>
                <div className="text-2xl text-gray-200">
                    {currentTime.toLocaleDateString("es-CL", {
                        timeZone: 'America/Santiago',
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    })}
                </div>
            </div>
        </div>
    )
}
