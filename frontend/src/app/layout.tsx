"use client"

import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { usePathname } from "next/navigation"
import { ThemeProvider } from "next-themes"
import Wrapper from "@/components/container/wrapper"
import NextTopLoader from "nextjs-toploader"
import { Toaster } from "sonner"
import SessionProvider from "@/components/session-provider"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  const excludesPages = ["/sign-in", "/sign-up", "/manage"]
  const isExcludePage = excludesPages.some(page => pathname === page || pathname.startsWith(page + "/"))
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster position="top-center" richColors />
        <SessionProvider>
          <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
            <NextTopLoader
              color="#5886FA"
              initialPosition={0.08}
              crawlSpeed={200}
              height={3}
              showSpinner={false}
              crawl={true}
              easing="ease"
              speed={200}
              shadow="0 0 10px #5886FA,0 0 5px #5886FA"
              zIndex={1600}
              showAtBottom={false}
            />
            {isExcludePage ? children : <Wrapper>{children}</Wrapper>}
        </ThemeProvider>
        </SessionProvider>
        
      </body>
    </html>
  );
}
