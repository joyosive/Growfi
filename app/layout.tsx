import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/lib/walletContext";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GrowFI - Invest in Toronto Urban Farms",
  description: "Fractional ownership of urban farm plants with XRP. Earn weekly yields while supporting sustainable agriculture.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletProvider>
          <Navbar />
          <main className="min-h-screen bg-neutral-50">
            {children}
          </main>
        </WalletProvider>
      </body>
    </html>
  );
}