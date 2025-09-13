import { 
  DollarSign, 
  Euro, 
  PoundSterling, 
  Banknote,
  CircleDollarSign,
  Coins
} from 'lucide-react'
import { getCurrencyDisplayName as getDataDisplayName } from './data'

/**
 * Maps currency codes to appropriate icons
 * Falls back to generic currency icon for unsupported currencies
 */
export const getCurrencyIcon = (currencyCode: string) => {
  const iconMap: Record<string, any> = {
    // Dollar-based currencies
    'USD': DollarSign,
    'CAD': DollarSign,
    'AUD': DollarSign,
    'NZD': DollarSign,
    'HKD': DollarSign,
    'SGD': DollarSign,
    'TWD': DollarSign,
    'BND': DollarSign,
    'FJD': DollarSign,
    'JMD': DollarSign,
    'BBD': DollarSign,
    'BSD': DollarSign,
    'BZD': DollarSign,
    'XCD': DollarSign,
    'TTD': DollarSign,
    'NAD': DollarSign,
    'ZWL': DollarSign,
    
    // Euro
    'EUR': Euro,
    
    // Pound Sterling
    'GBP': PoundSterling,
    'EGP': PoundSterling,
    'LBP': PoundSterling,
    'SYP': PoundSterling,
    'SDG': PoundSterling,
    
    // Yen-based currencies (circular coins icon)
    'JPY': Coins,
    'CNY': Coins,
    'KRW': Coins,
    
    // All other currencies use banknote icon
    // This covers INR, CHF, SEK, NOK, DKK, PLN, CZK, HUF, RUB, TRY, ZAR, BRL, MXN, etc.
  }

  // Return specific icon if mapped, otherwise use banknote for most currencies
  // Use CircleDollarSign as ultimate fallback
  if (iconMap[currencyCode]) {
    return iconMap[currencyCode]
  }
  
  // For most world currencies, banknote is appropriate
  return Banknote
}

/**
 * Gets currency display name using the JSON data
 */
export const getCurrencyDisplayName = (currencyCode: string): string => {
  return getDataDisplayName(currencyCode)
}

/**
 * Returns appropriate aria-label for currency icons
 */
export const getCurrencyIconLabel = (currencyCode: string): string => {
  return `${getCurrencyDisplayName(currencyCode)} icon`
}
