'use client';

import { useEffect, useState } from 'react';

type Props = {
  to: string;
  subject: string;
  body: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
};

export function MailtoLink({ to, subject, body, children, className, onClick }: Props) {
  const [href, setHref] = useState(`mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);

  useEffect(() => {
    const dynamicBody = `${body}\nUser-Agent: ${navigator.userAgent}\nURL: ${window.location.href}`;
    setHref(`mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(dynamicBody)}`);
  }, [to, subject, body]);

  return (
    <a href={href} className={className} onClick={onClick} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

