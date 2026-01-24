import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-inter",
});

export const metadata: Metadata = {
    title: "Voice Creator - Advanced Text-to-Speech & Voice Cloning",
    description: "Create stunning voice overs with advanced text-to-speech technology. Multiple voices in Hindi and English with voice cloning capabilities.",
    keywords: ["text to speech", "voice cloning", "TTS", "voice generator", "Hindi TTS", "English TTS"],
    authors: [{ name: "VoiceCreator" }],
    openGraph: {
        title: "Voice Creator - Advanced Text-to-Speech & Voice Cloning",
        description: "Create stunning voice overs with advanced text-to-speech technology",
        type: "website",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
            <body className={`${inter.variable} antialiased`}>
                {children}
            </body>
        </html>
    );
}
