import { NextRequest, NextResponse } from 'next/server'
import { externalApiService } from '@/lib/api/external-api-service'

// Mock crypto prices for fallback when API is unavailable
const getMockCryptoPrice = (symbol: string) => {
  const mockPrices: Record<string, { price: number; change: number; changePercent: number }> = {
    'BTC': { price: 43250.00, change: 1250.50, changePercent: 2.98 },
    'ETH': { price: 2675.30, change: -45.20, changePercent: -1.66 },
    'ADA': { price: 0.485, change: 0.012, changePercent: 2.54 },
    'DOT': { price: 7.82, change: -0.15, changePercent: -1.88 },
    'SOL': { price: 98.75, change: 3.25, changePercent: 3.40 },
    'AVAX': { price: 24.15, change: 0.85, changePercent: 3.65 },
    'MATIC': { price: 0.92, change: -0.03, changePercent: -3.15 },
    'LINK': { price: 14.85, change: 0.45, changePercent: 3.13 },
    'UNI': { price: 6.72, change: -0.08, changePercent: -1.17 },
    'LTC': { price: 73.50, change: 1.20, changePercent: 1.66 },
    'BCH': { price: 245.80, change: -2.30, changePercent: -0.93 },
    'XRP': { price: 0.615, change: 0.015, changePercent: 2.50 }
  }
  
  return mockPrices[symbol] || { price: 100.00, change: 0, changePercent: 0 }
}

export async function POST(request: NextRequest) {
  try {
    const { symbols, type } = await request.json()

    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return NextResponse.json(
        { error: 'Invalid symbols array' },
        { status: 400 }
      )
    }

    if (!type || !['stock', 'crypto'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be "stock" or "crypto"' },
        { status: 400 }
      )
    }

    // Limit to prevent abuse
    if (symbols.length > 20) {
      return NextResponse.json(
        { error: 'Too many symbols. Maximum 20 allowed' },
        { status: 400 }
      )
    }

    try {
      let result
      if (type === 'stock') {
        result = await externalApiService.fetchStockData(symbols, {
          useFinnHub: true,
          useAlphaVantage: false, // Skip Alpha Vantage for search to avoid rate limits
          useCache: true,
          maxRetries: 1
        })
      } else {
        result = await externalApiService.fetchCryptoData(symbols, {
          useFinnHub: true,
          useAlphaVantage: false,
          useCache: true,
          maxRetries: 1
        })
      }

      // Transform to simple price data
      const priceData: Record<string, { price: number; change?: number; changePercent?: number }> = {}
      
      result.data.forEach((data, symbol) => {
        priceData[symbol] = {
          price: data.price,
          change: data.change,
          changePercent: data.changePercent
        }
      })

      // If no data was returned and it's crypto, use fallback mock data
      if (Object.keys(priceData).length === 0 && type === 'crypto') {
        console.log('No real crypto data available, using mock data for symbols:', symbols)
        symbols.forEach((symbol: string) => {
          priceData[symbol] = getMockCryptoPrice(symbol)
        })
      }

      return NextResponse.json(priceData)
    } catch (apiError) {
      console.warn('External API failed, using fallback data:', apiError)
      
      // For crypto, provide mock data as fallback
      if (type === 'crypto') {
        const priceData: Record<string, { price: number; change?: number; changePercent?: number }> = {}
        symbols.forEach((symbol: string) => {
          priceData[symbol] = getMockCryptoPrice(symbol)
        })
        return NextResponse.json(priceData)
      }
      
      // For stocks, return empty data if API fails
      return NextResponse.json({})
    }
  } catch (error) {
    console.error('Search prices API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch price data' },
      { status: 500 }
    )
  }
}