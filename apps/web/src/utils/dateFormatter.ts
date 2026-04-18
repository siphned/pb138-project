// Date formatting utilities
export const formatDate = (date: Date | string, format: string = 'MM/DD/YYYY'): string => {
  // Implement based on your needs
  // Consider using date-fns or day.js for complex formatting
  return new Date(date).toLocaleDateString();
};

export const formatDatetime = (date: Date | string): string => {
  return new Date(date).toLocaleString();
};
