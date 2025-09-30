'use client';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';


export default function Modal({ open, onClose, title, children }) {
    const dialogRef = useRef(null);
    const closeBtnRef = useRef(null);
    const [mounted, setMounted] = useState(false);


    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        if (!open) return;
        const onKey = (e) => e.key === 'Escape' && onClose?.();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    useEffect(() => {
        if (!open) return;
        const t = setTimeout(() => closeBtnRef.current?.focus(), 0);
        const original = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { clearTimeout(t); document.body.style.overflow = original; };
    }, [open]);


    if (!open || !mounted) return null;


    const overlay = (
        <div
            ref={dialogRef}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm"
            aria-modal="true"
            role="dialog"
            aria-labelledby="modal-title"
        >
            <div className="m-4 sm:m-6 w-full max-w-2xl bg-white shadow-xl ring-1 ring-black/5 rounded-2xl flex flex-col">
                <div className="flex items-center justify-between px-5 py-4 shrink-0">
                    <h2 id="modal-title" className="text-3xl font-semibold text-gray-900 w-full">{title}</h2>
                    {/* <button
                        ref={closeBtnRef}
                        onClick={onClose}
                        className="rounded-md px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        aria-label="Cerrar modal"
                    >
                        ✕
                    </button> */}
                </div>
                <div className="px-5 py-4 max-h-[70vh] overflow-auto">{children}</div>
            </div>
        </div>
    );


    return createPortal(overlay, document.body);
}