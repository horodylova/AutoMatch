import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, results } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!results || !Array.isArray(results)) {
      return NextResponse.json(
        { error: 'Results are required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.BREVO_API_KEY;

    if (!apiKey) {
      console.error('BREVO_API_KEY is not defined');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Generate HTML content for the email
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const carsHtml = results.map((car: any) => `
      <div style="margin-bottom: 24px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); border: 1px solid #eee;">
        <a href="https://carcupid.fit/cars/${car.id}" style="text-decoration: none; color: inherit; display: block;">
          ${car.image ? `
            <img src="${car.image}" alt="${car.make} ${car.model}" style="width: 100%; height: auto; display: block; border: 0;" />
          ` : ''}
          <div style="padding: 16px;">
            <h3 style="margin: 0 0 8px 0; font-size: 18px; color: #1a1a1a; font-weight: 700;">${car.year} ${car.make} ${car.model}</h3>
            ${car.price ? `<p style="margin: 0 0 12px 0; font-weight: 600; color: #C9472D; font-size: 16px;">${car.price}</p>` : ''}
            <span style="display: inline-block; background-color: #1a1a1a; color: #ffffff; padding: 8px 16px; border-radius: 99px; font-size: 14px; font-weight: 600;">View Details &rarr;</span>
          </div>
        </a>
      </div>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; }
            .header { text-align: center; padding: 30px 0; border-bottom: 1px solid #eee; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: 800; color: #C9472D; text-decoration: none; letter-spacing: -0.5px; }
            .intro { margin-bottom: 30px; text-align: center; padding: 0 20px; }
            .intro h2 { margin: 0 0 16px 0; color: #1a1a1a; font-size: 24px; }
            .intro p { margin: 0; color: #666; font-size: 16px; }
            .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #888; }
            .btn-primary { display: inline-block; background-color: #C9472D; color: white; padding: 14px 28px; text-decoration: none; border-radius: 99px; font-weight: 600; font-size: 16px; }
            @media only screen and (max-width: 600px) {
              .container { width: 100% !important; padding: 16px !important; }
            }
          </style>
        </head>
        <body>
          <div style="background-color: #f9f9f9; padding: 20px 0;">
            <div class="container">
              <div class="header">
                <a href="https://carcupid.fit" style="display: inline-block;">
                  <img src="https://carcupid.fit/cupids/CarCupid%20Keys%20with%20background.png" alt="CarCupid" width="200" style="max-width: 200px; height: auto; border: 0; display: block;" />
                </a>
              </div>
              
              <div class="intro">
                <h2>Your Matches Are Ready!</h2>
                <p>Based on your quiz answers, we've found these cars that perfectly match your lifestyle and preferences.</p>
              </div>
              
              <div style="margin-top: 20px;">
                ${carsHtml}
              </div>
              
              <div style="text-align: center; margin-top: 40px; margin-bottom: 20px;">
                <a href="https://carcupid.fit" class="btn-primary" style="color: white;">Take Quiz Again</a>
              </div>
              
              <div class="footer">
                <p>You received this email because you saved your results on CarCupid.</p>
                <p>© ${new Date().getFullYear()} CarCupid. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: 'CarCupid',
          email: 'noreply@carcupid.fit'
        },
        to: [
          {
            email: email
          }
        ],
        subject: 'Your CarCupid Matches',
        htmlContent: htmlContent
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Brevo API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to send email', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, messageId: data.messageId });

  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
