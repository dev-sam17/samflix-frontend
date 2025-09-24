/**
 * Network Detection Utility for Samflix
 * Automatically detects if local server is available and switches between local/tunnel URLs
 */

export interface NetworkConfig {
  localUrl: string;
  tunnelUrl: string;
  isLocal: boolean;
  isAvailable: boolean;
}

class NetworkDetector {
  private static instance: NetworkDetector;
  private config: NetworkConfig | null = null;
  private lastCheck: number = 0;
  private checkInterval: number = 30000; // 30 seconds
  private isChecking: boolean = false;

  private constructor() {}

  static getInstance(): NetworkDetector {
    if (!NetworkDetector.instance) {
      NetworkDetector.instance = new NetworkDetector();
    }
    return NetworkDetector.instance;
  }

  /**
   * Check if local server is available
   */
  private async checkLocalServer(localUrl: string): Promise<boolean> {
    try {
      // For HTTPS sites, we need to be careful about mixed content
      // We'll use a simple fetch with a short timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

      const response = await fetch(`${localUrl}/health`, {
        method: 'GET',
        signal: controller.signal,
        mode: 'cors',
        cache: 'no-cache',
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.log('Local server not available:', error);
      return false;
    }
  }

  /**
   * Detect network configuration and choose appropriate URL
   */
  async detectNetwork(): Promise<NetworkConfig> {
    const now = Date.now();
    
    // Return cached result if recent
    if (this.config && (now - this.lastCheck) < this.checkInterval) {
      return this.config;
    }

    // Prevent multiple simultaneous checks
    if (this.isChecking) {
      return this.config || this.getDefaultConfig();
    }

    this.isChecking = true;

    try {
      const localUrl = process.env.NEXT_PUBLIC_API_URL_LOCAL || 'http://192.168.29.41:3310';
      const tunnelUrl = process.env.NEXT_PUBLIC_API_URL || 'https://samflix-be.devsam.in';

      // Check if we're on HTTPS and local URL is HTTP
      const isHttpsPage = typeof window !== 'undefined' && window.location.protocol === 'https:';
      const isLocalHttp = localUrl.startsWith('http:');
      
      let isLocalAvailable = false;
      
      // Only check local server if we're not on HTTPS or if local is HTTPS
      if (!isHttpsPage || !isLocalHttp) {
        isLocalAvailable = await this.checkLocalServer(localUrl);
      }

      this.config = {
        localUrl,
        tunnelUrl,
        isLocal: isLocalAvailable,
        isAvailable: true,
      };

      this.lastCheck = now;
      console.log('Network detection result:', this.config);
      
    } catch (error) {
      console.error('Network detection failed:', error);
      this.config = this.getDefaultConfig();
    } finally {
      this.isChecking = false;
    }

    return this.config;
  }

  /**
   * Get the appropriate API URL based on network detection
   */
  async getApiUrl(): Promise<string> {
    const config = await this.detectNetwork();
    return config.isLocal ? config.localUrl : config.tunnelUrl;
  }

  /**
   * Force a network recheck
   */
  async forceRecheck(): Promise<NetworkConfig> {
    this.lastCheck = 0;
    return this.detectNetwork();
  }

  /**
   * Get default configuration (fallback to tunnel)
   */
  private getDefaultConfig(): NetworkConfig {
    return {
      localUrl: process.env.NEXT_PUBLIC_API_URL_LOCAL || 'http://192.168.29.41:3310',
      tunnelUrl: process.env.NEXT_PUBLIC_API_URL || 'https://samflix-be.devsam.in',
      isLocal: false,
      isAvailable: true,
    };
  }

  /**
   * Check if current page is HTTPS
   */
  isHttpsPage(): boolean {
    return typeof window !== 'undefined' && window.location.protocol === 'https:';
  }

  /**
   * Get network status for debugging
   */
  getStatus(): NetworkConfig | null {
    return this.config;
  }
}

// Export singleton instance
export const networkDetector = NetworkDetector.getInstance();

// Utility functions
export async function getOptimalApiUrl(): Promise<string> {
  return networkDetector.getApiUrl();
}

export async function isLocalNetworkAvailable(): Promise<boolean> {
  const config = await networkDetector.detectNetwork();
  return config.isLocal;
}

export async function getNetworkConfig(): Promise<NetworkConfig> {
  return networkDetector.detectNetwork();
}
