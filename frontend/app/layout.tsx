import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Arbiter402 | Sub-Second Conditional Escrow & Ground-Truth Adjudication",
  description:
    "Sub-Second Conditional Escrow & Ground-Truth Adjudication for the Machine Economy. Powered by Hedera, The Graph, Bazantic MCP, and ERC-8004.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen selection:bg-emerald-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
