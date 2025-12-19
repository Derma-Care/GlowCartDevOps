import emailjs from 'emailjs-com'

const sendPayoutLockEmail = ({ username, email }) => {
  const templateParams = {
    username,
    email,
    title: 'Payout Access Locked – Security Alert',
    message: `
Hello Team,

The user ${username} attempted to access the payout section and entered incorrect credentials three times.

As a security precaution, their payout access has been locked for 1 hour.

Regards,
NGK Security System
    `,
  }

  emailjs
    .send('service_0mfbdze', 'template_w5up4si', templateParams, 'CBOIAGyBpGzdM93XU')
    .then((res) => {
      // alert(
      //   `Payout access has been locked due to multiple failed login attempts. An email notification has been sent to management. ${email}`,
      // )
      console.log('Lock alert email sent:', res)
    })
    .catch((err) => {
      // alert(err)
      console.error('Email send failed:', err)
    })
}

export default sendPayoutLockEmail
