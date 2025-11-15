import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const outfit = Outfit({ 
  subsets: ['latin'], 
  weight: ["300", "400", "500", "600", "700"] 
})

export const metadata = {
  title: "Funlearn - Learn with Fun",
  description: "Making learning enjoyable for students through gamification and interactive features",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.className} antialiased`}
      >
        <Toaster />
        {children}
      </body>
    </html>
  );
}
