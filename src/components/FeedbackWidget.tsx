'use client';

import React, { useState } from 'react';

export default function FeedbackWidget({ toolName }: { toolName?: string }) {
  const [feedback, setFeedback] = useState<'yes' | 'no' | null>(null);

  return (
    <div className="my-8 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-2xs text-center transition-colors">
      {feedback ? (
        <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-fade-in-up">
          <span className="text-base">🎉</span>
          <span>Thank you for your feedback! It helps us keep improving {toolName || 'our tools'}.</span>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-xs">
          <span className="font-semibold text-gray-700 dark:text-slate-300">
            Was this {toolName ? `"${toolName}"` : ''} tool helpful to you?
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setFeedback('yes');
                window.dispatchEvent(new CustomEvent('toolsverse-toast', { detail: { message: '👍 Thanks for your positive feedback!' } }));
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-gray-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-400 border border-gray-200 dark:border-slate-700 font-bold transition-all active:scale-95"
            >
              <span>👍</span>
              <span>Yes, worked great</span>
            </button>
            <button
              onClick={() => {
                setFeedback('no');
                window.dispatchEvent(new CustomEvent('toolsverse-toast', { detail: { message: 'We appreciate the feedback and will improve!' } }));
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-gray-700 dark:text-slate-200 hover:text-rose-700 dark:hover:text-rose-400 border border-gray-200 dark:border-slate-700 font-bold transition-all active:scale-95"
            >
              <span>👎</span>
              <span>Needs improvement</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
