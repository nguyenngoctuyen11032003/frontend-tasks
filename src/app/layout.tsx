import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ToastProvider } from "@/components/ui/toast-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeProvider as CustomThemeProvider } from "@/hooks/use-custom-theme"
import { SearchProvider } from "@/hooks/use-search"
import { FilterProvider } from "@/hooks/use-filters"
import { MSWProvider } from "@/components/providers/msw-provider"
import { ReactQueryProvider } from "@/components/providers/react-query-provider"
import { CommandPaletteProvider } from "@/components/providers/command-palette-provider"
import { WebVitalsReporter } from "@/components/web-vitals-reporter"
import "./globals.css"

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
})

export const metadata: Metadata = {
  title: "TaskMaster - Quản lý công việc thông minh",
  description: "Ứng dụng quản lý công việc, dự án và nhóm làm việc hiệu quả",
  generator: "v0.app",
  keywords: ["quản lý công việc", "task management", "project management", "team collaboration"],
  authors: [{ name: "TaskMaster Team" }],
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a2e" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <CustomThemeProvider>
            <SearchProvider>
              <FilterProvider>
                <MSWProvider>
                  <ReactQueryProvider>
                    <CommandPaletteProvider>
                      {children}
                      <ToastProvider />
                      <Analytics />
                      <WebVitalsReporter />
                    </CommandPaletteProvider>
                  </ReactQueryProvider>
                </MSWProvider>
              </FilterProvider>
            </SearchProvider>
          </CustomThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
