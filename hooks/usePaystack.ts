import { useEffect, useState } from 'react';

declare global {
  interface Window {
    PaystackPop?: {
      setup: (config: PaystackConfig) => {
        openIframe: () => void;
      };
    };
  }
}

export interface PaystackConfig {
  key: string;
  email: string;
  amount: number;
  currency?: string;
  ref?: string;
  metadata?: {
    custom_fields?: Array<{
      display_name: string;
      variable_name: string;
      value: string;
    }>;
    [key: string]: unknown;
  };
  callback?: (response: PaystackResponse) => void;
  onClose?: () => void;
}

export interface PaystackResponse {
  reference: string;
  status: string;
  trans: string;
  transaction: string;
  trxref: string;
  message?: string;
}

export const usePaystack = () => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Check if script is already loaded
    if (window.PaystackPop) {
      console.log('Paystack already loaded from previous mount');
      setLoaded(true);
      setError(null);
      return;
    }

    // Check if script element already exists
    const existingScript = document.querySelector('script[src*="paystack.co"]');
    if (existingScript) {
      console.log('Paystack script tag exists, waiting for load...');
      // Give it time to load
      const checkInterval = setInterval(() => {
        if (window.PaystackPop) {
          console.log('Paystack loaded from existing script');
          setLoaded(true);
          setError(null);
          clearInterval(checkInterval);
        }
      }, 100);
      
      // Clear interval after 5 seconds
      setTimeout(() => clearInterval(checkInterval), 5000);
      return;
    }

    console.log('Loading Paystack script...', { retryAttempt: retryCount });

    // Load Paystack inline script
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    
    // Set timeout for script loading
    const timeout = setTimeout(() => {
      if (!window.PaystackPop) {
        console.error('Paystack script load timeout');
        setError('Payment system is taking too long to load. Please refresh the page.');
        setLoaded(false);
      }
    }, 10000); // 10 second timeout
    
    script.onload = () => {
      clearTimeout(timeout);
      console.log('✓ Paystack script loaded successfully');
      
      // Double check that PaystackPop is available
      if (window.PaystackPop) {
        setLoaded(true);
        setError(null);
      } else {
        console.error('Script loaded but PaystackPop not available');
        setError('Payment system loaded incorrectly. Please refresh the page.');
      }
    };
    
    script.onerror = (e) => {
      clearTimeout(timeout);
      console.error('Failed to load Paystack script:', e);
      console.error('Script src:', script.src);
      console.error('Network status:', navigator.onLine ? 'Online' : 'Offline');
      
      // Retry logic
      if (retryCount < 2) {
        console.log(`Retrying... (${retryCount + 1}/2)`);
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, 2000);
      } else {
        setError('Failed to load payment system. Please check your internet connection and try again.');
      }
      setLoaded(false);
    };
    
    document.body.appendChild(script);

    return () => {
      clearTimeout(timeout);
      // Don't remove script on unmount to allow reuse
    };
  }, [retryCount]);

  const initializePayment = (config: PaystackConfig) => {
    if (!loaded || !window.PaystackPop) {
      console.error('Paystack script not loaded');
      setError('Payment system is not ready. Please try again.');
      return;
    }

    try {
      // Wrap everything in a try-catch to handle CORS errors gracefully
      const handler = window.PaystackPop.setup({
        ...config,
        // Add error handling at the iframe level
        onClose: () => {
          console.log('Payment window closed by user');
          if (config.onClose) {
            try {
              config.onClose();
            } catch (e) {
              console.error('Error in onClose callback:', e);
            }
          }
        },
        callback: (response: PaystackResponse) => {
          console.log('Payment response:', response);
          if (config.callback) {
            try {
              config.callback(response);
            } catch (e) {
              console.error('Error in payment callback:', e);
              setError('Error processing payment response');
            }
          }
        },
      });
      
      console.log('Opening Paystack payment modal...');
      handler.openIframe();
    } catch (err) {
      console.error('Error initializing payment:', err);
      // Don't set error state here - the CORS warning is normal in dev
      // The payment still works, React just can't see cross-origin errors
    }
  };

  return { loaded, initializePayment, error };
};
