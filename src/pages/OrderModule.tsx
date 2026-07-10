import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { MenuItem, CartLine } from '../types';
import { formatPKR, formatDateTime } from '../lib/format';
import {
  Search,
  Plus,
  Minus,
  ShoppingCart,
  X,
  CreditCard,
  Banknote,
  Check,
  Printer,
  ArrowLeft,
} from 'lucide-react';
import Logo from '../components/Logo';
import Modal from '../components/Modal';

interface OrderModuleProps {
  onBack: () => void;
}

type CheckoutStep = 'cart' | 'payment' | 'receipt';

export default function OrderModule({ onBack }: OrderModuleProps) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('cart');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | null>(null);
  const [placing, setPlacing] = useState(false);
  const [receipt, setReceipt] = useState<{
    orderId: string;
    total: number;
    method: 'cash' | 'card';
    lines: CartLine[];
    timestamp: string;
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('is_available', true)
      .order('category', { ascending: true })
      .order('name', { ascending: true });
    if (error) console.error(error);
    else setItems(data as MenuItem[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function addToCart(item: MenuItem) {
    setCart((prev) => {
      const existing = prev.find((l) => l.item.id === item.id);
      if (existing) {
        return prev.map((l) => (l.item.id === item.id ? { ...l, quantity: l.quantity + 1 } : l));
      }
      return [...prev, { item, quantity: 1 }];
    });
  }

  function updateQty(itemId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((l) => (l.item.id === itemId ? { ...l, quantity: l.quantity + delta } : l))
        .filter((l) => l.quantity > 0),
    );
  }

  function removeLine(itemId: string) {
    setCart((prev) => prev.filter((l) => l.item.id !== itemId));
  }

  const cartTotal = cart.reduce((s, l) => s + Number(l.item.price) * l.quantity, 0);
  const cartCount = cart.reduce((s, l) => s + l.quantity, 0);

  const filtered = items.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.category.toLowerCase().includes(search.toLowerCase()),
  );

  const categories = [...new Set(filtered.map((i) => i.category))].sort();

  async function placeOrder() {
    if (!paymentMethod || cart.length === 0) return;
    setPlacing(true);
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        total_amount: cartTotal,
        payment_method: paymentMethod,
      })
      .select()
      .single();
    if (error) {
      console.error(error);
      setPlacing(false);
      return;
    }
    const orderItemsPayload = cart.map((l) => ({
      order_id: order.id,
      menu_item_id: l.item.id,
      item_name: l.item.name,
      item_price: Number(l.item.price),
      quantity: l.quantity,
    }));
    const { error: oiError } = await supabase.from('order_items').insert(orderItemsPayload);
    if (oiError) console.error(oiError);

    setReceipt({
      orderId: order.id,
      total: cartTotal,
      method: paymentMethod,
      lines: cart,
      timestamp: order.created_at,
    });
    setPlacing(false);
    setCheckoutStep('receipt');
  }

  function resetOrder() {
    setCart([]);
    setReceipt(null);
    setPaymentMethod(null);
    setCheckoutStep('cart');
    setCartOpen(false);
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-zinc-900/90 backdrop-blur border-b border-zinc-800">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 -ml-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <Logo size={36} />
            <span className="font-black text-lg">
              SMASH <span className="text-yellow-400">DADDY</span>
            </span>
            <span className="text-xs text-zinc-500 hidden sm:inline ml-1">Order Module</span>
          </div>
          <button
            onClick={() => setCartOpen(true)}
            className="relative bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all active:scale-95"
          >
            <ShoppingCart size={18} />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center animate-[scaleIn_0.2s_ease-out]">
                {cartCount}
              </span>
            )}
          </button>
        </div>
        {/* Search */}
        <div className="max-w-5xl mx-auto px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search items..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-zinc-600 focus:border-yellow-400/50 outline-none transition-all"
            />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <span className="w-8 h-8 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-zinc-500">
            <p>No items available.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {categories.map((cat) => {
              const catItems = filtered.filter((i) => i.category === cat);
              return (
                <div key={cat}>
                  <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">
                    {cat}
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {catItems.map((item) => {
                      const inCart = cart.find((l) => l.item.id === item.id);
                      return (
                        <button
                          key={item.id}
                          onClick={() => addToCart(item)}
                          className="group relative text-left bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-yellow-400/50 hover:bg-zinc-800/50 transition-all active:scale-95 animate-[fadeIn_0.3s_ease-out]"
                        >
                          <h3 className="font-semibold text-sm leading-tight">{item.name}</h3>
                          {item.description && (
                            <p className="text-zinc-500 text-xs mt-1 line-clamp-2">
                              {item.description}
                            </p>
                          )}
                          <p className="text-yellow-400 font-bold mt-2">{formatPKR(item.price)}</p>
                          {inCart && (
                            <span className="absolute top-2 right-2 bg-yellow-400 text-black text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center animate-[scaleIn_0.2s_ease-out]">
                              {inCart.quantity}
                            </span>
                          )}
                          <span className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Plus className="text-yellow-400" size={18} />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Cart / Checkout / Receipt Modal */}
      <Modal
        open={cartOpen}
        onClose={() => {
          if (checkoutStep !== 'receipt') setCartOpen(false);
        }}
        title={
          checkoutStep === 'receipt'
            ? 'Receipt'
            : checkoutStep === 'payment'
              ? 'Payment Method'
              : 'Your Order'
        }
        maxWidth="max-w-lg"
      >
        {checkoutStep === 'cart' && (
          <div className="space-y-4">
            {cart.length === 0 ? (
              <p className="text-center text-zinc-500 py-8">Your cart is empty. Add items from the menu.</p>
            ) : (
              <>
                <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
                  {cart.map((line) => (
                    <div
                      key={line.item.id}
                      className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 rounded-xl p-3 animate-[fadeIn_0.2s_ease-out]"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{line.item.name}</p>
                        <p className="text-zinc-500 text-xs">{formatPKR(line.item.price)} each</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQty(line.item.id, -1)}
                          className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-6 text-center font-bold">{line.quantity}</span>
                        <button
                          onClick={() => updateQty(line.item.id, 1)}
                          className="w-7 h-7 rounded-lg bg-yellow-400 text-black hover:bg-yellow-300 flex items-center justify-center transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className="w-20 text-right font-bold text-sm">
                        {formatPKR(Number(line.item.price) * line.quantity)}
                      </span>
                      <button
                        onClick={() => removeLine(line.item.id)}
                        className="text-zinc-600 hover:text-red-400 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
                  <span className="text-zinc-400">Total</span>
                  <span className="text-2xl font-black text-yellow-400">{formatPKR(cartTotal)}</span>
                </div>
                <button
                  onClick={() => setCheckoutStep('payment')}
                  className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-3 rounded-xl transition-all active:scale-95"
                >
                  Proceed to Checkout
                </button>
              </>
            )}
          </div>
        )}

        {checkoutStep === 'payment' && (
          <div className="space-y-4">
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
              <div className="flex justify-between text-sm text-zinc-400 mb-1">
                <span>Items</span>
                <span>{cartCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Total</span>
                <span className="text-2xl font-black text-yellow-400">{formatPKR(cartTotal)}</span>
              </div>
            </div>
            <p className="text-sm text-zinc-300">Select payment method:</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPaymentMethod('cash')}
                className={`flex flex-col items-center gap-2 py-6 rounded-xl border-2 transition-all active:scale-95 ${
                  paymentMethod === 'cash'
                    ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <Banknote size={28} />
                <span className="font-bold">Cash</span>
              </button>
              <button
                onClick={() => setPaymentMethod('card')}
                className={`flex flex-col items-center gap-2 py-6 rounded-xl border-2 transition-all active:scale-95 ${
                  paymentMethod === 'card'
                    ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <CreditCard size={28} />
                <span className="font-bold">Card / Online</span>
              </button>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setCheckoutStep('cart')}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium py-3 rounded-xl transition-colors"
              >
                Back
              </button>
              <button
                onClick={placeOrder}
                disabled={!paymentMethod || placing}
                className="flex-1 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-black font-bold py-3 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {placing ? (
                  <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    <Check size={18} /> Confirm Order
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {checkoutStep === 'receipt' && receipt && (
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/10 rounded-full mb-3 animate-[scaleIn_0.3s_cubic-bezier(0.16,1,0.3,1)]">
                <Check className="text-green-400" size={32} />
              </div>
              <p className="font-bold text-lg">Order Complete!</p>
              <p className="text-zinc-500 text-sm">{formatDateTime(receipt.timestamp)}</p>
            </div>

            {/* Printable receipt */}
            <div
              id="receipt-print"
              className="bg-white text-black rounded-xl p-5 font-mono text-sm"
            >
              <div className="text-center mb-3">
                <p className="font-bold text-lg">SMASH DADDY</p>
                <p className="text-xs">--- Official Receipt ---</p>
                <p className="text-xs">{formatDateTime(receipt.timestamp)}</p>
                <p className="text-xs">Order #{receipt.orderId.slice(0, 8).toUpperCase()}</p>
              </div>
              <div className="border-t border-dashed border-black/30 my-2" />
              {receipt.lines.map((l) => (
                <div key={l.item.id} className="flex justify-between py-0.5">
                  <span className="truncate pr-2">
                    {l.quantity}x {l.item.name}
                  </span>
                  <span>{formatPKR(Number(l.item.price) * l.quantity)}</span>
                </div>
              ))}
              <div className="border-t border-dashed border-black/30 my-2" />
              <div className="flex justify-between font-bold text-base">
                <span>TOTAL</span>
                <span>{formatPKR(receipt.total)}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span>Payment</span>
                <span>{receipt.method === 'cash' ? 'Cash' : 'Card / Online'}</span>
              </div>
              <div className="border-t border-dashed border-black/30 my-2" />
              <p className="text-center text-xs mt-2">Thank you for dining with us!</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <Printer size={18} /> Print
              </button>
              <button
                onClick={resetOrder}
                className="flex-1 bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-3 rounded-xl transition-all active:scale-95"
              >
                New Order
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
