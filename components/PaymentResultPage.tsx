import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Loader2, Play, ArrowLeft, ShoppingBag } from 'lucide-react';
import { completePurchase, cancelPurchase, getPurchaseByOrderId } from '../lib/purchaseService';
import { Purchase } from '../types';

interface PaymentResultPageProps {
  status: 'success' | 'cancelled' | 'error';
  orderId: string;
  onNavigate: (page: string, contentId?: string) => void;
}

export const PaymentResultPage: React.FC<PaymentResultPageProps> = ({
  status,
  orderId,
  onNavigate,
}) => {
  const [isProcessing, setIsProcessing] = useState(true);
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processPayment = async () => {
      try {
        if (status === 'success') {
          // Complete the purchase
          const completedPurchase = await completePurchase(orderId);
          if (completedPurchase) {
            // Fetch full purchase details with content
            const fullPurchase = await getPurchaseByOrderId(orderId);
            setPurchase(fullPurchase);
          } else {
            // Purchase might already be completed, try to fetch it
            const existingPurchase = await getPurchaseByOrderId(orderId);
            if (existingPurchase?.status === 'completed') {
              setPurchase(existingPurchase);
            } else {
              setError('Could not verify payment. Please contact support.');
            }
          }
        } else if (status === 'cancelled') {
          await cancelPurchase(orderId);
          const cancelledPurchase = await getPurchaseByOrderId(orderId);
          setPurchase(cancelledPurchase);
        }
      } catch (err) {
        console.error('Error processing payment result:', err);
        setError('An error occurred while processing your payment.');
      } finally {
        setIsProcessing(false);
      }
    };

    processPayment();
  }, [status, orderId]);

  const handleWatchNow = () => {
    if (purchase?.content) {
      const contentType = (purchase.content as any).content_type;
      if (contentType === 'Movie') {
        onNavigate('movieDetail', purchase.content_id);
      } else {
        onNavigate('tvDetail', purchase.content_id);
      }
    }
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-neon-green animate-spin mx-auto mb-4" />
          <h2 className="text-xl text-white font-semibold">Processing your payment...</h2>
          <p className="text-gray-400 mt-2">Please wait while we verify your purchase.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {status === 'success' && !error ? (
          <div className="bg-dark-gray rounded-xl p-8 text-center border border-green-500/30">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Payment Successful!</h1>
            <p className="text-gray-400 mb-6">
              Thank you for your purchase. Your content is now unlocked.
            </p>

            {purchase?.content && (
              <div className="bg-black/30 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-4">
                  <img
                    src={(purchase.content as any).poster_url}
                    alt={(purchase.content as any).title}
                    className="w-16 h-24 object-cover rounded"
                  />
                  <div className="text-left">
                    <h3 className="text-white font-semibold">
                      {(purchase.content as any).title}
                    </h3>
                    {purchase.season_number && (
                      <p className="text-neon-green text-sm">
                        Season {purchase.season_number}
                      </p>
                    )}
                    <p className="text-gray-400 text-sm">
                      Rs. {purchase.amount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={handleWatchNow}
                className="w-full bg-neon-green text-black font-bold py-3 rounded-lg hover:bg-neon-green/80 transition-all flex items-center justify-center gap-2"
              >
                <Play size={20} fill="currentColor" />
                Watch Now
              </button>
              <button
                onClick={() => onNavigate('myPurchases')}
                className="w-full bg-gray-700 text-white font-medium py-3 rounded-lg hover:bg-gray-600 transition-all flex items-center justify-center gap-2"
              >
                <ShoppingBag size={18} />
                View My Purchases
              </button>
            </div>
          </div>
        ) : status === 'cancelled' ? (
          <div className="bg-dark-gray rounded-xl p-8 text-center border border-yellow-500/30">
            <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-yellow-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Payment Cancelled</h1>
            <p className="text-gray-400 mb-6">
              Your payment was cancelled. No charges were made.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => onNavigate('home')}
                className="w-full bg-neon-green text-black font-bold py-3 rounded-lg hover:bg-neon-green/80 transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft size={18} />
                Back to Home
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-dark-gray rounded-xl p-8 text-center border border-red-500/30">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Payment Error</h1>
            <p className="text-gray-400 mb-6">
              {error || 'Something went wrong with your payment. Please try again.'}
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => onNavigate('home')}
                className="w-full bg-neon-green text-black font-bold py-3 rounded-lg hover:bg-neon-green/80 transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft size={18} />
                Back to Home
              </button>
            </div>

            <p className="text-gray-500 text-sm mt-4">
              Order ID: {orderId}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentResultPage;
