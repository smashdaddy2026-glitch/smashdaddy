import { ArrowRight, Lock, ClipboardList } from 'lucide-react';
import Logo from '../components/Logo';

interface LandingProps {
  onAdmin: () => void;
  onOrder: () => void;
}

export default function Landing({ onAdmin, onOrder }: LandingProps) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white relative overflow-hidden flex items-center justify-center p-4">
      {/* glow */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-yellow-400/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-20 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl" />

      <div className="relative w-full max-w-lg text-center">
        <div className="flex flex-col items-center mb-8 animate-[fadeIn_0.6s_ease-out]">
          <Logo size={120} className="mb-5 animate-[bounce_3s_ease-in-out_infinite]" />
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight">
            SMASH <span className="text-yellow-400">DADDY</span>
          </h1>
          <p className="text-zinc-500 mt-2">Restaurant POS System</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-[scaleIn_0.5s_cubic-bezier(0.16,1,0.3,1)]">
          <button
            onClick={onOrder}
            className="group bg-yellow-400 hover:bg-yellow-300 text-black rounded-2xl p-6 text-left transition-all hover:scale-[1.03] active:scale-95 hover:shadow-2xl hover:shadow-yellow-400/30"
          >
            <ClipboardList className="mb-3" size={32} />
            <h2 className="text-xl font-black">Take Order</h2>
            <p className="text-black/70 text-sm mt-1">For waiters to place new orders</p>
            <div className="flex items-center gap-1 mt-3 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              Open <ArrowRight size={16} />
            </div>
          </button>

          <button
            onClick={onAdmin}
            className="group bg-zinc-900 border border-zinc-800 hover:border-yellow-400/40 text-white rounded-2xl p-6 text-left transition-all hover:scale-[1.03] active:scale-95"
          >
            <Lock className="mb-3 text-yellow-400" size={32} />
            <h2 className="text-xl font-black">Admin Portal</h2>
            <p className="text-zinc-500 text-sm mt-1">Manage menu & view analytics</p>
            <div className="flex items-center gap-1 mt-3 text-sm font-bold text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity">
              Login <ArrowRight size={16} />
            </div>
          </button>
        </div>

        <p className="text-zinc-600 text-xs mt-8">Smash Daddy POS — powered by Bilal Yasir</p>
      </div>
    </div>
  );
}
