"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

const STORAGE_KEY = "shaz_order_placed";

interface OrderData {
  orderNumber: string;
  placedAt: string;
}

export default function OrderConfirmModal() {
  const pathname = usePathname();
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [order, setOrder] = useState<OrderData | null>(null);

  useEffect(() => {
    const op = sessionStorage.getItem(STORAGE_KEY);
    if (op) {
      sessionStorage.removeItem(STORAGE_KEY);
      setOrder({
        orderNumber: op,
        placedAt: new Date().toLocaleString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }),
      });
      setVisible(true);
    }
  }, [pathname]);

  const handleClose = () => {
    setVisible(false);
  };

  if (!visible || !order) return null;

  return (
    <>
      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes modalScaleIn {
          from { opacity: 0; transform: scale(0.92) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .modal-backdrop { animation: modalFadeIn 0.3s ease both; }
        .modal-card     { animation: modalScaleIn 0.4s cubic-bezier(0.16,1,0.3,1) both; }

        @keyframes confettiFloat {
          0%   { transform: translateY(0) rotate(0deg);   opacity: 0.8; }
          100% { transform: translateY(-18px) rotate(30deg); opacity: 0; }
        }
        .confetti-dot { animation: confettiFloat linear infinite; }
      `}</style>

      {/* Backdrop */}
      <div
        className="modal-backdrop fixed inset-0 z-[9998] bg-black/75 backdrop-blur-sm flex items-center justify-center px-4"
        onClick={handleClose}
      >
        {/* Modal Card */}
        <div
          className="modal-card relative w-full max-w-md bg-[#111] border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Confetti dots */}
          {confettiDots.map((dot, i) => (
            <span
              key={i}
              className="confetti-dot absolute rounded-full pointer-events-none"
              style={{
                width: dot.size,
                height: dot.size,
                background: dot.color,
                left: dot.left,
                top: dot.top,
                animationDuration: dot.duration,
                animationDelay: dot.delay,
                opacity: 0.7,
              }}
            />
          ))}

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center text-center px-8 pt-12 pb-10">
            {/* Green check circle */}
            <div className="w-20 h-20 rounded-full border-4 border-emerald-500 bg-emerald-950 flex items-center justify-center mb-6 shadow-[0_0_32px_rgba(16,185,129,0.3)]">
              <svg
                className="w-10 h-10 text-emerald-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            {/* Title */}
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-3">
              Order Confirmed!
            </h2>

            {/* Subtitle */}
            <p className="text-sm text-neutral-400 leading-relaxed max-w-xs">
              Thank you for your order. We&apos;ve received your order and will begin processing it soon.
            </p>

            {/* Order number badge */}
            <div className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 border border-amber-600/60 bg-amber-950/40 rounded-xl">
              <svg className="w-4 h-4 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="font-mono text-sm font-semibold text-amber-400">
                Order #{order.orderNumber}
              </span>
            </div>

            {/* Date */}
            <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-neutral-500">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Placed on {order.placedAt}
            </div>

            {/* Continue Shopping button */}
            <button
              type="button"
              onClick={handleClose}
              className="mt-8 w-full py-3.5 bg-white hover:bg-[#f0d5c8] text-black font-semibold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-lg"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// Confetti dot data
const confettiDots = [
  { size: "6px", color: "#f59e0b", left: "8%",  top: "18%", duration: "3.2s", delay: "0s" },
  { size: "4px", color: "#10b981", left: "18%", top: "70%", duration: "2.8s", delay: "0.4s" },
  { size: "5px", color: "#f59e0b", left: "80%", top: "15%", duration: "3.5s", delay: "0.2s" },
  { size: "4px", color: "#6366f1", left: "88%", top: "65%", duration: "2.6s", delay: "0.8s" },
  { size: "6px", color: "#10b981", left: "30%", top: "12%", duration: "3.0s", delay: "0.6s" },
  { size: "3px", color: "#f59e0b", left: "70%", top: "80%", duration: "2.9s", delay: "0.1s" },
  { size: "5px", color: "#6366f1", left: "55%", top: "8%",  duration: "3.3s", delay: "0.5s" },
  { size: "4px", color: "#10b981", left: "92%", top: "30%", duration: "2.7s", delay: "0.9s" },
  { size: "3px", color: "#f59e0b", left: "5%",  top: "50%", duration: "3.1s", delay: "0.3s" },
  { size: "5px", color: "#6366f1", left: "45%", top: "85%", duration: "2.8s", delay: "0.7s" },
];
