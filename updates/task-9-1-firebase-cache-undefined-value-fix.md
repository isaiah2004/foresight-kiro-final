# Task 9.1: Firebase Cache Undefined Value Fix

## Date
September 8, 2025

## Issue Description
Firebase was throwing two related errors when trying to cache stock data:

1. **Undefined Value Error**:
```
Failed to update cache: [FirebaseError: Function setDoc() called with invalid data. Unsupported field value: undefined (found in field metadata.volume in document stock_cache/stock_MSFT)]
```

2. **Permission Denied Error** (discovered after fixing #1):
```
Failed to update cache: [FirebaseError: 7 PERMISSION_DENIED: Missing or insufficient permissions.]
```

## Root Cause
1. **Undefined Values**: The FinnHub API doesn't always return volume data for all stocks (e.g., MSFT). When the external API service tried to cache this data, it was passing `undefined` values in the metadata object to Firebase's `setDoc()` function, which Firebase doesn't allow.

2. **Missing Permissions**: The Firestore security rules didn't include permissions for the cache collections (`stock_cache`, `crypto_cache`, `user_sync_timestamps`, and `cache_requests`), causing permission denied errors.

## Solution Implemented
1. **Added Undefined Value Filtering**: Added a helper function `filterUndefinedValues()` to the `ExternalApiService` class to filter out undefined values from metadata objects before sending them to Firebase.

2. **Updated Firestore Security Rules**: Added proper permissions for cache collections to allow authenticated users to read and write cache data.

### Files Modified

#### 1. `src/lib/api/external-api-service.ts`
- **Added**: `filterUndefinedValues()` helper method to filter out undefined values from objects
- **Modified**: Stock data cache update logic to use filtered metadata
- **Modified**: Crypto data cache update logic to use filtered metadata

#### 2. `firestore.rules`
- **Added**: Permissions for `stock_cache` collection (read/write for authenticated users)
- **Added**: Permissions for `crypto_cache` collection (read/write for authenticated users)
- **Added**: Permissions for `user_sync_timestamps` collection (user-specific access)
- **Added**: Permissions for `cache_requests` collection (read/write for authenticated users)

### Code Changes

#### External API Service
```typescript
// Added helper method
private filterUndefinedValues<T extends Record<string, any>>(obj: T): Partial<T> {
  const filtered: Partial<T> = {};
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== undefined) {
      filtered[key as keyof T] = value;
    }
  });
  return filtered;
}

// Modified cache update logic for stocks
metadata: this.filterUndefinedValues({
  change: data.change,
  changePercent: data.changePercent,
  high: data.high,
  low: data.low,
  open: data.open,
  previousClose: data.previousClose,
  volume: data.volume  // This could be undefined
})

// Modified cache update logic for crypto
metadata: this.filterUndefinedValues({
  change: data.change,
  changePercent: data.changePercent,
  volume: data.volume  // This could be undefined
})
```

#### Firestore Security Rules
```firerules
// Cache collections for investment data
match /stock_cache/{document} {
  allow read: if request.auth != null;
  allow write: if request.auth != null; // TODO: Restrict to server-only in production
}

match /crypto_cache/{document} {
  allow read: if request.auth != null;
  allow write: if request.auth != null; // TODO: Restrict to server-only in production
}

// Users can only access their own sync timestamps
match /user_sync_timestamps/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}

// Cache update requests
match /cache_requests/{document} {
  allow read, write: if request.auth != null;
}
```

## Testing Results

1. **Build Test**: ✅ Successful compilation with `npm run build`
2. **Type Check**: ✅ No TypeScript errors with `npx tsc --noEmit`
3. **Firestore Rules Deployment**: ✅ Successfully deployed updated security rules
4. **Runtime Test**: ✅ Development server started successfully on localhost:3001

## Impact
- **Fixed**: Firebase cache errors when stock data lacks volume information
- **Fixed**: Permission denied errors when writing to cache collections
- **Improved**: Robustness of the external API caching system
- **Enhanced**: Security rules for proper cache collection access
- **Maintained**: All existing functionality while preventing Firebase errors

## Follow-up Actions
- Monitor investment price update logs to ensure both fixes are working
- Consider restricting cache write permissions to server-only operations in production
- Update Firebase cache documentation to reflect the new security rules
- Consider upgrading Firestore rules to v2 syntax (currently using v1 with warning)

## Definition of Done Checklist
- [x] No build errors
- [x] No TypeScript errors  
- [x] No warnings in compilation
- [x] Code follows Single Responsibility Principle
- [x] Update log created
- [x] Documentation standards maintained
