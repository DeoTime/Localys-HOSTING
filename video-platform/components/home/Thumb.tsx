'use client';

import { useState } from 'react';

/**
 * Swap-in image slot. Renders `src` when provided & loads; otherwise a flat
 * neutral placeholder showing the first letter of `label` (NO emoji/icons).
 * Drop a real image path into the data's `image` field to replace it.
 */
export function Thumb({
  src,
  label,
  alt,
  className = '',
  imgClassName = 'h-full w-full object-cover',
}: {
  src?: string;
  label: string;
  alt?: string;
  className?: string;
  imgClassName?: string;
}) {
  const [failed, setFailed] = useState(false);
  const showImg = src && !failed;

  return (
    <div className={`flex items-center justify-center overflow-hidden bg-gray-100 dark:bg-gray-800 ${className}`}>
      {showImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt ?? label} className={imgClassName} onError={() => setFailed(true)} />
      ) : (
        <span className="select-none text-2xl font-bold text-black dark:text-white">
          {label.trim().charAt(0).toUpperCase() || '?'}
        </span>
      )}
    </div>
  );
}
