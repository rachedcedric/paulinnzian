/**
 * Commercial conversion rate used for the "Devis d'achat" simulator.
 * This is Paulin N'ZIAN's own fixed retail rate, independent from the
 * bank/market exchange rate and from the `ExchangeRate` records managed
 * in /tarifs. Do not reuse this constant to change tarifs elsewhere.
 */
export const DEVIS_FCFA_PER_EUR = 670;

export function convertEurToFcfa(amountEur: number, rate: number = DEVIS_FCFA_PER_EUR): number {
  return Math.round(amountEur * rate);
}

// Intl's fr-FR locale groups digits with a narrow no-break space (U+202F),
// which renders as an invisible glitch once copied into WhatsApp/SMS. Force
// a normal ASCII space instead so amounts stay copy/paste friendly.
function withPlainSpaces(value: string): string {
  return value.replace(/[  ]/g, " ");
}

export function formatEur(amount: number): string {
  return withPlainSpaces(
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  );
}

export function formatFcfa(amount: number): string {
  const grouped = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(
    Math.round(amount)
  );
  return `${withPlainSpaces(grouped)} FCFA`;
}

export interface DevisLineInput {
  store?: string;
  cartAmount: number;
  shippingFee?: number;
}

export interface DevisLineResult {
  store: string;
  cartAmount: number;
  shippingFee: number;
  totalEur: number;
  totalFcfa: number;
}

export interface DevisResult {
  lines: DevisLineResult[];
  totalArticlesEur: number;
  totalShippingEur: number;
  totalEur: number;
  totalFcfa: number;
  rate: number;
}

export function computeDevis(
  lines: DevisLineInput[],
  rate: number = DEVIS_FCFA_PER_EUR
): DevisResult {
  const computedLines = lines.map((line, index) => {
    const cartAmount = Number.isFinite(line.cartAmount) ? line.cartAmount : 0;
    const shippingFee = Number.isFinite(line.shippingFee) ? (line.shippingFee as number) : 0;
    const totalEur = cartAmount + shippingFee;

    return {
      store: line.store?.trim() || `Boutique ${index + 1}`,
      cartAmount,
      shippingFee,
      totalEur,
      totalFcfa: convertEurToFcfa(totalEur, rate),
    };
  });

  const totalArticlesEur = computedLines.reduce((sum, line) => sum + line.cartAmount, 0);
  const totalShippingEur = computedLines.reduce((sum, line) => sum + line.shippingFee, 0);
  const totalEur = totalArticlesEur + totalShippingEur;

  return {
    lines: computedLines,
    totalArticlesEur,
    totalShippingEur,
    totalEur,
    totalFcfa: convertEurToFcfa(totalEur, rate),
    rate,
  };
}
