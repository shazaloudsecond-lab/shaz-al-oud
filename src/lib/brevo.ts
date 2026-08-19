export interface SendEmailParams {
  to: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

export async function sendBrevoEmail({ to, subject, htmlContent, textContent }: SendEmailParams) {
  const apiKey = process.env.BREVO_API_KEY || process.env.SENDINBLUE_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || "no-reply@shazaloud.com";
  const senderName = process.env.BREVO_SENDER_NAME || "Shaz Al Oud";

  if (!apiKey) {
    console.warn("⚠️ BREVO_API_KEY is not configured in environment variables. Email content logged below:");
    console.log(`[Brevo Email Mock] To: ${to} | Subject: ${subject}`);
    return { success: true, simulated: true };
  }

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: to }],
        subject,
        htmlContent,
        textContent: textContent || subject,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("Brevo API Error:", data);
      throw new Error(data.message || data.error || "Failed to send email via Brevo.");
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("sendBrevoEmail Error:", err);
    throw err;
  }
}
