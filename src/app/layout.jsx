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
  title: "Handcrafted Haven - Artisan Marketplace",
  description: "Discover unique handmade products from talented artisans. Handcrafted Haven connects creators with customers who value sustainable, one-of-a-kind goods.",
  icons: {
    icon: [
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-57.png", sizes: "57x57", type: "image/png" },
      { url: "/favicon-60.png", sizes: "60x60", type: "image/png" },
      { url: "/favicon-70.png", sizes: "70x70", type: "image/png" },
      { url: "/favicon-72.png", sizes: "72x72", type: "image/png" },
      { url: "/favicon-76.png", sizes: "76x76", type: "image/png" },
      { url: "/favicon-96.png", sizes: "96x96", type: "image/png" },
    ],
  },

};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
