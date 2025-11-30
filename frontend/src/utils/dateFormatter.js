/**
 * Format date to DD-MM-YYYY format
 * @param {Date|string} date - Date object or date string
 * @returns {string} Formatted date string in DD-MM-YYYY format
 */
export const formatDate = (date) => {
  if (!date) return '-';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}-${month}-${year}`;
};

/**
 * Format date to DD-MM-YYYY HH:MM format
 * @param {Date|string} date - Date object or date string
 * @returns {string} Formatted date string in DD-MM-YYYY HH:MM format
 */
export const formatDateTime = (date) => {
  if (!date) return '-';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  return `${day}-${month}-${year} ${hours}:${minutes}`;
};

/**
 * Format date to DD-MM-YYYY HH:MM:SS format
 * @param {Date|string} date - Date object or date string
 * @returns {string} Formatted date string in DD-MM-YYYY HH:MM:SS format
 */
export const formatDateTimeFull = (date) => {
  if (!date) return '-';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
};

/**
 * Format time only to HH:MM format
 * @param {Date|string} date - Date object or date string
 * @returns {string} Formatted time string in HH:MM format
 */
export const formatTime = (date) => {
  if (!date) return '-';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  return `${hours}:${minutes}`;
};

