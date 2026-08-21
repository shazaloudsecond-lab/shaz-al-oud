"use client";

import React from "react";

interface AdminUploadProgressProps {
  progress: number; // 0 to 100
  isUploading: boolean;
  title?: string;
  className?: string;
}

export default function AdminUploadProgress({
  progress,
  isUploading,
  title = "Uploading Media",
  className = "",
}: AdminUploadProgressProps) {
  if (!isUploading) return null;

  const clamped = Math.min(100, Math.max(0, Math.round(progress)));

  return (
    <div
      className={`w-full bg-neutral-950/90 border border-amber-500/30 rounded-xl p-3.5 shadow-lg shadow-amber-950/20 animate-fade-in ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {/* Animated Spinner Icon */}
          <div className="w-4 h-4 rounded-full border-2 border-amber-400/30 border-t-amber-400 animate-spin flex-shrink-0" />
          <span className="text-xs font-medium text-neutral-200 uppercase tracking-wider font-mono">
            {clamped >= 100 ? "Finalizing & Optimizing..." : title}
          </span>
        </div>
        <span className="text-xs font-mono font-bold text-amber-400 tabular-nums">
          {clamped}%
        </span>
      </div>

      {/* Progress Track */}
      <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800 relative">
        {/* Animated Gradient Bar */}
        <div
          className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-300 rounded-full transition-all duration-300 ease-out shadow-[0_0_12px_rgba(245,158,11,0.5)]"
          style={{ width: `${clamped}%` }}
        />
        {/* Shimmer pulse effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-pulse pointer-events-none" />
      </div>
    </div>
  );
}
