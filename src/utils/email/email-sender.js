import nodemailer from "nodemailer";
import PDFDocument from "pdfkit"
import fs from "fs";
import serverDown from "../templates/server_down_template.js";
import verificationTemplate from "../templates/verification-template.js";
import welcomeTemplate from "../templates/welcome-template.js";
import fgPasswordTemplate from "../templates/FgPassword-template.js";
import resetPasswordTemplate from "../templates/resetPassword-template.js";
import dotenv from "dotenv"
dotenv.config();

// send a welcome message
const sendWelcomeEmail = async (email, firstName) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "getsavey.com",
      host: "getsavey.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_NODEMAILER,
        pass: process.env.PASSWORD_NODEMAILER,
      },
    });

    const mailOptions = {
      from: "support@getsavey.com",
      to: email,
      subject: "Welcome to Savey!",
      html: welcomeTemplate(firstName),
    };
    const info = await transporter.sendMail(mailOptions);
    console.log(
      `${new Date().toLocaleString()} - Email sent successfully:` +
        info.response
    );
  } catch (error) {
    console.log("Email error:", error.message);
    throw new error("Couldn't send Mail.");
  }
};

// sending verification otp
const sendVerificationEmail = async (email, newOtp, capitalizeFirstLetter) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "getsavey.com",
      host: "getsavey.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_NODEMAILER,
        pass: process.env.PASSWORD_NODEMAILER,
      },
    });

    const mailOptions = {
      from: "support@getsavey.com",
      to: email,
      subject: "Verification OTP",
      html: verificationTemplate(newOtp, capitalizeFirstLetter),
    };
    const info = await transporter.sendMail(mailOptions);
    console.log(
      `${new Date().toLocaleString()} - Email sent successfully:` +
        info.response
    );
  } catch (error) {
    console.log("Email error:", error.message);
    throw new error("Couldn't send verification OTP.");
  }
};
// sending mail for break in server
const sendServerFailure = async (email) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "getsavey.com",
      host: "getsavey.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_NODEMAILER,
        pass: process.env.PASSWORD_NODEMAILER,
      },
    });

    const mailOptions = {
      from: "support@getsavey.com",
      to: email,
      subject: "SERVER IS DOWN",
      html: serverDown(),
    };
    const info = await transporter.sendMail(mailOptions);
    console.log(
      `${new Date().toLocaleString()} - Email sent successfully:` +
        info.response
    );
  } catch (error) {
    console.log("Email error:", error.message);
    throw new error("Couldn't send Mail.");
  }
};

// sending otp as token
const sendFgPasswordOtp = async (email, OTP) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "getsavey.com",
      host: "getsavey.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_NODEMAILER,
        pass: process.env.PASSWORD_NODEMAILER,
      },
    });

    const mailOptions = {
      from: "support@getsavey.com",
      to: email,
      subject: "Forget Password OTP Email",
      html: fgPasswordTemplate(OTP),
    };
    const info = await transporter.sendMail(mailOptions);
    console.log(
      `${new Date().toLocaleString()} - Email sent successfully:` +
        info.response
    );
  } catch (error) {
    console.log("Email error:", error.message);
    throw new error("Couldn't send the Forgot Password.");
  }
};
// sending a reset password
const sendResetPassword = async (email, firstName) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "getsavey.com",
      host: "getsavey.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_NODEMAILER,
        pass: process.env.PASSWORD_NODEMAILER,
      },
    });

    const mailOptions = {
      from: "support@getsavey.com",
      to: email,
      subject: `Password Reset Successful`,
      html: resetPasswordTemplate(firstName),
    };
    const info = await transporter.sendMail(mailOptions);
    console.log(
      `${new Date().toLocaleString()} - Email sent successfully:` +
        info.response
    );
  } catch (error) {
    console.log("Email error:", error.message);
    throw new error("Couldn't send Reset Password .");
  }
};

