'use client';

import { useState, useEffect } from 'react';

export function ClientDate({ dateString }: { dateString: string }) {
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    setFormattedDate(new Date(dateString).toLocaleDateString());
  }, [dateString]);

  if (!formattedDate) {
    // You can return a placeholder or null while waiting for the client to render
    return null;
  }

  return <span>{formattedDate}</span>;
}
