import React from 'react';

/**
 * 家族标识图（置于 frontend/public/clan-logo.png）
 */
export default function ClanLogo({
  className = '',
  sizeClass = 'w-12 h-12',
  alt = '紫川家族',
  ...imgProps
}) {
  const src = `${process.env.PUBLIC_URL || ''}/clan-logo.png`;
  return (
    <img
      src={src}
      alt={alt}
      className={`rounded-full object-cover shrink-0 ring-1 ring-black/10 ${sizeClass} ${className}`.trim()}
      {...imgProps}
    />
  );
}
