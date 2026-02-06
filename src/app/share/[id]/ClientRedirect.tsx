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
      background: '#111',
      color: '#fff',
      fontFamily: 'sans-serif'
    }}>
      <p style={{ marginBottom: '1rem' }}>Redirecting to CarCupid...</p>
      <Link href="/" style={{ color: 'rgb(230, 214, 180)', textDecoration: 'underline' }}>
        Click here if you are not redirected
      </Link>
    </div>
  );
}
