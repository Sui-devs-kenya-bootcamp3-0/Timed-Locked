"use client"

import { ConnectButton, useWalletKit } from "@mysten/wallet-kit"
import { Button } from "../components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/ui/dropdown-menu"
import { Copy, LogOut, Wallet } from "lucide-react"
import { useToast } from "../hooks/use-toast"
import { useState, useEffect } from "react"
import { SUI_PACKAGE_ID } from "../lib/suiConfig"

export function WalletConnect() {
  const { currentAccount, disconnect } = useWalletKit()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    console.log("Sui Package ID:", SUI_PACKAGE_ID)
  }, [])

  const truncatedAddress = currentAccount 
    ? `${currentAccount.address.slice(0, 6)}...${currentAccount.address.slice(-4)}`
    : null

  const copyAddress = () => {
    if (!currentAccount) return
    
    navigator.clipboard.writeText(currentAccount.address)
    toast({
      title: "Address copied",
      description: "Your wallet address has been copied to clipboard",
    })
  }

  if (!mounted) {
    return (
      <Button variant="outline" size="sm" disabled>
        Connect Wallet
      </Button>
    )
  }

  if (!currentAccount) {
    return (
      <ConnectButton 
        connectText="Connect Wallet"
      />
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Wallet className="h-4 w-4" />
          <span>{truncatedAddress}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={copyAddress}>
          <Copy className="mr-2 h-4 w-4" />
          <span>Copy Address</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => disconnect()}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Disconnect</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
