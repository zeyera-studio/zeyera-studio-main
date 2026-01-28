import React, { useState, useRef, useEffect } from 'react';
import { X, ShoppingCart, Lock, CreditCard, Loader2 } from 'lucide-react';
import { Content } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { buildPaymentData, generateOrderId, getCheckoutUrl, isPayHereConfigured } from '../lib/payhereClient';
import { createPendingPurchase, getSeasonPrice, hasPendingPurchase, completePurchase } from '../lib/purchaseService';

interface PurchaseModalProps {
  isOpen: boolean;
  content: Content;
  seasonNumber?: number;
  price: number;
  onClose: () => void;
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({
  isOpen,
  content,
  seasonNumber,
  price,
  onClose,
}) => {
  const { user, profile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  if (!isOpen) return null;

  const itemName = seasonNumber
    ? `${content.title} - Season ${seasonNumber}`
    : content.title;

  // TEST MODE: Bypass PayHere and mark as purchased immediately
  const handleTestPurchase = async () => {
    if (!user || !profile) {
      setError('Please log in to make a purchase');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Generate order ID
      const orderId = generateOrderId(content.id, user.id, seasonNumber);

      // Create pending purchase
      await createPendingPurchase(user.id, content.id, orderId, price, seasonNumber);

      // Immediately mark as completed (bypass payment gateway)
      await completePurchase(orderId);

      // Redirect to success page
      window.location.href = `${window.location.origin}?payment=success&order_id=${orderId}`;
    } catch (err) {
      console.error('Error in test purchase:', err);
      setError('Failed to complete test purchase. Please try again.');
      setIsLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!user || !profile) {
      setError('Please log in to make a purchase');
      return;
    }

    if (!isPayHereConfigured()) {
      setError('Payment system is not configured. Please contact support.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check for existing pending purchase
      const existingOrderId = await hasPendingPurchase(user.id, content.id, seasonNumber);
      
      // Generate order ID
      const orderId = existingOrderId || generateOrderId(content.id, user.id, seasonNumber);

      // Create pending purchase in database (if not exists)
      if (!existingOrderId) {
        await createPendingPurchase(user.id, content.id, orderId, price, seasonNumber);
      }

      // Build return URLs
      const baseUrl = window.location.origin;
      const returnUrl = `${baseUrl}?payment=success&order_id=${orderId}`;
      const cancelUrl = `${baseUrl}?payment=cancelled&order_id=${orderId}`;

      // Build payment data
      const paymentData = await buildPaymentData(
        orderId,
        itemName,
        price,
        { email: profile.email, username: profile.username },
        returnUrl,
        cancelUrl
      );

      // Create and submit form
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = getCheckoutUrl();

      Object.entries(paymentData).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      console.error('Error initiating purchase:', err);
      setError('Failed to initiate payment. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-dark-gray rounded-xl max-w-md w-full mx-4 overflow-hidden shadow-2xl border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <ShoppingCart className="text-neon-green" size={20} />
            <h2 className="text-lg font-bold text-white">Purchase Content</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Content Preview */}
          <div className="flex gap-4 mb-6">
            <img
              src={content.poster_url}
              alt={content.title}
              className="w-24 h-36 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h3 className="text-white font-semibold text-lg">{content.title}</h3>
              {seasonNumber && (
                <p className="text-neon-green text-sm">Season {seasonNumber}</p>
              )}
              <p className="text-gray-400 text-sm mt-1">
                {content.content_type} • {content.genre}
              </p>
              <p className="text-gray-400 text-sm">{content.year}</p>
            </div>
          </div>

          {/* Price */}
          <div className="bg-black/30 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Price</span>
              <span className="text-2xl font-bold text-neon-green">
                Rs. {price.toLocaleString()}
              </span>
            </div>
            <p className="text-gray-500 text-xs mt-2">
              One-time purchase • Lifetime access
            </p>
          </div>

          {/* Payment Info */}
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="text-blue-400" size={18} />
              <span className="text-blue-400 font-medium">Secure Payment</span>
            </div>
            <p className="text-gray-400 text-sm">
              Pay securely with PayHere. Supports Visa, Mastercard, and local bank transfers.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 mb-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Purchase Button - PayHere */}
          <button
            onClick={handlePurchase}
            disabled={isLoading}
            className="w-full bg-neon-green text-black font-bold py-3 rounded-lg hover:bg-neon-green/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Processing...
              </>
            ) : (
              <>
                <Lock size={18} />
                Pay Rs. {price.toLocaleString()}
              </>
            )}
          </button>

          {/* TEST MODE Button - For Development Testing */}
          <button
            onClick={handleTestPurchase}
            disabled={isLoading}
            className="w-full mt-3 bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border-2 border-dashed border-purple-400"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Processing...
              </>
            ) : (
              <>
                🧪 Test Purchase (Skip Payment)
              </>
            )}
          </button>
          <p className="text-purple-400 text-xs text-center mt-1">
            ⚠️ Testing only - bypasses payment gateway
          </p>

          {/* Terms */}
          <p className="text-gray-500 text-xs text-center mt-4">
            By purchasing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PurchaseModal;
