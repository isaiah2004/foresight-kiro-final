/**
 * API Route: Update Investment Prices
 * 
 * This endpoint triggers cache updates for user's investment portfolio
 * using external financial APIs with fallback strategies.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { externalApiService } from '@/lib/api/external-api-service';
import { requestCacheUpdate } from '@/lib/firebase/cache-manager';

export interface UpdatePricesRequest {
  symbols: {
    stocks: string[];
    crypto: string[];
  };
  forceUpdate?: boolean;
}

export interface UpdatePricesResponse {
  success: boolean;
  message: string;
  data: {
    updatedSymbols: string[];
    failedSymbols: string[];
    cacheHits: string[];
    apiCalls: number;
    source: 'finnhub' | 'alphavantage' | 'cache' | 'mixed';
    errors: string[];
  };
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body: UpdatePricesRequest = await request.json();
    
    if (!body.symbols || (!body.symbols.stocks && !body.symbols.crypto)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid request: symbols are required' 
        },
        { status: 400 }
      );
    }

    // Validate symbols
    const stocks = Array.isArray(body.symbols.stocks) ? body.symbols.stocks : [];
    const crypto = Array.isArray(body.symbols.crypto) ? body.symbols.crypto : [];
    
    if (stocks.length === 0 && crypto.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'No valid symbols provided' 
        },
        { status: 400 }
      );
    }

    // Sanitize symbols (remove empty strings, trim whitespace)
    const cleanStocks = stocks
      .map(s => s.trim().toUpperCase())
      .filter(s => s.length > 0);
    
    const cleanCrypto = crypto
      .map(s => s.trim().toUpperCase())
      .filter(s => s.length > 0);

    console.log(`Updating prices for user ${userId}: ${cleanStocks.length} stocks, ${cleanCrypto.length} crypto`);

    // Request cache update through the cache manager
    const updateResult = await requestCacheUpdate(userId, {
      stocks: cleanStocks,
      crypto: cleanCrypto
    });

    const response: UpdatePricesResponse = {
      success: updateResult.success,
      message: updateResult.success 
        ? `Successfully updated ${updateResult.updatedSymbols.length} symbols`
        : 'Failed to update investment prices',
      data: {
        updatedSymbols: updateResult.updatedSymbols,
        failedSymbols: updateResult.failedSymbols,
        cacheHits: updateResult.cacheHits,
        apiCalls: updateResult.apiCalls,
        source: 'mixed', // Will be determined by the external API service
        errors: updateResult.errors
      }
    };

    const statusCode = updateResult.success ? 200 : 207; // 207 for partial success
    return NextResponse.json(response, { status: statusCode });

  } catch (error) {
    console.error('Error in update-prices API:', error);
    
    const response: UpdatePricesResponse = {
      success: false,
      message: 'Internal server error',
      data: {
        updatedSymbols: [],
        failedSymbols: [],
        cacheHits: [],
        apiCalls: 0,
        source: 'cache',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      }
    };

    return NextResponse.json(response, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Test API connections
    const connectionTests = await externalApiService.testConnections();
    
    return NextResponse.json({
      success: connectionTests.overall.success,
      message: 'API connection status',
      data: {
        connections: connectionTests,
        usage: externalApiService.getUsageStats()
      }
    });

  } catch (error) {
    console.error('Error testing API connections:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to test API connections',
      data: {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 });
  }
}