'use client';

import React, { useState, useEffect } from 'react';
import { X, Shield, Eye, EyeOff, Check } from 'lucide-react';

interface GemWalletPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
  transactionType: 'authorize' | 'payment' | 'connect';
  details: {
    amount?: string;
    tokenSymbol?: string;
    destination?: string;
    farm?: string;
    plots?: string;
  };
}

const GemWalletPopup: React.FC<GemWalletPopupProps> = ({
  isOpen,
  onClose,
  onConfirm,
  transactionType,
  details
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [step, setStep] = useState<'password' | 'authenticating' | 'success'>('password');

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setShowPassword(false);
      setStep('password');
      setIsAuthenticating(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setIsAuthenticating(true);
    setStep('authenticating');

    // Simulate authentication delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    setStep('success');

    // Auto-confirm after success animation
    setTimeout(() => {
      onConfirm(password);
      onClose();
    }, 1500);
  };

  const handleCancel = () => {
    setPassword('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleCancel}
      />

      {/* Popup Window */}
      <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                💎
              </div>
              <div>
                <h3 className="font-bold text-lg">GemWallet</h3>
                <p className="text-blue-100 text-sm">Transaction Approval</p>
              </div>
            </div>
            <button
              onClick={handleCancel}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Transaction Details */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
            <h4 className="font-semibold text-gray-900 mb-3">
              {transactionType === 'connect' ? '🔗 Connection Request' :
               transactionType === 'authorize' ? '🔐 Authorization Request' : '💰 Payment Request'}
            </h4>
            <div className="space-y-2 text-sm">
              {transactionType === 'connect' ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Action:</span>
                    <span className="font-medium">Connect Wallet</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Permission:</span>
                    <span className="font-medium">View public address</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Platform:</span>
                    <span className="font-medium">GrowFi Platform</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Address:</span>
                    <span className="font-mono text-xs">r3kSZtJAAjERiEprEJ3XVSKygELAWku88r</span>
                  </div>
                </>
              ) : transactionType === 'authorize' ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Action:</span>
                    <span className="font-medium">Authorize MPT Holding</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Token:</span>
                    <span className="font-medium">{details.tokenSymbol} tokens</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Farm:</span>
                    <span className="font-medium">{details.farm}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Destination:</span>
                    <span className="font-mono text-xs">{details.destination?.slice(0, 8)}...{details.destination?.slice(-6)}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Action:</span>
                    <span className="font-medium">Purchase MPT Tokens</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">{details.amount} {details.tokenSymbol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Plots:</span>
                    <span className="font-medium">{details.plots}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Destination:</span>
                    <span className="font-mono text-xs">{details.destination?.slice(0, 8)}...{details.destination?.slice(-6)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {step === 'password' && (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter your GemWallet password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter password"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!password.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Confirm
                </button>
              </div>
            </form>
          )}

          {step === 'authenticating' && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Shield className="h-8 w-8 text-blue-600 animate-pulse" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Authenticating...</h4>
              <p className="text-gray-600 text-sm">Verifying your identity</p>
              <div className="mt-4 flex justify-center">
                <div className="flex gap-1">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Authentication Successful!</h4>
              <p className="text-gray-600 text-sm">Processing transaction...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t flex items-center justify-center">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Secured by GemWallet Extension
          </p>
        </div>
      </div>
    </div>
  );
};

export default GemWalletPopup;