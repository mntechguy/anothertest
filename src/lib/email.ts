const appUrl = process.env.APP_URL || "http://localhost:3000";

export async function sendVerificationEmail(email: string, token: string) {
  const link = `${appUrl}/verify-email?token=${token}`;
  console.log("──────────────────────────────────────");
  console.log("[EMAIL] Verification Email");
  console.log(`  To: ${email}`);
  console.log(`  Subject: Verify your OpenClaw account`);
  console.log(`  Link: ${link}`);
  console.log("──────────────────────────────────────");
}

export async function sendWelcomeEmail(email: string, plan: string) {
  console.log("──────────────────────────────────────");
  console.log("[EMAIL] Welcome Email");
  console.log(`  To: ${email}`);
  console.log(`  Subject: Welcome to OpenClaw (${plan} plan)`);
  console.log(`  Body: Your instance is being provisioned. Log in to your dashboard to get started.`);
  console.log("──────────────────────────────────────");
}

export async function sendPaymentFailedEmail(email: string) {
  console.log("──────────────────────────────────────");
  console.log("[EMAIL] Payment Failed");
  console.log(`  To: ${email}`);
  console.log(`  Subject: Action required — payment failed for your OpenClaw subscription`);
  console.log(`  Body: We were unable to process your latest payment. Please update your payment method.`);
  console.log("──────────────────────────────────────");
}
