import 'server-only';

/**
 * Email delivery through Resend (resend.com), only when configured:
 * RESEND_API_KEY and NEWSLETTER_FROM_EMAIL (a verified sender, e.g. "Wydad AC <newsletter@wydadac.ma>").
 * Without them nothing is sent and callers say so; nothing pretends an email went out.
 */
export const isMailerConfigured = () => !!process.env.RESEND_API_KEY && !!process.env.NEWSLETTER_FROM_EMAIL;

export interface Mail {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** RFC 8058 one-click unsubscribe */
  unsubscribeUrl?: string;
}

export async function sendMail(mail: Mail): Promise<boolean> {
  if (!isMailerConfigured()) return false;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.NEWSLETTER_FROM_EMAIL,
      to: [mail.to],
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      headers: mail.unsubscribeUrl ? { 'List-Unsubscribe': `<${mail.unsubscribeUrl}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' } : undefined,
    }),
    cache: 'no-store',
  });
  if (!res.ok) console.warn('[newsletter] email not sent:', res.status, (await res.text()).slice(0, 200));
  return res.ok;
}

const COPY = {
  fr: { subject: 'Confirmez votre inscription à la newsletter du Wydad', hello: 'Bienvenue dans la famille !', body: 'Confirmez votre adresse pour recevoir la newsletter du Wydad Athletic Club.', cta: 'Confirmer mon inscription', ignore: 'Si vous n’êtes pas à l’origine de cette demande, ignorez simplement cet e-mail.', unsub: 'Se désinscrire' },
  en: { subject: 'Confirm your Wydad newsletter subscription', hello: 'Welcome to the family!', body: 'Confirm your address to receive the Wydad Athletic Club newsletter.', cta: 'Confirm my subscription', ignore: 'If you didn’t ask for this, simply ignore this email.', unsub: 'Unsubscribe' },
  ar: { subject: 'أكد اشتراكك في النشرة البريدية للوداد', hello: 'مرحبا بك في العائلة!', body: 'أكد عنوانك لتلقي النشرة البريدية للوداد الرياضي.', cta: 'تأكيد الاشتراك', ignore: 'إذا لم تطلب ذلك، تجاهل هذه الرسالة.', unsub: 'إلغاء الاشتراك' },
} as const;

/** Double opt-in email, in the subscriber's language */
export function confirmationMail(to: string, locale: 'ar' | 'fr' | 'en', confirmUrl: string, unsubscribeUrl: string): Mail {
  const c = COPY[locale];
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  return {
    to,
    subject: c.subject,
    unsubscribeUrl,
    text: `${c.hello}\n\n${c.body}\n${confirmUrl}\n\n${c.ignore}\n${c.unsub}: ${unsubscribeUrl}`,
    html: `<!doctype html><html lang="${locale}" dir="${dir}"><body style="margin:0;background:#f6f6f6;font-family:Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff">
<tr><td style="background:#d21f26;padding:24px 32px;color:#fff;font-size:22px;font-weight:bold;letter-spacing:1px">WYDAD ATHLETIC CLUB</td></tr>
<tr><td style="padding:32px;color:#171719;font-size:16px;line-height:1.5">
<p style="font-size:22px;font-weight:bold;margin:0 0 12px">${c.hello}</p><p style="margin:0 0 24px">${c.body}</p>
<a href="${confirmUrl}" style="display:inline-block;background:#d21f26;color:#fff;text-decoration:none;font-weight:bold;padding:14px 24px">${c.cta}</a>
<p style="margin:24px 0 0;color:#6b6b6b;font-size:13px">${c.ignore}</p></td></tr>
<tr><td style="padding:16px 32px;border-top:1px solid #eee;font-size:12px;color:#6b6b6b"><a href="${unsubscribeUrl}" style="color:#6b6b6b">${c.unsub}</a> · DIMA WYDAD</td></tr>
</table></td></tr></table></body></html>`,
  };
}
