import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendConnectFoundEmail(toEmail: string) {
  await resend.emails.send({
    from: "Parallel <onboarding@resend.dev>",
    to: toEmail,
    subject: "Someone interesting found you",
    html: `<p>We found a new connect for you on Parallel. Go check the Connects tab and pick a time.</p>`,
  });
}

export async function sendMeetingConfirmedEmail(toEmail: string, when: string, meetLink: string) {
  await resend.emails.send({
    from: "Parallel <onboarding@resend.dev>",
    to: toEmail,
    subject: "Your meeting is locked in",
    html: `<p>Confirmed for ${when}.</p><p>Join here: <a href="${meetLink}">${meetLink}</a></p>`,
  });
}