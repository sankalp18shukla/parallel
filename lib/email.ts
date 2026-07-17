import { Resend } from "resend";

const EMAILS_ENABLED = true; // demo record hone ke baad false kar dena

function getResendClient() {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("RESEND_API_KEY missing — email will not send.");
    return null;
  }
  return new Resend(key);
}

export async function sendConnectFoundEmail(toEmail: string) {
  if (!EMAILS_ENABLED) {
    console.log(`[DEMO] Would send "connect found" email to ${toEmail}`);
    return;
  }
  const resend = getResendClient();
  if (!resend) return;

  await resend.emails.send({
    from: "Parallel <onboarding@resend.dev>",
    to: toEmail,
    subject: "Someone interesting found you",
    html: `<p>We found a new connect for you on Parallel. Go check the Connects tab and pick a time.</p>`,
  });
}

export async function sendMeetingConfirmedEmail(toEmail: string, when: string, meetLink: string) {
  if (!EMAILS_ENABLED) {
    console.log(`[DEMO] Would send "meeting confirmed" email to ${toEmail}`);
    return;
  }
  const resend = getResendClient();
  if (!resend) return;

  await resend.emails.send({
    from: "Parallel <onboarding@resend.dev>",
    to: toEmail,
    subject: "Your meeting is locked in",
    html: `<p>Confirmed for ${when}.</p><p>Join here: <a href="${meetLink}">${meetLink}</a></p>`,
  });
}