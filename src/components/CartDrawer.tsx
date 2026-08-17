'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { CartItem } from '@/types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (index: number, delta: number) => void;
  onRemoveItem: (index: number) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
}) => {
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const subtotal = cart.reduce(
    (acc, item) => acc + item.product.p * item.quantity,
    0
  );

  const totalCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleCheckout = () => {
    if (cart.length === 0) {
      setCheckoutMessage('Your cart is empty. Add an item before checking out.');
      return;
    }
    setCheckoutMessage(
      'Checkout is in preview mode. To place order inquiries or arrange pickup at Russell’s Paradise, please send an enquiry below or call +1 (876) 801-7907.'
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-deep2/70 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer */}
      <aside className="absolute right-0 top-0 bottom-0 w-full max-w-[420px] bg-paper shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="bg-deep text-white p-5 flex items-center justify-between border-b border-aqua/30">
          <div className="flex items-center gap-2">
            <h2 className="font-extrabold uppercase text-2xl text-white">
              Your Gear Cart
            </h2>
            <span className="bg-sun text-ink font-display font-bold text-xs px-2 py-0.5 rounded-full">
              {totalCount}
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close Cart"
            className="text-aqua hover:text-white text-2xl font-bold p-1 leading-none"
          >
            &times;
          </button>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-5 divide-y divide-line/70">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-muted p-8">
              <div className="w-16 h-16 mb-4 opacity-30">
                <Image
                  src="/brand-assets/TF_Logo_Dark.png"
                  alt="Empty Cart"
                  width={64}
                  height={64}
                />
              </div>
              <p className="font-display font-semibold text-lg text-deep">
                Your cart is empty.
              </p>
              <p className="text-sm mt-1">
                Add some official Triple Fins team gear and accessories to get started.
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.index} className="py-4 flex gap-4 items-center">
                {/* Thumb */}
                <div className="w-16 h-16 rounded-sm bg-foam flex-shrink-0 flex items-center justify-center border border-line p-2">
                  <Image
                    src="/brand-assets/TF_Logo_Dark.png"
                    alt={item.product.n}
                    width={40}
                    height={40}
                    className="w-4/5 h-auto opacity-70"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-extrabold uppercase text-base text-deep truncate">
                    {item.product.n}
                  </h4>
                  <p className="font-display font-bold text-aqua-deep text-sm">
                    JMD ${(item.product.p * item.quantity).toLocaleString()}
                  </p>

                  {/* Qty controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="inline-flex items-center border border-line rounded-sm bg-foam">
                      <button
                        onClick={() => onUpdateQuantity(item.index, -1)}
                        className="px-2 py-0.5 font-bold hover:bg-line text-deep text-sm"
                      >
                        −
                      </button>
                      <span className="px-2.5 py-0.5 text-xs font-bold text-deep">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.index, 1)}
                        className="px-2 py-0.5 font-bold hover:bg-line text-deep text-sm"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.index)}
                      className="text-xs text-coral hover:underline font-semibold ml-auto"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer & Checkout */}
        <div className="p-5 bg-foam border-t border-line">
          <div className="flex justify-between items-center mb-3">
            <span className="font-display font-semibold uppercase text-muted text-sm tracking-wider">
              Estimated Subtotal
            </span>
            <span className="font-display font-extrabold text-2xl text-deep">
              JMD ${subtotal.toLocaleString()}
            </span>
          </div>

          <button
            onClick={handleCheckout}
            className="btn btn-sun w-full justify-center py-3 text-lg"
          >
            Proceed to Checkout
          </button>

          {checkoutMessage && (
            <div className="mt-3 p-3 bg-white border border-aqua/30 rounded-sm text-xs text-deep leading-relaxed">
              {checkoutMessage}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};
