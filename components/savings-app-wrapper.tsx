"use client"

import { WalletConnect } from "@/components/wallet-connect"
import { SavingsApp } from "@/components/savings-app"

export function SavingsAppWrapper() {
  return (
    <>
      <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Sui Time-Lock Savings</h1>
          <p className="text-muted-foreground mt-2">Lock SUI tokens for a specific time period</p>
        </div>
        <WalletConnect />
      </header>

      <SavingsApp />
    </>
  )
}
