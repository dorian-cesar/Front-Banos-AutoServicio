import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Totem baños",
  description: "Punto de venta para baños",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-b from-blue-400 to-blue-100 p-4`}
        style={{
          width: "1060px",
          height: "1910px",
          margin: "0",
          padding: "0"
        }}
      >
        {children}
      </body>
    </html>
  );
}
