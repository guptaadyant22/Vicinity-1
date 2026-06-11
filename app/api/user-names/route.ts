import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Accepts an array of user IDs and returns a map of id -> display name
export async function POST(req: NextRequest) {
  try {
    const { userIds } = await req.json();

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return Response.json({ names: {} });
    }

    // Deduplicate and limit to 50
    const uniqueIds: string[] = Array.from(new Set(userIds as string[])).slice(0, 50);

    const names: Record<string, string> = {};

    // Fetch each user from Supabase Auth admin API
    for (const uid of uniqueIds) {
      try {
        const { data, error } = await supabaseAdmin.auth.admin.getUserById(uid);
        if (!error && data?.user) {
          const meta = data.user.user_metadata || {};
          const name =
            meta.fullname ||
            meta.full_name ||
            meta.name ||
            data.user.email?.split("@")[0] ||
            null;
          if (name) {
            names[uid] = name;
          }
        }
      } catch (_e) {
        // Skip individual failures silently
      }
    }

    return Response.json({ names });
  } catch (error) {
    console.error("user-names API error:", error);
    return Response.json({ names: {} }, { status: 500 });
  }
}
