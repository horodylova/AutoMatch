'use client';

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: Props) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          padding: '24px',
          background: 'var(--kendo-color-app-surface)',
          color: 'var(--kendo-color-on-app-surface)',
          fontFamily: 'var(--kendo-font-family, system-ui, -apple-system, Segoe UI, Roboto, sans-serif)',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 560,
            borderRadius: 16,
            border: '1px solid var(--kendo-color-border)',
            background: 'var(--kendo-color-surface)',
            padding: 20,
            boxShadow: '0 12px 32px rgba(0,0,0,0.35)',
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
            Something went wrong
          </div>
          <div style={{ color: 'var(--kendo-color-subtle)', marginBottom: 16, lineHeight: 1.5 }}>
            Please try again. If the problem persists, refresh the page.
          </div>
          {error?.digest ? (
            <div style={{ color: 'var(--kendo-color-subtle)', fontSize: 12, marginBottom: 16 }}>
              Error ID: {error.digest}
            </div>
          ) : null}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => reset()}
              style={{
                appearance: 'none',
                border: '1px solid var(--kendo-color-border-alt)',
                background: 'var(--kendo-color-primary)',
                color: 'var(--kendo-color-on-primary)',
                borderRadius: 9999,
                padding: '12px 16px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                appearance: 'none',
                border: '1px solid var(--kendo-color-border)',
                background: 'transparent',
                color: 'var(--kendo-color-on-app-surface)',
                borderRadius: 9999,
                padding: '12px 16px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Reload
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

