'use client';
import Header from './Header';
import { usePathname } from 'next/navigation';

export default function HeaderVisibility() {
  const pathname = usePathname();
  const hide = pathname?.startsWith('/quiz');
  if (hide) return null;
  return <Header />;
}

