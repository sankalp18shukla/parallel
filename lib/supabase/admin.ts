import { createClient as createsSupabaseClient } from "@supabase/supabase-js"

export function createAdminClient() {
    return createsSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SECRET_KEY!
    );
}