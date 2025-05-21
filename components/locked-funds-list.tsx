"use client"

import { useState, useEffect } from "react"
import { useWalletKit } from "@mysten/wallet-kit"
import { SuiClient } from "@mysten/sui.js/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LockedFundCard } from "@/components/locked-fund-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Contract module address
const MODULE_ADDRESS = "0xc6a68b2f80999f48cc2a6b9f06664f2a00d4dea979c087e85014989cdeb45aaf"

// Create a Sui client
const client = new SuiClient({
  url: "https://fullnode.mainnet.sui.io",
})

interface LockedFund {
  id: string
  recipient: string
  sender: string
  amount: number
  unlockEpoch: number
  type: "sent" | "received"
}

export function LockedFundsList() {
  const { currentAccount } = useWalletKit()
  const [lockedFunds, setLockedFunds] = useState<LockedFund[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentEpoch, setCurrentEpoch] = useState<number | null>(null)

  useEffect(() => {
    if (!currentAccount) return

    const fetchLockedFunds = async () => {
      try {
        setIsLoading(true)

        // Get current epoch
        const { epoch } = await client.getLatestSuiSystemState()
        setCurrentEpoch(Number(epoch))

        // Fetch objects owned by the current account
        const { data: ownedObjects } = await client.getOwnedObjects({
          owner: currentAccount.address,
          options: {
            showContent: true,
            showType: true,
          },
        })

        // Filter for LockedFunds objects
        const lockedFundsObjects = ownedObjects.filter((obj) =>
          obj.data?.type?.includes(`${MODULE_ADDRESS}::savings::LockedFunds`),
        )

        // Parse the locked funds data
        const parsedLockedFunds: LockedFund[] = lockedFundsObjects.map((obj) => {
          const content = obj.data?.content as any
          const fields = content.fields

          return {
            id: obj.data?.objectId || "",
            recipient: fields.recipient,
            sender: fields.sender,
            amount: Number(fields.funds.fields.balance) / 1_000_000_000, // Convert from MIST to SUI
            unlockEpoch: Number(fields.unlock_epoch),
            type: fields.sender === currentAccount.address ? "sent" : "received",
          }
        })

        setLockedFunds(parsedLockedFunds)
      } catch (error) {
        console.error("Error fetching locked funds:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLockedFunds()

    // Refresh data every 30 seconds
    const intervalId = setInterval(fetchLockedFunds, 30000)

    return () => clearInterval(intervalId)
  }, [currentAccount])

  const sentFunds = lockedFunds.filter((fund) => fund.type === "sent")
  const receivedFunds = lockedFunds.filter((fund) => fund.type === "received")

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (lockedFunds.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          You don't have any locked funds. Use the "Lock Funds" tab to create a new lock.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Locked Funds</CardTitle>
        <CardDescription>View and manage your locked funds</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="received" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="received">Received ({receivedFunds.length})</TabsTrigger>
            <TabsTrigger value="sent">Sent ({sentFunds.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="received" className="space-y-4">
            {receivedFunds.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">You haven't received any locked funds yet.</p>
            ) : (
              receivedFunds.map((fund) => (
                <LockedFundCard
                  key={fund.id}
                  fund={fund}
                  currentEpoch={currentEpoch}
                  onSuccess={() => {
                    // Remove the fund from the list after successful action
                    setLockedFunds((prev) => prev.filter((f) => f.id !== fund.id))
                  }}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="sent" className="space-y-4">
            {sentFunds.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">You haven't sent any locked funds yet.</p>
            ) : (
              sentFunds.map((fund) => (
                <LockedFundCard
                  key={fund.id}
                  fund={fund}
                  currentEpoch={currentEpoch}
                  onSuccess={() => {
                    // Remove the fund from the list after successful action
                    setLockedFunds((prev) => prev.filter((f) => f.id !== fund.id))
                  }}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
