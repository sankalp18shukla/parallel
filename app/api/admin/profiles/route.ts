import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET() {
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

  const { data: profiles } = await admin
    .from("profiles")
    .select("id, description, companies, timezone");

  return NextResponse.json({ profiles: profiles ?? [] });
}