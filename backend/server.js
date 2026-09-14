const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { Resend } = require("resend");

const app = express();
const PORT = process.env.PORT || 3000;


const resend = new Resend(process.env.RESEND_API_KEY);

console.log("RESEND_API_KEY loaded:", !!process.env.RESEND_API_KEY);
console.log("RECEIVER_EMAIL loaded:", !!process.env.RECEIVER_EMAIL);
app.use(cors());
app.use(express.json());

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

        const { data, error } = await resend.emails.send({
            from: "LARA <onboarding@resend.dev>",
            to: [process.env.RECEIVER_EMAIL],
            subject: "New LARA Support Conversation",
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2>LARA — New Conversation</h2>

                    <h3>Visitor Details</h3>

                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Age:</strong> ${age}</p>
                    <p><strong>Location:</strong> ${location}</p>
                    <p><strong>Email:</strong> ${email}</p>

                    <p>
                        <strong>Date & Time:</strong><br>
                        ${submittedAt}
                    </p>

                    <h3>What they shared</h3>

                    <p>${concern}</p>

                    <hr>

                    <p>
                        <strong>LARA — Guardian of Second Chances</strong>
                    </p>
                </div>
            `
        });

        if (error) {
            console.error("Resend error:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to send email"
            });
        }

        console.log("LARA email sent successfully ✦");
        console.log("Resend email ID:", data.id);

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
    console.log(`LARA backend running on port ${PORT}`);
});