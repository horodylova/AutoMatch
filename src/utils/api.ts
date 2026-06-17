export async function sendResultsToEmail(email: string, results: unknown[]): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const response = await fetch('/api/send-results', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, results }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to send email' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: 'Network error or server unavailable' };
  }
}

export async function sendGarageResultsToEmail(email: string, results: unknown[]): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const response = await fetch('/api/garage/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, results }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to send email' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending garage email:', error);
    return { success: false, error: 'Network error or server unavailable' };
  }
}
