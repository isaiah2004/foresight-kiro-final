import { NextRequest, NextResponse } from 'next/server'
import { externalApiService } from '@/lib/api/external-api-service'

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

    return NextResponse.json(priceData)
  } catch (error) {
    console.error('Search prices API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch price data' },
      { status: 500 }
    )
  }
}