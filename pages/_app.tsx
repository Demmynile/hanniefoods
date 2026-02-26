import type { AppProps } from "next/app";
import dynamic from "next/dynamic";
import { ClerkProvider } from "@clerk/nextjs";
import { Fraunces, Space_Grotesk } from "next/font/google";
import { Toaster } from "sonner";
import { Layout } from "@/components/Layout";
import { useRouter } from "next/router";
import { useEffect } from "react";
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
  const router = useRouter();
  const isAdminRoute = router.pathname.startsWith("/admin") || router.pathname.startsWith("/studio");

  // Suppress Paystack CORS warnings in development
  // These are normal and don't affect functionality
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.message === 'A cross-origin error was thrown. React doesn\'t have access to the actual error object in development. See https://reactjs.org/link/crossorigin-error for more information.') {
        // Suppress this error - it's a React dev feature, not a real issue
        event.preventDefault();
      }
    };

    if (process.env.NODE_ENV === 'development') {
      window.addEventListener('error', handleError);
      return () => window.removeEventListener('error', handleError);
    }
  }, []);

  return (
    <ClerkProvider {...pageProps}>
      <div className={`${displayFont.variable} ${bodyFont.variable}`}>
        {isAdminRoute ? (
          <Component {...pageProps} />
        ) : (
          <Layout>
            <Component {...pageProps} />
          </Layout>
        )}
        <Toaster position="top-center" richColors />
      </div>
    </ClerkProvider>
  );
}
