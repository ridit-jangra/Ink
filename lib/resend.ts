import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendOTP(email: string, otp: string) {
  console.log("🔍 Resend Debug - Starting email send...");
  console.log("📧 To:", email);
  console.log("🔢 OTP:", otp);
  console.log(
    "🔑 API Key exists:",
    !!process.env.RESEND_API_KEY ? "YES" : "NO"
  );
  console.log("📨 From domain verified:", "ink.ridit.space"); // TODO: check status

  try {
    const { data, error } = await resend.emails.send({
      from: "Ink <no-reply@ink.ridit.space>",
      to: [email],
      subject: "Your Ink Verification Code",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to Ink! 🎨</h2>
          <p>Your verification code is: <strong>${otp}</strong></p>
          <p>This code expires in 10 minutes.</p>
        </div>
      `,
    });

    if (error) {
      console.error("❌ Resend RAW ERROR:", JSON.stringify(error, null, 2));

      throw new Error(
        `Resend error: ${error.message || JSON.stringify(error)}`
      );
    }

    console.log("✅ Email sent successfully:", data);
    return data;
  } catch (error: any) {
    console.error("💥 Full error:", error);
    throw new Error(`Email failed: ${error.message}`);
  }
}
