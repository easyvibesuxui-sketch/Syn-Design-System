export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/** Element heights: xs 24 (smallest), sm 36 (small), md 48 (medium), lg 56 (large). */
export type ControlSize = 'xs' | 'sm' | 'md' | 'lg';
