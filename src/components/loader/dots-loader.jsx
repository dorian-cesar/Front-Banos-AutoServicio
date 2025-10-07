export default function DotsLoader() {
    return (
        <span className="inline-flex gap-1" aria-label="Cargando">
            <span className="animate-bounce [animation-duration:1.4s] [animation-delay:-0.32s]">.</span>
            <span className="animate-bounce [animation-duration:1.4s] [animation-delay:-0.16s]">.</span>
            <span className="animate-bounce [animation-duration:1.4s]">.</span>
        </span>
    )
}
