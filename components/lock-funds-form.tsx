"use client"

import type React from "react"

import { useState } from "react"
import { useWalletKit } from "@mysten/wallet-kit"
import { TransactionBlock } from "@mysten/sui.js/transactions"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { isValidSuiAddress } from "@mysten/sui.js/utils"
import { Loader2 } from "lucide-react"

// Contract module address
const MODULE_ADDRESS = "0xc6a68b2f80999f48cc2a6b9f06664f2a00d4dea979c087e85014989cdeb45aaf"

interface LockFundsFormProps {
  onSuccess?: () => void
}

export function LockFundsForm({ onSuccess }: LockFundsFormProps) {
  const { signAndExecuteTransactionBlock } = useWalletKit()
  const { toast } = useToast()

  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [epochs, setEpochs] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const isRecipientValid = recipient ? isValidSuiAddress(recipient) : true
  const isAmountValid = amount ? !isNaN(Number(amount)) && Number(amount) > 0 : true
  const isEpochsValid = epochs ? !isNaN(Number(epochs)) && Number(epochs) > 0 : true

  const isFormValid = recipient && amount && epochs && isRecipientValid && isAmountValid && isEpochsValid

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isFormValid) return

    try {
      setIsLoading(true)

      const tx = new TransactionBlock()

      // Convert amount to MIST (1 SUI = 10^9 MIST)
      const amountInMist = Math.floor(Number(amount) * 1_000_000_000)

      // Create a coin with the specified amount
      const [coin] = tx.splitCoins(tx.gas, [tx.pure(amountInMist)])

      // Call the lock_funds function
      tx.moveCall({
        target: `${MODULE_ADDRESS}::savings::lock_funds`,
        arguments: [coin, tx.pure(recipient), tx.pure(Number(epochs))],
      })

      const result = await signAndExecuteTransactionBlock({
        transactionBlock: tx,
      })

      toast({
        title: "Funds locked successfully",
        description: `Digest: ${result.digest.slice(0, 10)}...`,
      })

      // Reset form
      setRecipient("")
      setAmount("")
      setEpochs("")

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error(error)
      toast({
        title: "Error locking funds",
        description: (error as Error).message || "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Lock SUI Tokens</CardTitle>
        <CardDescription>Lock SUI tokens for a specific recipient for a set number of epochs</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Address</Label>
            <Input
              id="recipient"
              placeholder="0x..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className={!isRecipientValid ? "border-destructive" : ""}
            />
            {!isRecipientValid && <p className="text-sm text-destructive">Please enter a valid Sui address</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (SUI)</Label>
            <Input
              id="amount"
              type="text"
              placeholder="0.1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={!isAmountValid ? "border-destructive" : ""}
            />
            {!isAmountValid && <p className="text-sm text-destructive">Please enter a valid amount</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="epochs">Lock Duration (Epochs)</Label>
            <Input
              id="epochs"
              type="text"
              placeholder="10"
              value={epochs}
              onChange={(e) => setEpochs(e.target.value)}
              className={!isEpochsValid ? "border-destructive" : ""}
            />
            {!isEpochsValid && <p className="text-sm text-destructive">Please enter a valid number of epochs</p>}
            <p className="text-xs text-muted-foreground">An epoch on Sui mainnet is approximately 24 hours</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={!isFormValid || isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Locking Funds...
              </>
            ) : (
              "Lock Funds"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
