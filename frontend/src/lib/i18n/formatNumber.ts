export function formatIndianNumber(value: number, lang: 'EN' | 'BN' | 'HI', isCurrency: boolean = false, isCompact: boolean = false): string {
  const localeMap = {
    EN: 'en-IN',
    BN: 'bn-IN',
    HI: 'hi-IN',
  };

  const locale = localeMap[lang];

  const options: Intl.NumberFormatOptions = {
    maximumFractionDigits: 0,
  };

  if (isCurrency) {
    options.style = 'currency';
    options.currency = 'INR';
    options.maximumFractionDigits = 0;
  }

  if (isCompact) {
    options.notation = 'compact';
    options.compactDisplay = 'short';
  }

  return new Intl.NumberFormat(locale, options).format(value);
}
