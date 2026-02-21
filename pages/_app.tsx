import type { AppProps } from "next/app";
import dynamic from "next/dynamic";
import { ClerkProvider } from "@clerk/nextjs";
import { Fraunces, Space_Grotesk } from "next/font/google";
import { Toaster } from "sonner";
import { Layout } from "@/components/Layout";
import "@/styles/globals.css";

const displayFont = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["700"],
  display: "swap",
});

const bodyFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "600"],
  display: "swap",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ClerkProvider {...pageProps}>
      <div className={`${displayFont.variable} ${bodyFont.variable}`}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
        <Toaster position="top-center" richColors />
      </div>
    </ClerkProvider>
  );
}
