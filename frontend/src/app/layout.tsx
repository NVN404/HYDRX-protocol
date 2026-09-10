import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "HydrX Protocol / Verifiable Water Conservation DePIN on Solana",
  description: "Decentralized Physical Infrastructure Network (DePIN) turning residential water conservation into Gold Standard Water Benefit Certificates ($HYDRX) on Solana.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
