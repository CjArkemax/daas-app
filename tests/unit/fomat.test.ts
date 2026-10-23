import { describe, it, expect } from 'vitest';
import { formatDuration } from '@/lib/timer/format';

describe('formatDuration', () => {
  it('handles zero and negative numbers', () => {
    expect(formatDuration(0)).toBe('00:00');
    expect(formatDuration(-10)).toBe('00:00');
  });

  it('formats minutes and seconds', () => {
    expect(formatDuration(59)).toBe('00:59');
    expect(formatDuration(60)).toBe('01:00');
    expect(formatDuration(1500)).toBe('25:00'); // 25 mins
    expect(formatDuration(3599)).toBe('59:59');
  });

  it('formats hours, minutes, and seconds', () => {
    expect(formatDuration(3600)).toBe('1:00:00');
    expect(formatDuration(3661)).toBe('1:01:01');
    expect(formatDuration(7200)).toBe('2:00:00');
  });
});