const sendBudgetNotificationEmail = async (email) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "getsavey.com",
      host: "getsavey.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_NODEMAILER,
        pass: process.env.PASSWORD_NODEMAILER,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_NODEMAILER,
      to: email,
      subject: "Budget Notification",
      html: "<p>80% of your budget has been spent.</p>",
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(
      `${new Date().toLocaleString()} - Email sent successfully: ` +
        info.response
    );
  } catch (error) {
    console.log("Email error:", error.message);
    throw new Error("Couldn't send budget notification email.");
  }
};
// const sendPdfMail = async (email, filePath) => {
//   try {
//     const transporter = nodemailer.createTransport({
//       service: "getsavey.com",
//       host: "getsavey.com",
//       port: 465,
//       secure: true,
//       auth: {
//         user: process.env.EMAIL_NODEMAILER,
//         pass: process.env.PASSWORD_NODEMAILER,
//       },
//     });

//     const mailOptions = {
//       from: process.env.EMAIL_NODEMAILER,
//       to: email,
//       subject: "Notifications PDF",
//       text: "Please find the attached PDF with your notifications.",
//       attachments: [
//         {
//           filename: "notifications.pdf",
//           path: filePath,
//         },
//       ],

//     };

//     const info = await transporter.sendMail(mailOptions);
//     console.log(
//       `${new Date().toLocaleString()} - Email sent successfully: ` +
//         info.response
//     );
//   } catch (error) {
//     console.log("Email error:", error.message);
//     throw new Error("Couldn't send budget notification email.");
//   }
// };


const sendPDFToUserEmail = (transactions, userEmail) => {
  const doc = new PDFDocument({ size: 'A4' });
  const pdfFilePath = 'statements_of_account.pdf';

  doc.pipe(fs.createWriteStream(pdfFilePath));

  // Set font
  doc.font('Helvetica-Bold');

  // Add content to the PDF
  doc.fontSize(24).fillColor('#00FF00').text('Your Savey App Account Statement', { align: 'center' });
  doc.moveDown(1.5);

  // Create table header
  doc.fillColor('#00FF00').fontSize(16);
  doc.text('Transaction Date', 50, doc.y, { width: 150, align: 'left' });
  doc.text('Transaction Type', 200, doc.y, { width: 150, align: 'left' });
  doc.text('Amount', 350, doc.y, { width: 150, align: 'right' });
  doc.moveDown();

  // Draw a line under the header
  doc.strokeColor('#00FF00').lineWidth(2).moveTo(50, doc.y).lineTo(500, doc.y).stroke();
  doc.moveDown();

  // Fill the table with transactions
  doc.fillColor('black').fontSize(12);
  transactions.forEach((transaction) => {
    doc.text(transaction.createdAt.toDateString(), 50, doc.y, { width: 150, align: 'left' });
    doc.text(transaction.transactionType, 200, doc.y, { width: 150, align: 'left' });
    doc.text(`$${transaction.amount.toFixed(2)}`, 500, doc.y, { width: 100, align: 'right' });
    doc.moveDown();
  });

  doc.end();

  // Send the email with the PDF attachment
  const transporter = nodemailer.createTransport({
    service: "getsavey.com",
    host: "getsavey.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_NODEMAILER,
      pass: process.env.PASSWORD_NODEMAILER,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_NODEMAILER,
    to: userEmail,
    subject: 'Your Savey App Account Statement',
    text: 'Please find your Savey App Account Statement attached.',
    html: '<p>Please find your Savey App Account Statement attached.</p>',
    attachments: [
      {
        filename: 'statements_of_account.pdf',
        path: pdfFilePath,
        contentType: 'application/pdf',
      },
    ],
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error('Error sending email:', err);
    } else {
      console.log('Email sent:', info.response);
      // Delete the temporary PDF file after sending the email
      fs.unlinkSync(pdfFilePath);
    }
  });
};




export {
  sendVerificationEmail,
  sendFgPasswordOtp,
  sendResetPassword,
  sendServerFailure,
  sendWelcomeEmail,
  sendBudgetNotificationEmail,
  sendPDFToUserEmail,
};

const sendMail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: "getsavey.com",
    host: "getsavey.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_NODEMAILER,
      pass: process.env.PASSWORD_NODEMAILER,
    },
  });

  const mailOptions = {
    from: "support@getsavey.com",
    to,
    subject,
    text,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`Email sent: ${info.messageId}`);
};

export { sendMail };
