import {
  BrowserProvider,
  Contract as BaseContract,
  JsonRpcProvider,
  formatEther as baseFormatEther,
  formatUnits as baseFormatUnits,
  parseEther as baseParseEther,
  parseUnits as baseParseUnits,
} from 'ethers'
import { BigNumber } from '@ethersproject/bignumber'

type BigNumberishLike = string | number | bigint | BigNumber | null | undefined

const MAX_SAFE_BIGINT = BigInt(Number.MAX_SAFE_INTEGER)

function toCompatBigInt(value: BigNumberishLike) {
  if (value === null || value === undefined) {
    return 0n
  }
  if (typeof value === 'bigint') {
    return value
  }
  if (typeof value === 'number') {
    return BigInt(Math.trunc(value))
  }
  if (typeof value === 'string') {
    if (!value.trim()) {
      return 0n
    }
    return BigInt(value)
  }
  if (BigNumber.isBigNumber(value)) {
    return BigInt(value.toString())
  }

  return BigInt(value as never)
}

function fromCompatBigInt(value: bigint) {
  const abs = value < 0n ? -value : value
  if (abs <= MAX_SAFE_BIGINT) {
    return Number(value)
  }

  return BigNumber.from(value.toString())
}

function normalizeContractValue<T>(value: T): T {
  if (typeof value === 'bigint') {
    return fromCompatBigInt(value) as T
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeContractValue(item)) as T
  }

  if (value && typeof value === 'object') {
    if (typeof (value as { wait?: unknown }).wait === 'function') {
      return value
    }

    for (const key of Object.keys(value as object)) {
      ;(value as Record<string, unknown>)[key] = normalizeContractValue(
        (value as Record<string, unknown>)[key],
      )
    }
  }

  return value
}

function wrapContractMethod(method: unknown, contract: BaseContract) {
  if (typeof method !== 'function') {
    return method
  }

  return (...args: unknown[]) => {
    const result = (method as (...innerArgs: unknown[]) => unknown).apply(contract, args)
    if (result instanceof Promise) {
      return result.then((value) => normalizeContractValue(value))
    }

    return normalizeContractValue(result)
  }
}

export class Contract {
  constructor(address: string, abi: unknown, runner?: unknown) {
    const contract = new BaseContract(address, abi as never, runner as never)

    return new Proxy(contract, {
      get(target, prop, receiver) {
        if (prop === 'address') {
          return target.target
        }

        const value = Reflect.get(target, prop, receiver)
        return wrapContractMethod(value, target)
      },
    }) as never
  }
}

export const providers = {
  BrowserProvider,
  Web3Provider: BrowserProvider,
  JsonRpcProvider,
}

export const utils = {
  formatEther(value: BigNumberishLike) {
    return baseFormatEther(toCompatBigInt(value))
  },
  formatUnits(value: BigNumberishLike, decimals: number | string = 18) {
    return baseFormatUnits(toCompatBigInt(value), decimals)
  },
  parseEther(value: string | number) {
    return BigNumber.from(baseParseEther(String(value)).toString())
  },
  parseUnits(value: string | number, decimals: number | string = 18) {
    return BigNumber.from(baseParseUnits(String(value), decimals).toString())
  },
}

export const ethers = {
  BigNumber,
  Contract,
  providers,
  utils,
}

export { BigNumber, BrowserProvider, JsonRpcProvider }
