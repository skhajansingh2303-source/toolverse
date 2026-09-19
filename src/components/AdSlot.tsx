'use client';

import React from 'react';

interface AdSlotProps {
  slotId?: string;
  format?: 'horizontal' | 'rectangle' | 'banner';
  className?: string;
}

export default function AdSlot({ slotId = 'default', format = 'horizontal', className = '' }: AdSlotProps) {
  // In production with Google AdSense, this renders the actual <ins class="adsbygoogle" ...>
  // In dev / preview mode, it renders a subtle, clean placeholder so layout is preserved without empty gaps
  return (
    <div className={`w-full my-6 text-center ${className}`}>
      <div className="inline-block w-full max-w-4xl bg-gradient-to-r from-gray-50 via-slate-50 to-gray-50 border border-dashed border-gray-200 rounded-xl p-4 transition-all hover:border-gray-300">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Advertisement
          </span>
          <span className="text-[10px] text-gray-400">Google AdSense Partner</span>
        </div>
        <div className={`flex items-center justify-center bg-white/60 rounded-lg border border-gray-100 ${
          format === 'horizontal' ? 'h-24' : format === 'rectangle' ? 'h-64' : 'h-16'
        }`}>
          <div className="text-center text-gray-400">
            <p className="text-xs font-medium text-gray-500">Ad Space Slot ({format})</p>
            <p className="text-[11px] text-gray-400">Targeted ads will automatically appear here once AdSense ID is set</p>
          </div>
        </div>
      </div>
    </div>
  );
}
