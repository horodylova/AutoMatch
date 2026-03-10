'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ClientRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the home/quiz page immediately
    router.replace('/');
  }, [router]);

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'var(--kendo-color-app-surface)',
      color: 'var(--kendo-color-on-app-surface)',
      fontFamily: 'sans-serif'
    }}>
      <p style={{ marginBottom: '1rem' }}>Redirecting to CarCupid...</p>
      <Link href="/" style={{ color: 'var(--kendo-color-primary)', textDecoration: 'underline' }}>
        Click here if you are not redirected
      </Link>
    </div>
  );
}
