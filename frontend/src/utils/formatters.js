import { format, formatDistanceToNow } from 'date-fns';

export const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  return format(new Date(timestamp), 'PPp');
};

export const formatRelativeTime = (timestamp) => {
  if (!timestamp) return '';
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
};

export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
