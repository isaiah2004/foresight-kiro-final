/**
 * Firebase utility functions for data handling and validation
 */

/**
 * Removes undefined values from an object to prevent Firebase errors
 * Firebase Firestore doesn't allow undefined values in documents
 * 
 * @param data - Object that may contain undefined values
 * @returns Clean object with only defined values
 * 
 * @example
 * const formData = { name: 'John', age: undefined, email: 'john@example.com' }
 * const cleanData = removeUndefinedValues(formData)
 * // Result: { name: 'John', email: 'john@example.com' }
 */
export function removeUndefinedValues<T extends Record<string, any>>(data: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined)
  ) as Partial<T>
}

/**
 * Prepares data for Firebase document creation
 * Adds common fields and cleans undefined values
 * 
 * @param data - Form data to prepare
 * @param userId - User ID to associate with the document
 * @returns Clean data ready for Firebase addDoc()
 */
export function prepareForFirebaseCreate<T extends Record<string, any>>(
  data: T, 
  userId: string
): Partial<T> & { userId: string; createdAt: Date; updatedAt: Date } {
  const cleanData = removeUndefinedValues(data)
  
  return {
    ...cleanData,
    userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

/**
 * Prepares data for Firebase document updates
 * Cleans undefined values and adds update timestamp
 * 
 * @param data - Partial data to update
 * @returns Clean data ready for Firebase updateDoc()
 */
export function prepareForFirebaseUpdate<T extends Record<string, any>>(
  data: Partial<T>
): Partial<T> & { updatedAt: Date } {
  const cleanData = removeUndefinedValues(data)
  
  return {
    ...cleanData,
    updatedAt: new Date(),
  }
}

/**
 * Validates that required fields are present and not undefined
 * 
 * @param data - Data to validate
 * @param requiredFields - Array of field names that must be defined
 * @throws Error if any required field is missing or undefined
 */
export function validateRequiredFields<T extends Record<string, any>>(
  data: T, 
  requiredFields: (keyof T)[]
): void {
  const missingFields = requiredFields.filter(field => 
    data[field] === undefined || data[field] === null
  )
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`)
  }
}

/**
 * Converts Firestore timestamp fields to JavaScript Date objects
 * Useful when retrieving data from Firestore
 * 
 * @param data - Document data from Firestore
 * @param timestampFields - Array of field names that contain timestamps
 * @returns Data with converted Date objects
 */
export function convertFirestoreTimestamps<T extends Record<string, any>>(
  data: T, 
  timestampFields: (keyof T)[] = ['createdAt', 'updatedAt', 'startDate', 'endDate']
): T {
  const converted = { ...data }
  
  timestampFields.forEach(field => {
    if (converted[field] && typeof converted[field].toDate === 'function') {
      converted[field] = converted[field].toDate()
    }
  })
  
  return converted
}

/**
 * Safe way to handle optional Date fields from forms
 * Converts empty strings or null to undefined for optional fields
 * 
 * @param value - Date value that might be empty
 * @returns Date object or undefined
 */
export function sanitizeOptionalDate(value: Date | string | null | undefined): Date | undefined {
  if (!value || value === '') return undefined
  if (value instanceof Date) return value
  
  const date = new Date(value)
  return isNaN(date.getTime()) ? undefined : date
}

/**
 * Firebase-safe object merger that handles undefined values
 * 
 * @param target - Base object
 * @param source - Object to merge (may contain undefined values)
 * @returns Merged object with no undefined values
 */
export function mergeFirebaseSafe<T extends Record<string, any>, U extends Record<string, any>>(
  target: T, 
  source: U
): T & Partial<U> {
  const cleanSource = removeUndefinedValues(source)
  return { ...target, ...cleanSource }
}
