import { describe, it, expect } from 'vitest';
import { cn } from '../utils';

describe('utils', () => {
  it('should merge classes correctly', () => {
    const result = cn('px-4', 'py-2', 'bg-blue-500');
    expect(result).toBe('px-4 py-2 bg-blue-500');
  });

  it('should handle conditional classes', () => {
    const result = cn('px-4', false && 'py-2', 'bg-blue-500');
    expect(result).toBe('px-4 bg-blue-500');
  });
});