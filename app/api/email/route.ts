import { Resend } from "resend";
import { NextResponse } from "next/server";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, email, name, message } = body;

    console.log("Received request:", { type, email, name, message });

    let result;
    if (type === "waitlist") {
      result = await resend.emails.send({
        from: "Mockchain <onboarding@resend.dev>",
        to: ["peter@mockchain.xyz"],
        subject: "New Waitlist Signup",
        text: `New signup: ${email}`,
      });
    } else if (type === "contact") {
      result = await resend.emails.send({
        from: "Mockchain <onboarding@resend.dev>",
        to: ["peter@mockchain.xyz"],
        subject: "New Contact Form Submission",
        text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
      });
    }

    console.log("Resend response:", result);

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Email error:", error);
    return NextResponse.json(
      { error: "Failed to send email", details: error },
      { status: 500 }
    );
  }
}
