// Time formatting utility
export const formatTime = (timeString) => {
  if (!timeString) return 'N/A';
  
  // Handle TIME format from MySQL (HH:MM:SS) or HTML time input (HH:MM)
  const timeParts = timeString.split(':');
  if (timeParts.length < 2) return timeString;
  
  const hours = parseInt(timeParts[0], 10);
  const minutes = parseInt(timeParts[1], 10);
  
  // Format as HH:MM (24-hour format)
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

export const formatTime12Hour = (timeString) => {
  if (!timeString) return 'N/A';
  
  // Handle TIME format from MySQL (HH:MM:SS) or HTML time input (HH:MM)
  const timeParts = timeString.split(':');
  if (timeParts.length < 2) return timeString;
  
  const hours = parseInt(timeParts[0], 10);
  const minutes = parseInt(timeParts[1], 10);
  
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};
