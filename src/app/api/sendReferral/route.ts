import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendMail } from "@/lib/mail";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { user, lead, currency = "USD", referral_amount = 0 } = body;

    // Save to Supabase
    const { error } = await supabaseAdmin.from("referrals").insert([
      {
        user_email: user.email,
        user_name: user.name,
        referred_user_name: lead.user.name,
        course_name: lead.course?.name,
        currency,
        referral_amount,
      },
    ]);
    if (error) throw error;

    // Build referral email content
    const html = `
      <h2>Referral Follow-up</h2>
      <p>Hi ${user.name?.split(" ")[0] || ""},</p>
      <p>You referred <strong>${lead.user.name}</strong> for the course <em>${lead.course?.name}</em>.</p>
      <p>Referral value: ${currency} ${referral_amount}</p>
      <p>Thanks, Medbuddy</p>
    `;

    // Send via SMTP (Nodemailer)
    const result = await sendMail({
      to: user.email,
      subject: "Medbuddy Referral Follow-up",
      html,
    });

    return NextResponse.json({ ok: true, result }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
