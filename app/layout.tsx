import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SARAKO | Portal ng Lungsod",
  description: "Mga serbisyo, balita, at impormasyong kailangan mo mula sa iyong lungsod.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fil"><body>{children}</body></html>;
}
