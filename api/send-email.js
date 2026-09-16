const { google } = require("googleapis");

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

module.exports = async (req, res) => {
    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            message: "Method not allowed"
        });
    }

    try {
        const { name, age, location, email, concern } = req.body;

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

        const result = await gmail.users.messages.send({
            userId: "me",
            requestBody: {
                raw: encodedMessage
            }
        });

        console.log("Gmail message sent:", result.data.id);

        return res.status(200).json({
            success: true,
            message: "Email sent successfully ✦",
            gmailMessageId: result.data.id
        });

    } catch (error) {
        console.error("Gmail API error:", error.response?.data || error.message);

        return res.status(500).json({
            success: false,
            message: error.response?.data?.error?.message || "Failed to send email"
        });
    }
};