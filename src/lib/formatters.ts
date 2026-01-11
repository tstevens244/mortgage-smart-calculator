export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat("en-US").format(value);
};

export const parseNumber = (value: string): number => {
  return parseInt(value.replace(/[^0-9]/g, ""), 10) || 0;
};

export const formatPercent = (value: number): string => {
  return `${value.toFixed(1)}%`;
};
