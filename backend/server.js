```js
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
            "MIME-Version: 1.0",
            "Content-Type: text/plain; charset=UTF-8",
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
        ].join("\r\n");

        const encodedMessage = Buffer.from(message)
            .toString("base64")
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "");

        console.log("Sending LARA email...");
        console.log("Authenticated Gmail:", process.env.GMAIL_USER);
        console.log("Visitor email:", email);

        const result = await gmail.users.messages.send({
            userId: "me",
            requestBody: {
                raw: encodedMessage
            }
        });

        const messageId = result.data.id;

        console.log("Gmail API response:");
        console.log("Message ID:", messageId);
        console.log("Thread ID:", result.data.threadId);
        console.log("Labels:", result.data.labelIds);

        if (!messageId) {
            throw new Error("Gmail did not return a message ID.");
        }

        const verifyMessage = await gmail.users.messages.get({
            userId: "me",
            id: messageId,
            format: "metadata",
            metadataHeaders: [
                "From",
                "To",
                "Subject"
            ]
        });

        console.log("EMAIL VERIFIED IN GMAIL ✦");
        console.log("Verified message ID:", verifyMessage.data.id);
        console.log("Verified labels:", verifyMessage.data.labelIds);

        res.status(200).json({
            success: true,
            message: "Email sent successfully ✦",
            gmailMessageId: messageId,
            labels: verifyMessage.data.labelIds
        });

    } catch (error) {
        const gmailError = error.response?.data || {};

        const errorMessage =
            gmailError.error?.message ||
            gmailError.message ||
            error.message ||
            "Unknown Gmail error";

        console.error("========== GMAIL ERROR ==========");
        console.error("Status:", error.response?.status);
        console.error("Message:", errorMessage);
        console.error("Full error:", gmailError);
        console.error("=================================");

        res.status(500).json({
            success: false,
            message: errorMessage
        });
    }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`LARA backend running on port ${PORT}`);
});
```
