import { Resend } from "resend";

const sendEmail = async ({
  email,
  subject,
  html,
}) => {
  const resend = new Resend(process.env.REACT_APP_RESEND_EMAIL);

  const res = await resend.emails.send({
    from: 'Gia sư trực tuyến <onboarding@resend.dev>',
    to: [email],
    subject: subject,
    html: html,
  });

  console.log('sendEmail', res);
}

export default sendEmail;