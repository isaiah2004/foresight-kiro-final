// Currency-related type definitions

export interface Currency {
  code: string; // ISO 4217 currency code (e.g., 'USD', 'EUR', 'INR')
  name: string;
  symbol: string;
  decimals: number;
}

export interface ExchangeRate {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  timestamp: Date;
  source: 'api' | 'cache' | 'fallback';
}

export interface CurrencyConversion {
  originalAmount: number;
  originalCurrency: string;
  convertedAmount: number;
  targetCurrency: string;
  exchangeRate: number;
  timestamp: Date;
}

export interface CurrencyCache {
  baseCurrency: string;
  rates: Record<string, ExchangeRate>;
  lastUpdated: Date;
  expiresAt: Date;
}

export interface CurrencyConversionError {
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  errorType: 'rate-unavailable' | 'invalid-currency' | 'api-error' | 'network-error';
  fallbackRate?: number;
  message: string;
}

// Default fallback exchange rates (approximate, for offline use)
export const FALLBACK_EXCHANGE_RATES: Record<string, number> = {
  'EUR/USD': 1.08,
  'GBP/USD': 1.25,
  'JPY/USD': 0.0067,
  'INR/USD': 0.012,
  'CAD/USD': 0.74,
  'AUD/USD': 0.66,
  'CHF/USD': 1.10,
  'CNY/USD': 0.14,
  'SEK/USD': 0.092,
  'NZD/USD': 0.60,
  'MXN/USD': 0.058,
  'SGD/USD': 0.74,
  'HKD/USD': 0.13,
  'NOK/USD': 0.092,
  'KRW/USD': 0.00075,
  'TRY/USD': 0.031,
  'RUB/USD': 0.011,
  'BRL/USD': 0.20,
  'ZAR/USD': 0.053,
  'PHP/USD': 0.018,
  'THB/USD': 0.028,
  'PLN/USD': 0.24,
  'CZK/USD': 0.044,
  'HUF/USD': 0.0027,
  'ILS/USD': 0.27,
  'AED/USD': 0.27,
  'SAR/USD': 0.27,
  'EGP/USD': 0.032,
  'QAR/USD': 0.27,
  'KWD/USD': 3.26,
  'BHD/USD': 2.65,
  'OMR/USD': 2.60,
  'JOD/USD': 1.41,
  'LBP/USD': 0.00067,
  'PKR/USD': 0.0036,
  'BDT/USD': 0.0092,
  'LKR/USD': 0.0031,
  'NPR/USD': 0.0075,
  'MMK/USD': 0.00048,
  'KHR/USD': 0.00024,
  'LAK/USD': 0.000049,
  'VND/USD': 0.000041,
  'IDR/USD': 0.000066,
  'MYR/USD': 0.21,
  'BGN/USD': 0.55,
  'RON/USD': 0.22,
  'HRK/USD': 0.14,
  'RSD/USD': 0.0092,
  'UAH/USD': 0.027,
  'BYN/USD': 0.31,
  'ISK/USD': 0.0072,
  'DKK/USD': 0.14,
  'ALL/USD': 0.011,
  'MKD/USD': 0.018,
  'MDL/USD': 0.056,
  'GEL/USD': 0.37,
  'AMD/USD': 0.0026,
  'AZN/USD': 0.59,
  'KZT/USD': 0.0022,
  'UZS/USD': 0.000082,
  'TJS/USD': 0.092,
  'KGS/USD': 0.012,
  'TMT/USD': 0.29,
  'AFN/USD': 0.014,
  'IRR/USD': 0.000024,
  'IQD/USD': 0.00076,
  'SYP/USD': 0.00040,
  'YER/USD': 0.0040,
  'LYD/USD': 0.21,
  'TND/USD': 0.32,
  'DZD/USD': 0.0075,
  'MAD/USD': 0.098,
  'SDG/USD': 0.0017,
  'ETB/USD': 0.018,
  'KES/USD': 0.0077,
  'UGX/USD': 0.00027,
  'TZS/USD': 0.00043,
  'RWF/USD': 0.00082,
  'BIF/USD': 0.00035,
  'DJF/USD': 0.0056,
  'SOS/USD': 0.0017,
  'ERN/USD': 0.067,
  'GMD/USD': 0.015,
  'GNF/USD': 0.00012,
  'LRD/USD': 0.0067,
  'SLE/USD': 0.045,
  'GHS/USD': 0.083,
  'NGN/USD': 0.0013,
  'CVE/USD': 0.0098,
  'MRU/USD': 0.025,
  'SZL/USD': 0.053,
  'LSL/USD': 0.053,
  'BWP/USD': 0.074,
  'NAD/USD': 0.053,
  'ZMW/USD': 0.040,
  'MWK/USD': 0.00059,
  'MZN/USD': 0.016,
  'MGA/USD': 0.00023,
  'KMF/USD': 0.0022,
  'SCR/USD': 0.075,
  'MUR/USD': 0.022,
  'AOA/USD': 0.0012,
  'CDF/USD': 0.00040,
  'XAF/USD': 0.0016,
  'XOF/USD': 0.0016,
  'XPF/USD': 0.0090,
  'FJD/USD': 0.45,
  'TOP/USD': 0.43,
  'WST/USD': 0.37,
  'VUV/USD': 0.0084,
  'SBD/USD': 0.12,
  'PGK/USD': 0.26,
  'NCL/USD': 0.0090,
  'HTG/USD': 0.0076,
  'JMD/USD': 0.0065,
  'BBD/USD': 0.50,
  'BSD/USD': 1.00,
  'BZD/USD': 0.50,
  'XCD/USD': 0.37,
  'AWG/USD': 0.56,
  'ANG/USD': 0.56,
  'SRD/USD': 0.032,
  'GYD/USD': 0.0048,
  'PEN/USD': 0.27,
  'BOB/USD': 0.14,
  'PYG/USD': 0.00014,
  'UYU/USD': 0.026,
  'CLP/USD': 0.0011,
  'COP/USD': 0.00024,
  'VES/USD': 0.027,
  'NIO/USD': 0.027,
  'CRC/USD': 0.0019,
  'GTQ/USD': 0.13,
  'HNL/USD': 0.041,
  'PAB/USD': 1.00,
  'DOP/USD': 0.017,
  'CUP/USD': 0.042,
  'TTD/USD': 0.15,
  'TWD/USD': 0.031,
  'MOP/USD': 0.12,
};