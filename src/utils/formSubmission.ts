
export interface FormSubmissionResponse {
  ok: boolean;
  error?: string;
}

/**
 * Submits form data to the specified endpoint using fetch.
 * @param endpoint The URL to submit the form to.
 * @param formData The FormData object containing form fields.
 * @returns A promise that resolves to the response status.
 */
export async function submitForm(
  endpoint: string,
  formData: FormData
): Promise<FormSubmissionResponse> {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      return { ok: true };
    } else {
      // Try to get error message from response
      const data = await response.json().catch(() => ({}));
      return { 
        ok: false, 
        error: data.error || 'There was an error sending your message. Please try again later.' 
      };
    }
  } catch (error) {
    console.error('Failed to submit form:', error);
    return { 
      ok: false, 
      error: 'There was an error sending your message. Please try again later.' 
    };
  }
}
