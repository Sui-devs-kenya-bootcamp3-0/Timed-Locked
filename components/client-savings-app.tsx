"use client"

import { WalletKitProvider } from "@mysten/wallet-kit"
import { ThemeProvider } from "next-themes"
import { WalletConnect } from "@/components/wallet-connect"
import { SavingsApp } from "@/components/savings-app"

export function ClientSavingsApp() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <WalletKitProvider>
        <main className="min-h-screen bg-gradient-to-b from-background to-background/80">
          <div className="container max-w-6xl mx-auto px-4 py-8">
            <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
              <div>
                <h1 className="text-4xl font-bold tracking-tight">Sui Time-Lock Savings</h1>
                <p className="text-muted-foreground mt-2">Lock SUI tokens for a specific time period</p>
              </div>
              <WalletConnect />
            </header>

            <SavingsApp />
          </div>
        </main>
      </WalletKitProvider>
    </ThemeProvider>
  )
}
