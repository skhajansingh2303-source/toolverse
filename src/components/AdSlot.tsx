'use client';

import React, { useEffect } from 'react';

interface AdSlotProps {
  slotId?: string;
  format?: 'horizontal' | 'rectangle' | 'banner';
  className?: string;
}

export default function AdSlot({
  slotId,
  format = 'horizontal',
  className = '',
}: AdSlotProps) {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  useEffect(() => {
    if (clientId && slotId) {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        // Ignore adsbygoogle push error
      }
    }
  }, [clientId, slotId]);

  // When no AdSense ID is configured (pre-approval / review phase),
  // render null so reviewers see zero dummy ad units or non-functioning placeholders.
  if (!clientId || !slotId) {
    return null;
  }

  return (
    <div className={`w-full my-6 text-center ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={clientId}
        data-ad-slot={slotId}
        data-ad-format={format === 'horizontal' ? 'horizontal' : format === 'rectangle' ? 'rectangle' : 'auto'}
        data-full-width-responsive="true"
      />
    </div>
  );
}
