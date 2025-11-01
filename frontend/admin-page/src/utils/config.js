/**
 * Configuration utilities for the admin frontend
 * Centralizes environment variables and provides safe defaults
 */

export const config = {
  /**
   * Backend API base URL
   * Must include the /v1 prefix
   */
  get API_URL() {
    // Check if full URL is provided, otherwise construct from base + path
    let url = import.meta.env?.VITE_API_URL;
    
    if (!url) {
      // In development, use relative path to leverage Vite proxy
      // In production, use full URL
      if (import.meta.env?.DEV) {
        // Use relative path in dev mode - Vite proxy will handle it
        url = '/v1';
      } else {
        // Production: use full URL
        const baseUrl = import.meta.env?.VITE_BACKEND_URL || 'http://127.0.0.1:8000';
        const apiPath = '/v1'; // Backend routes are accessible at /v1
        url = `${baseUrl}${apiPath}`;
      }
    }
    
    // Remove trailing slash if present
    return url.replace(/\/$/, '');
  },

  /**
   * Check if running in development mode
   */
  get IS_DEV() {
    return import.meta.env?.DEV === true || import.meta.env?.MODE === 'development';
  },

  /**
   * Check if running in production mode
   */
  get IS_PROD() {
    return import.meta.env?.MODE === 'production';
  },

  /**
   * Log configuration on app load (dev only)
   */
  logConfig() {
    if (this.IS_DEV) {
      console.log('🔧 Frontend Configuration:', {
        API_URL: this.API_URL,
        IS_DEV: this.IS_DEV,
        IS_PROD: this.IS_PROD,
      });
    }
  },
};

// Log config when module loads (dev only)
config.logConfig();

export default config;

