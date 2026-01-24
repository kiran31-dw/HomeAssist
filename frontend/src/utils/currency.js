// Currency formatting utility for Indian Rupees
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return 'N/A';
  return `₹${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatCurrencyShort = (amount) => {
  if (!amount && amount !== 0) return 'N/A';
  return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
};
