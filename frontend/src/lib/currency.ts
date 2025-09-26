// Currency formatting utility for Indian Rupees
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Alternative formatting with custom rupee symbol
export const formatRupees = (amount: number): string => {
  return `₹${amount.toFixed(2)}`;
};

// Format for large amounts with Indian number system
export const formatLargeAmount = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    notation: 'compact',
    compactDisplay: 'short'
  }).format(amount);
};