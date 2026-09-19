export function formatCurrency(
  amount: number,
  currency: 'toman' | 'usd',
  privacyMode = false,
  includeSymbol = true
): string {
  if (privacyMode) {
    return '••••••••';
  }

  if (currency === 'toman') {
    const formatted = Math.round(amount).toLocaleString('en-US');
    return includeSymbol ? `${formatted} تومان` : formatted;
  } else {
    const formatted = amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return includeSymbol ? `$${formatted}` : formatted;
  }
}

export function formatNumber(num: number, maxDecimals = 4): string {
  if (num === undefined || num === null || isNaN(num)) return '0';
  return Number(num).toLocaleString('en-US', {
    maximumFractionDigits: maxDecimals
  });
}

export function formatPercent(val: number): string {
  if (val === undefined || val === null || isNaN(val)) return '0.00%';
  const prefix = val > 0 ? '+' : '';
  return `${prefix}${val.toFixed(2)}%`;
}

export function formatDate(iso: string): string {
  try {
    const date = new Date(iso);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return iso;
  }
}
