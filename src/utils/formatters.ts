/**
 * Utility functions for safely formatting data across JobSeeker Pro
 */

export const normalizeArray = (val: string | string[] | undefined | null): string[] => {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val.filter(item => typeof item === 'string' && item.trim().length > 0);
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) return [];
    
    // Check if newline separated
    if (trimmed.includes('\n')) {
      return trimmed
        .split('\n')
        .map(s => s.trim().replace(/^[-•*]\s*/, ''))
        .filter(Boolean);
    }
    
    // Check if period separated into sentences
    if (trimmed.includes('. ')) {
      return trimmed
        .split(/\.\s+/)
        .map(s => s.trim().replace(/\.$/, ''))
        .filter(Boolean);
    }

    // Check if comma separated (if short items)
    if (trimmed.includes(',') && !trimmed.includes(';')) {
      const parts = trimmed.split(',').map(s => s.trim()).filter(Boolean);
      if (parts.length > 1 && parts.every(p => p.length < 50)) {
        return parts;
      }
    }

    return [trimmed];
  }
  return [];
};

export const formatRelativeTime = (dateVal: number | string | undefined | null): string => {
  if (!dateVal) return 'Recently';
  
  let timestamp: number;

  if (typeof dateVal === 'number') {
    timestamp = dateVal;
  } else if (typeof dateVal === 'string') {
    // If it's already a relative human string like "2 hours ago", "Just now"
    if (dateVal.includes('ago') || dateVal === 'Just now' || dateVal === 'Today' || dateVal === 'Yesterday') {
      return dateVal;
    }
    
    const parsedNum = Number(dateVal);
    if (!isNaN(parsedNum) && parsedNum > 1000000000) {
      timestamp = parsedNum;
    } else {
      const parsedDate = new Date(dateVal).getTime();
      if (!isNaN(parsedDate)) {
        timestamp = parsedDate;
      } else {
        return dateVal;
      }
    }
  } else {
    return 'Recently';
  }

  const now = Date.now();
  const diffMs = now - timestamp;
  
  if (diffMs < 0) return 'Just now';
  if (diffMs < 60000) return 'Just now';
  
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};
