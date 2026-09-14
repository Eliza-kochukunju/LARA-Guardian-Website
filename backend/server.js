const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
app.get("/", (req, res) => {
    res.send("LARA backend is running ✦");
});
app.post("/api/send-email", async (req, res) => {
    try {
        const {
            name,
            age,
            location,
            email,
            concern
        } = req.body;
        if (
            !name ||
            !age ||
            !location ||
            !email ||
            !concern
        ) {
            return res.status(400).json({
                success: false,
                message: "Missing required information"
            });
        }
        const submittedAt = new Date().toLocaleString("en-IN", {
            dateStyle: "full",
            timeStyle: "medium"
        });
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.RECEIVER_EMAIL,
            subject: "New LARA Support Conversation",
            text: `
LARA — New Conversation
Visitor Details
Name: ${name}
Age: ${age}
Location: ${location}
Email: ${email}
Date & Time:
${submittedAt}
What they shared:
${concern}
LARA — Guardian of Second Chances
            `
        };
        await transporter.sendMail(mailOptions);
        res.status(200).json({
            success: true,
            message: "Email sent successfully ✦"
        });
    } catch (error) {
        console.error("Email error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to send email"
        });
    }
});
app.listen(PORT, "0.0.0.0", () => {
    console.log(
        `LARA backend running on port ${PORT}`
    );
});