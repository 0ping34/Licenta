const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'sandbox.smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: '51ce8c7f193035',
    pass: '6ccd85052a29f5'
  }
});

const sendConfirmationEmail = (to, username, userId) => {
  const confirmationLink = `https://localhost:5173/confirm?userId=${userId}`;
  const mailOptions = {
    from: 'noreply@example.com',
    to,
    subject: 'Confirm your email',
    html: `<h1>Welcome ${username}</h1>
           <p>Please confirm your email by clicking the link below:</p>
           <a href="${confirmationLink}">Confirm Email</a>`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

const sendTicketCreationEmail = (to, username, ticketDetails) => {
  const mailOptions = {
    from: 'noreply@example.com',
    to,
    subject: 'Ticket Created Successfully',
    html: `<h1>Hi ${username},</h1>
           <p>Your ticket has been created successfully. Here are the details:</p>
           <p>${ticketDetails}</p>`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

const sendRefundEmail = (to, refundDetails) => {
  console.log('Sending refund email to:', to); // Log the recipient email
  const mailOptions = {
    from: 'noreply@example.com',
    to,
    subject: 'Refund Processed Successfully',
    html: `<h1>Hi</h1>
           <p>Your refund has been processed successfully. Here are the details:</p>
           <p>${refundDetails}</p>`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

const sendWithdrawEmail = (to, withdrawDetails) => {
  const mailOptions = {
    from: 'noreply@example.com',
    to,
    subject: 'Patout Processed Successfully',
    html: `<h1>Hi</h1>
           <p>Your payout has been processed successfully. Here are the details:</p>
           <p>${withdrawDetails}</p>`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

module.exports = { sendConfirmationEmail, sendTicketCreationEmail, sendRefundEmail, sendWithdrawEmail };
