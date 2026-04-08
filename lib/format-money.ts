/** Formats integer cents as EUR for display. */
export function formatEurFromCents(cents: number): string {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "EUR" }).format(
    cents / 100
  );
}
