import {
  formatEther as baseFormatEther,
  formatUnits as baseFormatUnits,
  parseAbi,
  parseEther as baseParseEther,
  parseUnits as baseParseUnits,
  type Abi,
  type Address,
  type PublicClient,
  type WalletClient,
} from 'viem'

type ContractConfig = {
  address: string
  abi: unknown
  publicClient?: PublicClient | null
  walletClient?: WalletClient | null
}

function isAbiStringArray(abi: unknown): abi is readonly string[] {
  return Array.isArray(abi) && typeof abi[0] === 'string'
}

function normalizeAbi(abi: unknown): Abi {
  if (isAbiStringArray(abi)) {
    return parseAbi(abi)
  }

  return abi as Abi
}

function isOverrides(value: unknown) {
  return (
    !!value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    !(value instanceof Uint8Array)
  )
}

export function toBigInt(value: unknown): bigint {
  if (typeof value === 'bigint') {
    return value
  }

  if (typeof value === 'number') {
    return BigInt(Math.trunc(value))
  }

  if (typeof value === 'string') {
    return value.trim() ? BigInt(value) : 0n
  }

  return BigInt(value as never)
}

export function formatEther(value: unknown) {
  return baseFormatEther(toBigInt(value))
}

export function formatUnits(value: unknown, decimals: number = 18) {
  return baseFormatUnits(toBigInt(value), decimals)
}

export function parseEther(value: string | number) {
  return baseParseEther(String(value))
}

export function parseUnits(value: string | number, decimals: number = 18) {
  return baseParseUnits(String(value), decimals)
}

export function createViemContract({
  address,
  abi,
  publicClient,
  walletClient,
}: ContractConfig) {
  const contractAbi = normalizeAbi(abi)
  const functions = contractAbi.filter((item) => item.type === 'function')
  const functionMap = new Map(functions.map((item) => [item.name, item]))

  return new Proxy(
    { address },
    {
      get(_, prop) {
        if (prop === 'address') {
          return address
        }

        if (prop === 'then') {
          return undefined
        }

        const abiItem = functionMap.get(String(prop))
        if (!abiItem) {
          return undefined
        }

        return async (...rawArgs: unknown[]) => {
          const args = [...rawArgs]
          const overrides = isOverrides(args.at(-1)) ? (args.pop() as Record<string, unknown>) : {}

          if (abiItem.stateMutability === 'view' || abiItem.stateMutability === 'pure') {
            if (!publicClient) {
              throw new Error('Public client unavailable')
            }

            return publicClient.readContract({
              address: address as Address,
              abi: contractAbi,
              functionName: abiItem.name,
              args: args as readonly unknown[],
            })
          }

          if (!walletClient || !publicClient) {
            throw new Error('Wallet client unavailable')
          }

          const hash = await walletClient.writeContract({
            account: walletClient.account,
            chain: walletClient.chain,
            address: address as Address,
            abi: contractAbi,
            functionName: abiItem.name,
            args: args as readonly unknown[],
            ...(overrides ?? {}),
          })

          return {
            hash,
            wait: () => publicClient.waitForTransactionReceipt({ hash }),
          }
        }
      },
    },
  )
}
