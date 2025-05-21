"use client"

import { useState } from "react"
import { useWalletKit } from "@mysten/wallet-kit"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LockFundsForm } from "@/components/lock-funds-form"
import { LockedFundsList } from "@/components/locked-funds-list"
import { ConnectPrompt } from "@/components/connect-prompt"

export function SavingsApp() {
  const { currentAccount } = useWalletKit()
  const [activeTab, setActiveTab] = useState("lock")

  if (!currentAccount) {
    return <ConnectPrompt />
  }

  return (
    <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-8">
        <TabsTrigger value="lock">Lock Funds</TabsTrigger>
        <TabsTrigger value="manage">Manage Locks</TabsTrigger>
      </TabsList>
      <TabsContent value="lock">
        <LockFundsForm onSuccess={() => setActiveTab("manage")} />
      </TabsContent>
      <TabsContent value="manage">
        <LockedFundsList />
      </TabsContent>
    </Tabs>
  )
}
