import { Aladin, Quicksand, Roboto } from "next/font/google";
import "./globals.css";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { CartProvider } from "@/components/providers/CartProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";

const displayFont = Aladin({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display-family",
});

const bodyFont = Quicksand({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body-family",
});

const uiFont = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-ui-family",
});

export const metadata = {
  title: {
    default: "Handcrafted Haven - Artisan Marketplace",
    template: "%s | Handcrafted Haven",
  },
  description:
    "Discover unique handmade products from talented artisans. Handcrafted Haven connects creators with customers who value sustainable, one-of-a-kind goods.",
  keywords: [
    "handmade",
    "artisan",
    "marketplace",
    "handcrafted",
    "sustainable",
    "unique",
    "pottery",
    "jewelry",
    "woodwork",
  ],
  authors: [{ name: "Handcrafted Haven" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Handcrafted Haven",
    title: "Handcrafted Haven - Artisan Marketplace",
    description:
      "Discover unique handmade products from talented artisans worldwide.",
  },
  robots: {
    index: true,
    follow: true,
  },
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

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable} ${uiFont.variable}`}>
      <body className="min-h-screen flex flex-col bg-background text-text font-body antialiased">
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              <a href="#main-content" className="skip-to-content">
                Skip to content
              </a>
              <Header />
              <main id="main-content" className="flex-1">
                {children}
              </main>
              <Footer />
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
