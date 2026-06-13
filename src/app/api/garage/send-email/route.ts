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

    // Generate HTML content for the Dream Garage email
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const carsHtml = results.map((car: any) => `
      <div style="margin-bottom: 24px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); border: 1px solid #eee;">
        <a href="https://carcupid.fit/cars/${car.id}" style="text-decoration: none; color: inherit; display: block;">
          ${car.image ? `
            <img src="${car.image}" alt="${car.make} ${car.model}" style="width: 100%; height: auto; display: block; border: 0;" />
          ` : ''}
          <div style="padding: 16px;">
            <h3 style="margin: 0 0 8px 0; font-size: 18px; color: #1a1a1a; font-weight: 700;">${car.year} ${car.make} ${car.model}</h3>
            ${car.price ? `<p style="margin: 0 0 12px 0; font-weight: 600; color: #E5483F; font-size: 16px;">${car.price}</p>` : ''}
            ${car.badges && car.badges.length > 0 ? `
              <div style="margin-bottom: 12px;">
                ${car.badges.map((badge: string) => `
                  <span style="display: inline-block; background-color: #1a1a1a; color: #ffffff; padding: 6px 12px; border-radius: 99px; font-size: 12px; font-weight: 600; margin-right: 8px; margin-bottom: 8px;">
                    ${badge}
                  </span>
                `).join('')}
              </div>
            ` : ''}
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
            body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Robinkdo, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; }
            .header { text-align: center; padding: 40px 20px; background-color: #1F1F23; margin: -20px -20px 30px -20px; border-radius: 8px 8px 0 0; }
            .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #888; }
            .btn-primary { display: inline-block; background-color: #E5483F; color: white; padding: 14px 28px; text-decoration: none; border-radius: 99px; font-weight: 600; font-size: 16px; }
            @media only screen and (max-width: 600px) {
              .container { width: 100% !important; padding: 16px !important; }
            }
          </style>
        </head>
        <body>
          <div style="background-color: #f9f9f9; padding: 20px 0;">
            <div class="container">
              <div class="header">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td valign="middle" width="140" align="center" style="padding-right: 20px;">
                      <a href="https://carcupid.fit" style="display: inline-block;">
                        <img src="https://carcupid.fit/cupids/carcupid-keys.png" alt="CarCupid" width="120" style="max-width: 120px; height: auto; border: 0; display: block;" />
                      </a>
                    </td>
                    <td valign="middle" align="left" style="color: #F5F5F7;">
                      <h1 style="color: #F5F5F7; margin: 0 0 8px 0; font-size: 24px; line-height: 1.2; font-weight: 800;">Your Dream Garage Is Ready!</h1>
                      <p style="color: #F5F5F7; margin: 0; font-size: 15px; line-height: 1.5; opacity: 0.9;">You&apos;ve built the perfect garage lineup. Here are your matched cars, parked and ready for your next adventure.</p>
                    </td>
                  </tr>
                </table>
              </div>
              
              <div style="margin-top: 20px;">
                ${carsHtml}
              </div>
              
              <div style="text-align: center; margin-top: 40px; margin-bottom: 20px;">
                <a href="https://carcupid.fit/dream-garage" class="btn-primary" style="color: white;">Build Another Garage</a>
              </div>
              
              <div class="footer">
                <p>You received this email because you saved your Dream Garage results on CarCupid.</p>
                <p>&copy; ${new Date().getFullYear()} CarCupid. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email via Brevo API
    const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: 'CarCupid',
          email: 'noreply@carcupid.fit',
        },
        to: [
          {
            email: email,
          },
        ],
        subject: 'Your Dream Garage Results from CarCupid',
        htmlContent: htmlContent,
      }),
    });

    if (!brevoResponse.ok) {
      const errorData = await brevoResponse.json();
      console.error('Brevo API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to send email via Brevo' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in send-garage-email:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}