import { describe, expect, it } from 'vitest';
import { MOCK_HEADLINES, MOCK_GENERATED_CONTENT } from '@/lib/mock-data';

describe('mock data primitives', () => {
  it('provides seeded headlines', () => {
    expect(MOCK_HEADLINES.length).toBeGreaterThan(0);
  });

  it('provides at least one generated content example', () => {
    expect(MOCK_GENERATED_CONTENT.length).toBeGreaterThan(0);
  });
});
