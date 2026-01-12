// app/api/otp/send/route.js (or .ts)
import { Resend } from "resend";

// ✅ LAZY INITIALIZATION - Only create when API key exists
let resend: Resend | null = null;

function getResend() {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

export async function sendOTP(email: string, otp: string) {
  console.log("🔍 Resend Debug - Starting email send...");
  console.log("📧 To:", email);
  console.log("🔢 OTP:", otp);

  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY environment variable is not configured");
  }

  const resendInstance = getResend();
  if (!resendInstance) {
    throw new Error("Resend client could not be initialized");
  }

  try {
    const { data, error } = await resendInstance.emails.send({
      from: "Ink <no-reply@ridit.space>",
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
