"use client"

import { useState } from "react"
import { useWalletKit } from "@mysten/wallet-kit"
import { TransactionBlock } from "@mysten/sui.js/transactions"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { formatAddress } from "@/lib/utils"
import { Loader2, LockIcon, UnlockIcon } from "lucide-react"

// Contract module address
const MODULE_ADDRESS = "0xc6a68b2f80999f48cc2a6b9f06664f2a00d4dea979c087e85014989cdeb45aaf"

interface LockedFund {
  id: string
  recipient: string
  sender: string
  amount: number
  unlockEpoch: number
  type: "sent" | "received"
}

interface LockedFundCardProps {
  fund: LockedFund
  currentEpoch: number | null
  onSuccess?: () => void
}

export function LockedFundCard({ fund, currentEpoch, onSuccess }: LockedFundCardProps) {
  const { signAndExecuteTransactionBlock } = useWalletKit()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const isUnlockable = currentEpoch !== null && currentEpoch >= fund.unlockEpoch
  const isCancelable = currentEpoch !== null && currentEpoch < fund.unlockEpoch

  const handleRelease = async () => {
    if (!isUnlockable || fund.type !== "received") return

    try {
      setIsLoading(true)

      const tx = new TransactionBlock()

      tx.moveCall({
        target: `${MODULE_ADDRESS}::savings::release_funds`,
        arguments: [tx.object(fund.id)],
      })

      const result = await signAndExecuteTransactionBlock({
        transactionBlock: tx,
      })

      toast({
        title: "Funds released successfully",
        description: `Digest: ${result.digest.slice(0, 10)}...`,
      })

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error(error)
      toast({
        title: "Error releasing funds",
        description: (error as Error).message || "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!isCancelable || fund.type !== "sent") return

    try {
      setIsLoading(true)

      const tx = new TransactionBlock()

      tx.moveCall({
        target: `${MODULE_ADDRESS}::savings::cancel_lock`,
        arguments: [tx.object(fund.id)],
      })

      const result = await signAndExecuteTransactionBlock({
        transactionBlock: tx,
      })

      toast({
        title: "Lock canceled successfully",
        description: `Digest: ${result.digest.slice(0, 10)}...`,
      })

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error(error)
      toast({
        title: "Error canceling lock",
        description: (error as Error).message || "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusText = () => {
    if (isUnlockable) {
      return "Unlocked"
    } else if (currentEpoch !== null) {
      const epochsRemaining = fund.unlockEpoch - currentEpoch
      return `Locked for ${epochsRemaining} more epoch${epochsRemaining !== 1 ? "s" : ""}`
    }
    return "Loading..."
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-lg font-medium">{fund.amount.toFixed(4)} SUI</p>
            <div className="mt-1 text-sm text-muted-foreground">
              {fund.type === "received" ? (
                <>From: {formatAddress(fund.sender)}</>
              ) : (
                <>To: {formatAddress(fund.recipient)}</>
              )}
            </div>
            <div className="mt-2 flex items-center">
              {isUnlockable ? (
                <div className="flex items-center text-green-500">
                  <UnlockIcon className="mr-1 h-4 w-4" />
                  <span className="text-sm font-medium">{getStatusText()}</span>
                </div>
              ) : (
                <div className="flex items-center text-amber-500">
                  <LockIcon className="mr-1 h-4 w-4" />
                  <span className="text-sm font-medium">{getStatusText()}</span>
                </div>
              )}
            </div>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <div>Unlock Epoch: {fund.unlockEpoch}</div>
            {currentEpoch !== null && <div className="mt-1">Current Epoch: {currentEpoch}</div>}
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 p-4">
        {fund.type === "received" ? (
          <Button
            onClick={handleRelease}
            disabled={!isUnlockable || isLoading}
            className="w-full"
            variant={isUnlockable ? "default" : "outline"}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Release Funds"
            )}
          </Button>
        ) : (
          <Button onClick={handleCancel} disabled={!isCancelable || isLoading} className="w-full" variant="outline">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Cancel Lock"
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
