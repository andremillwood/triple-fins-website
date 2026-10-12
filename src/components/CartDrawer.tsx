'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { canOrder, cartSubtotal, money } from '@/lib/catalogue';
import { CartItem } from '@/types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (index: string, delta: number) => void;
  onRemoveItem: (index: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
}) => {
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const [details, setDetails] = useState({ customer_name: '', email: '', phone: '', payment_method: 'pay_on_pickup', fulfillment_method: 'pickup' });

  if (!isOpen) return null;

  const subtotal = cartSubtotal(cart);

  const totalCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleCheckout = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if (cart.length === 0 || cart.some(item => !canOrder(item.product))) {
      setCheckoutMessage('Your cart is empty. Add an item before checking out.');
      return;
    }
    if (!checkoutOpen) {
      setCheckoutOpen(true);
      fetch('/api/config').then((r) => r.json()).then((data) => setStripeEnabled(Boolean(data.stripeEnabled))).catch(() => {});
      fetch('/api/analytics', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event_name: 'order_started' }) }).catch(() => {});
      return;
    }
    setSubmitting(true); setCheckoutMessage(null);
    try {
      const response = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...details, items: cart.map((item) => ({ product_id: item.product.id, quantity: item.quantity })) }) });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Order could not be placed.');
      if (result.data.checkoutUrl) { window.location.assign(result.data.checkoutUrl); return; }
      setCheckoutMessage(result.data.checkoutError || `${result.message} Reference: ${result.data.id}`);
    } catch (error) { setCheckoutMessage(error instanceof Error ? error.message : 'Order could not be placed.'); }
    finally { setSubmitting(false); }
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
                    {money(item.product.p === null ? null : item.product.p * item.quantity)}
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
              {money(subtotal)}
            </span>
          </div>

          {checkoutOpen && <form onSubmit={handleCheckout} className="grid gap-2 mb-3">
            <input required aria-label="Customer name" placeholder="Your name" className="px-3 py-2 border border-line" value={details.customer_name} onChange={(e) => setDetails({ ...details, customer_name: e.target.value })} />
            <input required type="email" aria-label="Email" placeholder="Email" className="px-3 py-2 border border-line" value={details.email} onChange={(e) => setDetails({ ...details, email: e.target.value })} />
            <input required aria-label="Phone or WhatsApp" placeholder="Phone / WhatsApp" className="px-3 py-2 border border-line" value={details.phone} onChange={(e) => setDetails({ ...details, phone: e.target.value })} />
            <select aria-label="Payment method" className="px-3 py-2 border border-line" value={details.payment_method} onChange={(e) => setDetails({ ...details, payment_method: e.target.value })}>{stripeEnabled && <option value="stripe">Pay online with Stripe</option>}<option value="bank_transfer">Bank transfer / manual verification</option><option value="pay_on_pickup">Pay on pickup</option></select>
            <select aria-label="Fulfillment method" className="px-3 py-2 border border-line" value={details.fulfillment_method} onChange={(e) => setDetails({ ...details, fulfillment_method: e.target.value })}><option value="pickup">Pickup</option><option value="delivery_coordination">Request delivery coordination</option></select>
            <button disabled={submitting} className="btn btn-sun w-full justify-center py-3 text-lg">{submitting ? 'Saving order…' : details.payment_method === 'stripe' ? 'Place Order & Pay' : 'Place Order'}</button>
          </form>}
          {!checkoutOpen && <button onClick={() => handleCheckout()} className="btn btn-sun w-full justify-center py-3 text-lg">Proceed to Checkout</button>}

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
