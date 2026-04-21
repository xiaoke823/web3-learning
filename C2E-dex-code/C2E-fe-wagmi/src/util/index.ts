import { formatEther as formatEtherValue, formatUnits as formatUnitsValue, parseEther, parseUnits, toBigInt } from '@src/lib/viem'

export function formatEther(value, fractionDigits = 2): number | any {
  if (value === null || value === undefined || value === '') {
    return value
  }

  try {
    return Number(Number(formatEtherValue(value)).toFixed(fractionDigits))
  } catch (error) {
    console.error(error)
    return value
  }
}

export function formatUnits(value, fractionDigits = 2, decimals = 18): number | any {
  if (value === null || value === undefined || value === '') {
    return value
  }

  try {
    return Number(Number(formatUnitsValue(value, decimals)).toFixed(fractionDigits))
  } catch (error) {
    console.error(error)
    return value
  }
}

export { parseEther }

export function parseWei(value) {
  return toBigInt(value)
}

export async function getAccounts() {
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
  return accounts
}

export function formatDate(timestamp: number | string, formatter) {
  const date = new Date(Number(timestamp))
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const fillZero = (num) => `${num}`.replace(/^(\d)$/, '0$1')

  return (formatter || 'YYYY-MM-DD')
    .replace(/YYYY/gi, `${date.getFullYear()}`)
    .replace(/MM/g, fillZero(date.getMonth() + 1))
    .replace(
      /Month/g,
      [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ][date.getMonth()],
    )
    .replace(/DD/gi, fillZero(date.getDate()))
    .replace(/HH/gi, fillZero(date.getHours()))
    .replace(/mm/g, fillZero(date.getMinutes()))
    .replace(/ss/g, fillZero(date.getSeconds()))
}

export function hexToBytes(hex) {
  const bytes = []
  for (let index = 0; index < hex.length; index += 2) {
    bytes.push(Number.parseInt(hex.slice(index, index + 2), 16))
  }
  return Uint8Array.from(bytes)
}

export function bytesToHex(bytes) {
  const hex = []
  for (let index = 0; index < bytes.length; index += 1) {
    const current = bytes[index] < 0 ? bytes[index] + 256 : bytes[index]
    hex.push((current >>> 4).toString(16))
    hex.push((current & 0xf).toString(16))
  }
  return hex.join('')
}

export function formatNumber(num) {
  const value = num >= 1000000 ? `${Math.trunc((num / 1000000) * 100) / 100}M` : num
  return /\d/.test(`${value}`) ? `${value}`.replace(/\B(?=(?:\d{3})+(?!\d))/g, ',') : ''
}

export function seperateNumWithComma(num) {
  return /\d/.test(`${num}`) ? `${num}`.replace(/\B(?=(?:\d{3})+(?!\d))/g, ',') : ''
}

export { parseUnits }
