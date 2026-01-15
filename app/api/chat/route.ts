// app/api/chat/route.ts - FULL DATA PULL

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { message, userId, userType, page } = await req.json();

    console.log("🔍 Request:", { message, userId, userType, page });

    if (!message) {
      return Response.json({ error: "Missing message" }, { status: 400 });
    }

    // CASE 1: GUEST USER
    if (!userId || userType === "guest") {
      console.log("👤 Guest user");
      
      const { data: businesses } = await supabase
        .from("businesses")
        .select("id, name, type, rating, review_count, address, city, phone, hours")
        .limit(20);

      let context = `You are Vicinity's AI assistant helping guests find local businesses.

BUSINESSES (${businesses?.length || 0}):
${businesses?.slice(0, 10).map((b: any) => `- ${b.name} (${b.type}) | ⭐${b.rating}/5 | ${b.address}, ${b.city}`).join('\n') || 'None'}

Keep responses SHORT (max 150 words), use bullet points, be helpful.`;

      return await callGroqAPI(context, message);
    }

    // CASE 2: REGULAR USER
    if (userType === "user" || userType === "regular" || userType === "community") {
      console.log("👤 Regular user - fetching full account data");

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("id, email, full_name, city, created_at, updated_at")
        .eq("id", userId)
        .single();

      console.log("✅ Profile:", profile);

      // Get all reviews with business info
      const { data: reviews, error: reviewsError } = await supabase
        .from("reviews")
        .select("id, rating, text, business_id, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      console.log("✅ Reviews:", reviews?.length);

      // Get favorited businesses
      const { data: favorites, error: favError } = await supabase
        .from("favorites")
        .select("business_id, businesses(name, type, rating)")
        .eq("user_id", userId)
        .limit(10);

      console.log("✅ Favorites:", favorites?.length);

      let avgRating = "N/A";
      let reviewCount = 0;
      let recentReviews = 0;
      
      if (reviews && reviews.length > 0) {
        reviewCount = reviews.length;
        avgRating = (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1);
        
        // Count reviews from last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        recentReviews = reviews.filter((r: any) => new Date(r.created_at) > thirtyDaysAgo).length;
      }

      let context = `You are Vicinity's AI assistant. A community member is asking about their account.

### ACCOUNT DETAILS
**Name:** ${profile?.full_name || 'Not set'}
**Email:** ${profile?.email}
**Location:** ${profile?.city || 'Not specified'}
**Member Since:** ${profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
**Last Updated:** ${profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'Unknown'}

### REVIEW STATS
**Total Reviews:** ${reviewCount}
**Average Rating:** ${avgRating}/5
**Recent Reviews (30 days):** ${recentReviews}
**Saved Favorites:** ${favorites?.length || 0}

${favorites && favorites.length > 0 ? `### TOP FAVORITES\n${favorites.slice(0, 5).map((f: any) => `• ${f.businesses?.name} (${f.businesses?.type}) - ⭐${f.businesses?.rating}/5`).join('\n')}` : ''}

${reviews && reviews.length > 0 ? `### RECENT REVIEWS\n${reviews.slice(0, 3).map((r: any) => `• ⭐${r.rating}/5 - "${r.text?.substring(0, 50)}..." (${new Date(r.created_at).toLocaleDateString()})`).join('\n')}` : ''}

Keep response SHORT (max 150 words). Summarize their account status and activity. ONLY answer buisness directory website related questions, if something else is asked, say "That is not related for my purpose"`;

      return await callGroqAPI(context, message);
    }

    // CASE 3: BUSINESS OWNER
    if (userType === "business") {
      console.log("🏢 Business owner - fetching full business data");

      const { data: business, error: bizError } = await supabase
        .from("businesses")
        .select("*")
        .eq("owner_id", userId)
        .single();

      console.log("✅ Business:", business?.name);

      const { data: reviews, error: revError } = await supabase
        .from("reviews")
        .select("id, rating, text, user_name, user_email, created_at")
        .eq("business_id", business?.id)
        .order("created_at", { ascending: false });

      console.log("✅ Reviews:", reviews?.length);

      let avgRating = business?.rating || "N/A";
      let fiveStars = 0;
      let oneStars = 0;
      let recentReviews = 0;

      if (reviews && reviews.length > 0) {
        fiveStars = reviews.filter((r: any) => r.rating === 5).length;
        oneStars = reviews.filter((r: any) => r.rating === 1).length;
        
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        recentReviews = reviews.filter((r: any) => new Date(r.created_at) > thirtyDaysAgo).length;
      }

      let context = `You are Vicinity's Business AI Assistant analyzing a business profile.

### BUSINESS PROFILE
**Name:** ${business?.name}
**Type:** ${business?.type}
**Location:** ${business?.address}, ${business?.city}, ${business?.state} ${business?.zip}
**Phone:** ${business?.phone || 'Not provided'}
**Website:** ${business?.website || 'Not provided'}
**Hours:** ${business?.hours || 'Not set'}
**Description:** ${business?.description || 'Not set'}

### PERFORMANCE METRICS
**Overall Rating:** ${avgRating}/5 ⭐
**Total Reviews:** ${business?.review_count || 0}
**5-Star Reviews:** ${fiveStars}
**1-Star Reviews:** ${oneStars}
**Recent Reviews (30 days):** ${recentReviews}

${reviews && reviews.length > 0 ? `### LATEST CUSTOMER FEEDBACK\n${reviews.slice(0, 3).map((r: any) => `• ${r.user_name || 'Anonymous'}: ⭐${r.rating}/5 - "${r.text?.substring(0, 50)}..."`).join('\n')}` : 'No reviews yet. Encourage customers to leave reviews!'}

Keep response SHORT (max 150 words). Provide actionable insights about business performance.`;

      return await callGroqAPI(context, message);
    }

    return Response.json({
      error: "Unknown user type",
      reply: "I couldn't determine your account type.",
    }, { status: 400 });

  } catch (error: any) {
    console.error("❌ Error:", error?.message || error);
    return Response.json({
      error: "Failed to process request",
      reply: "I'm having trouble. Please try again.",
    }, { status: 500 });
  }
}

async function callGroqAPI(context: string, message: string) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `${context}

FORMATTING RULES:
- Only answer questions related to the user's account or business profile and nothing else. If the user asks something outside this scope, respond with "That is not related for my purpose".
- Use bullet points (•) for lists
- Use ### for headers (max 2-3)
- Keep paragraphs to 1-2 sentences
- NO long blocks of text
- Bold important info with **text**
- ABSOLUTE MAX: 150 words`,
        },
        {
          role: "user",
          content: message,
        },
      ],
      max_tokens: 200,
      temperature: 0.6,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("❌ Error:", error);
    throw new Error("API Error");
  }

  const data = await response.json();
  const reply = data.choices[0]?.message?.content || "Sorry, I couldn't respond.";

  return Response.json({ reply });
}
