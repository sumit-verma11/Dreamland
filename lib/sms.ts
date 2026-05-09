import twilio from "twilio";

let client: ReturnType<typeof twilio> | null = null;

function getClient() {
  if (client) return client;
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return null;
  client = twilio(sid, token);
  return client;
}

export async function sendSms(to: string, body: string) {
  const c = getClient();
  const from = process.env.TWILIO_FROM_NUMBER;

  if (!c || !from) {
    // Dev fallback: log to console so the OTP flow is testable without a paid SMS account.
    console.log(`[sms:dev] to=${to} body=${body}`);
    return { dev: true as const };
  }

  await c.messages.create({ to, from, body });
  return { dev: false as const };
}
