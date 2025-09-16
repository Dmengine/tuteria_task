import { NextResponse } from "next/server";
import { postToCdnPostmarkService } from "@/lib/postToCdn";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user, lead, currency = "USD", referral_amount = 0 } = body;

    //Save to Supabase
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

    //Build context for Postmark template
    const context = {
      user_first_name: (user.name || "").split(" ")[0] || "",
      referred_user_name: lead.user.name || "",
      course_name: lead.course?.name || "",
      currency,
      referral_value: referral_amount,
      referral_tracking_page_url: `${process.env.WEBSITE_URL}/app/referrals`,
      recipient: user.email,
    };

    //Postmark payload format
    const payload = {
    //   From: "Medbuddy <info@medbuddyafrica.com>",
      From: "Oladimeji <oladimeji@fyaora.com>",
      To: user.email,
      TemplateAlias: "medbuddy_referral_followup",
      TemplateModel: context,
    };

    const result = await postToCdnPostmarkService(payload);

    return NextResponse.json({ ok: true, result }, { status: 200 });
  } catch (err: any) {
    console.error("sendReferral error:", err);
    return NextResponse.json(
      { ok: false, error: err.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
