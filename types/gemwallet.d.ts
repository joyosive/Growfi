// Type declarations for GemWallet extension
declare global {
  interface Window {
    gemWallet?: {
      isConnected: boolean;
      request: (params: any) => Promise<any>;
      [key: string]: any;
    };
  }
}

export {};