import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Convert `import.meta.url` to file path (works in ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to load HTML email template
const loadEmailTemplate = () => {
    const templatePath = path.join(__dirname, '../templates/transactionEmailTemplate.html');
    return fs.readFileSync(templatePath, 'utf8');
};

// Email sending function
export async function sendEmail(receiverEmail, userName, transactionType, amount, newBalance, transactionId) {
    let emailTemplate = loadEmailTemplate();

    // Replace placeholders with dynamic data
    emailTemplate = emailTemplate.replace("{{userName}}", userName)
        .replace("{{transactionType}}", transactionType)
        .replace("{{amount}}", `₦${amount}`)
        .replace("{{date}}", new Date().toLocaleString())
        .replace("{{newBalance}}", `₦${newBalance}`)
        .replace("{{transactionId}}", transactionId)
       // .replace("{{dashboardLink}}", "https://yourbank.com/dashboard"); 

    try {
        const transporter = nodemailer.createTransport({
            host: 'pop.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: 'jinyjagz@gmail.com',
                pass: "rastgicksmgsihql"
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const info = await transporter.sendMail({
            from: "Yunus <jinyjagz@gmail.com>",
            subject: `Your ${transactionType} was Successful`,
            html: emailTemplate,
            to: receiverEmail,
        });

        console.log("Email sent successfully!");
        return info.messageId; // Return message ID instead of `getTestMessageUrl`
        
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Error sending email");
    }
}