// Utility functions
export function createPageUrl(pageName) {
  // Simple utility to create page URLs
  // In a more complex app, this might handle routing logic
  const pageMap = {
    'FlankerTask': '/flanker',
    'Results': '/results',
    'Instructions': '/instructions'
  };
  
  return pageMap[pageName] || '/';
}
