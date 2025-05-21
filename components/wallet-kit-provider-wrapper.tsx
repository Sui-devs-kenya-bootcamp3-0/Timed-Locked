"use client"

import { WalletKitProvider } from "@mysten/wallet-kit"
import type React from "react"

export function WalletKitProviderWrapper({ children }: { children: React.ReactNode }) {
  return <WalletKitProvider>{children}</WalletKitProvider>
}
