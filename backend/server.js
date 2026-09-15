const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { google } = require("googleapis");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    "http://localhost"
);

oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN
});

const gmail = google.gmail({
    version: "v1",
    auth: oauth2Client
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

        if (!name || !age || !location || !email || !concern) {
            return res.status(400).json({
                success: false,
                message: "Missing required information"
            });
        }

        const submittedAt = new Date().toLocaleString("en-IN", {
            dateStyle: "full",
            timeStyle: "medium"
        });

        const subject = "New LARA Support Conversation";

        const message = [
            `From: ${process.env.GMAIL_USER}`,
            `To: ${process.env.GMAIL_USER}`,
            `Subject: ${subject}`,
            "Content-Type: text/plain; charset=utf-8",
            "",
            "LARA — New Conversation",
            "",
            "VISITOR DETAILS",
            `Name: ${name}`,
            `Age: ${age}`,
            `Location: ${location}`,
            `Email: ${email}`,
            `Date & Time: ${submittedAt}`,
            "",
            "WHAT THEY SHARED",
            concern,
            "",
            "LARA — Guardian of Second Chances"
        ].join("\n");

        const encodedMessage = Buffer.from(message)
            .toString("base64")
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "");

        const result = await gmail.users.messages.send({
            userId: "me",
            requestBody: {
                raw: encodedMessage
            }
        });

        console.log("LARA email sent successfully ✦");
        console.log("Gmail message ID:", result.data.id);

        res.status(200).json({
            success: true,
            message: "Email sent successfully ✦"
        });

    } catch (error) {
        console.error(
            "GMAIL ERROR:",
            error.response?.data || error.message || error
        );

        res.status(500).json({
            success: false,
            message: "Failed to send email"
        });
    }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`LARA backend running on port ${PORT}`);
});