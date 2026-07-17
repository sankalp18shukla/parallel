import { createAdminClient } from "@/lib/supabase/admin";
import { sendMeetingConfirmedEmail } from "@/lib/email";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { connectId, scheduledTime } = await request.json();
  const admin = createAdminClient();

  const { data: connect } = await admin
    .from("connects")
    .select("user_a, user_b")
    .eq("id", connectId)
    .single();

  if (!connect) {
    return NextResponse.json({ error: "connect_not_found" }, { status: 404 });
  }

  const { data: userAData } = await admin.auth.admin.getUserById(connect.user_a);
  const { data: userBData } = await admin.auth.admin.getUserById(connect.user_b);

  const when = new Date(scheduledTime).toUTCString();
  const meetLink = "https://meet.google.com/new";

  if (userAData?.user?.email) await sendMeetingConfirmedEmail(userAData.user.email, when, meetLink);
  if (userBData?.user?.email) await sendMeetingConfirmedEmail(userBData.user.email, when, meetLink);

  return NextResponse.json({ success: true });
}