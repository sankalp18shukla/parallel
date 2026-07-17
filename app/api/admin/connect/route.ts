import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "not_logged_in" }, { status: 401 });
  }

  const { data: myProfile } = await admin
    .from("profiles")
    .select("is_admin")
    .eq("id", userData.user.id)
    .single();

  if (!myProfile?.is_admin) {
    return NextResponse.json({ error: "not_admin" }, { status: 403 });
  }

  const { userA, userB } = await request.json();
  if (!userA || !userB || userA === userB) {
    return NextResponse.json({ error: "invalid_users" }, { status: 400 });
  }

  const { error } = await admin
    .from("connects")
    .insert({ user_a: userA, user_b: userB, status: "new" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}