import type {Metadata} from "next";
import { Poppins, Instrument_Serif } from "next/font/google";
import "./globals.css";
import VideoBackground from "@/components/layout/VideoBackground";
import GlassFilter from "@/components/layout/GlassFilter";

const poppins = Poppins({
  subsets : ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

const instrumentSerif = Instrument_Serif({
  subsets : ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-serif", 
});

export const metadata: Metadata = {
  title: "Parallel",
  description: "Fuck around, find out."
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className= {`${poppins.variable} ${instrumentSerif.variable}`}>
      <body>
        <VideoBackground />
        <GlassFilter />
        {children}
      </body>
    </html>
  );
}
