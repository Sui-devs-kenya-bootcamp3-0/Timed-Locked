"use client"

import { WalletKitProvider } from "@mysten/wallet-kit"
import { ThemeProvider } from "@/components/theme-provider"
import type React from "react"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <WalletKitProvider>{children}</WalletKitProvider>
    </ThemeProvider>
  )
}
