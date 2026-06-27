// AI chatbot API route that answers questions about businesses, accounts, and reviews.
// Handles guest, community, and business-owner user types with personalized Groq-powered responses.

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Check if a user message is clearly outside the chatbot's domain
function isWithinScope(message: string): boolean {
  const lowerMessage = message.toLowerCase().trim();

  // Allow short messages (greetings, simple questions)
  if (lowerMessage.length < 60) return true;

  // Block only clearly off-topic requests
  const offTopicPatterns = [
    /\b(write\s+(me\s+)?(a\s+)?(code|essay|poem|story|script|homework|assignment))\b/i,
    /\b(solve\s+(this\s+)?(math|equation|calculus|algebra|physics))\b/i,
    /\b(translate\s+(this\s+)?(to|into)\s+(french|spanish|german|chinese|japanese|korean|arabic|hindi))\b/i,
    /\b(medical\s+advice|diagnos|prescri|symptom.{0,10}(mean|caus))\b/i,
    /\b(legal\s+advice|sue\s+|lawsuit|attorney)\b/i,
  ];

  return !offTopicPatterns.some(pattern => pattern.test(lowerMessage));
}

// Handle AI chat messages with context-aware responses
export async function POST(req: Request) {
  try {
    const { message, userId, userType, page } = await req.json();

    console.log("🔍 Chat Request:", { message, userId, userType });

    if (!message || message.trim().length === 0) {
      return Response.json({ error: "Missing message" }, { status: 400 });
    }

    if (!isWithinScope(message)) {
      return Response.json({
        reply: "❌ I can only help with questions about Vicinity's business directory, your account, reviews, and local businesses. Please ask something related to these topics!"
      });
    }


    if (!userId || userType === "guest") {
      console.log("👤 Guest user - fetching all businesses");


      const { data: businesses, error: bizError } = await supabase
        .from("businesses")
        .select("id, name, type, rating, review_count, address, city, state, zip, phone");

      console.log("✅ Businesses fetched:", businesses?.length || 0);
      console.log("❌ Error:", bizError?.message);

      let businessesText = "**No businesses available in directory yet**";

      if (businesses && businesses.length > 0) {

        const sorted = [...businesses].sort((a: any, b: any) => 
          (Number(b.rating) || 0) - (Number(a.rating) || 0)
        );

        businessesText = sorted
          .filter((b: any) => b && b.name)
          .slice(0, 40)
          .map((b: any, idx: number) => {
            const ratingDisplay = b.review_count && b.review_count > 0
              ? `⭐${Number(b.rating || 0).toFixed(1)}/5 (${b.review_count})`
              : `📝 New`;

            return `${idx + 1}. **${b.name}** (${b.type || 'Business'})\n   ${ratingDisplay} | ${b.address || 'Address'}, ${b.city || 'City'} | 📞 ${b.phone || 'N/A'}`;
          })
          .join('\n\n');
      }

      const guestSystemPrompt = `You are Vicinity's AI assistant helping guests discover local businesses.

**BUSINESS DIRECTORY (${businesses?.length || 0} total - Highest Rated First):**
${businessesText}

---

**Your Instructions:**
1. When asked "best coffee" or "coffee near me" - Find businesses with type="coffee" or "cafe" and recommend the highest rated
2. When asked "best business" - Recommend #1 from the list (highest rated)
3. ONLY recommend businesses from the list above
4. If you can't find a matching type, say "We don't have that category yet. Here are our top businesses instead:"
5. Always show: name, rating, review count, and address
6. Keep response under 120 words`;

      return await callGroqAPI(guestSystemPrompt, message);
    }


    if (userType === "user" || userType === "regular" || userType === "community") {
      console.log("👤 Regular user:", userId);

      try {

        const { data: profile } = await supabase
          .from("users")
          .select("id, email, full_name, city, created_at")
          .eq("id", userId)
          .maybeSingle();

        console.log("✅ User profile:", profile?.email);


        const { data: userReviews } = await supabase
          .from("reviews")
          .select("id, rating, text, comment, business_id, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(50);

        console.log("✅ User reviews:", userReviews?.length || 0);


        const { data: favorites } = await supabase
          .from("favorites")
          .select("business_id")
          .eq("user_id", userId);

        console.log("✅ User favorites:", favorites?.length || 0);


        let favoriteBusinesses = [];
        if (favorites && favorites.length > 0) {
          const bizIds = favorites.map(f => f.business_id).filter(Boolean);
          if (bizIds.length > 0) {
            const { data: favBiz } = await supabase
              .from("businesses")
              .select("id, name, type, rating, review_count, address, city, phone")
              .in("id", bizIds);
            favoriteBusinesses = favBiz || [];
          }
        }


        const { data: allBusinesses, error: allBizError } = await supabase
          .from("businesses")
          .select("id, name, type, rating, review_count, address, city, phone");

        console.log("✅ All businesses fetched:", allBusinesses?.length || 0);
        console.log("❌ Error:", allBizError?.message);


        const businessesSorted = allBusinesses 
          ? [...allBusinesses].sort((a: any, b: any) => (Number(b.rating) || 0) - (Number(a.rating) || 0))
          : [];


        let userStats = {
          reviewCount: userReviews?.length || 0,
          avgRating: "N/A",
          recentReviews: 0,
          favoriteCount: favoriteBusinesses.length
        };

        if (userReviews && userReviews.length > 0) {
          const totalRating = userReviews.reduce((sum: number, r: any) => sum + (Number(r.rating) || 0), 0);
          userStats.avgRating = (totalRating / userReviews.length).toFixed(1);

          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          userStats.recentReviews = userReviews.filter((r: any) => new Date(r.created_at) > thirtyDaysAgo).length;
        }


        let favoritesText = "No favorites yet";
        if (favoriteBusinesses.length > 0) {
          favoritesText = favoriteBusinesses
            .slice(0, 10)
            .map((b: any) => {
              const ratingDisplay = b.review_count && b.review_count > 0
                ? `⭐${Number(b.rating || 0).toFixed(1)}/5 (${b.review_count})`
                : `📝 No reviews`;
              return `• **${b.name}** (${b.type}) - ${ratingDisplay} | ${b.address}, ${b.city}`;
            })
            .join('\n');
        }


        let recentReviewsText = "No reviews written yet";
        if (userReviews && userReviews.length > 0) {
          recentReviewsText = userReviews
            .slice(0, 5)
            .map((r: any) => {
              const text = r.comment || r.text || "No comment";
              return `• ⭐${r.rating}/5 - "${text.substring(0, 45)}..."`;
            })
            .join('\n');
        }


        let allBusinessesText = "No businesses available";
        if (businessesSorted.length > 0) {
          allBusinessesText = businessesSorted
            .slice(0, 30)
            .map((b: any) => {
              const ratingDisplay = b.review_count && b.review_count > 0
                ? `⭐${Number(b.rating || 0).toFixed(1)}/5 (${b.review_count})`
                : `📝 New`;
              return `• **${b.name}** (${b.type}) - ${ratingDisplay} | ${b.address}, ${b.city}`;
            })
            .join('\n');
        }

        const userSystemPrompt = `You are Vicinity's AI assistant for a community member.

**👤 ACCOUNT:**
Name: ${profile?.full_name || 'User'} | Email: ${profile?.email} | Member Since: ${profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}

**📊 YOUR STATS:**
Reviews: ${userStats.reviewCount} | Avg Rating: ${userStats.avgRating}/5 | Last 30 Days: ${userStats.recentReviews} | Favorites: ${userStats.favoriteCount}

**❤️ YOUR FAVORITES:**
${favoritesText}

**📝 YOUR REVIEWS:**
${recentReviewsText}

**🏪 ALL BUSINESSES (${businessesSorted.length} total - Highest Rated First):**
${allBusinessesText}

---

**Your Instructions:**
1. Answer questions about their account and reviews
2. For "best coffee" or "coffee near me" - Find businesses with type="coffee" or "cafe", recommend highest rated
3. For "best business" - Recommend #1 from the list
4. Recommend ONLY from the businesses list above
5. If category not found, say "We don't have that type yet. Here are our top businesses:"
6. Always cite name, rating, address
7. Max 120 words`;

        return await callGroqAPI(userSystemPrompt, message);

      } catch (error: any) {
        console.error("❌ Regular user error:", error);
        return Response.json({
          reply: "❌ Error loading your account data. Please try again.",
        });
      }
    }


    if (userType === "business") {
      console.log("🏢 Business owner:", userId);

      try {

        const { data: business } = await supabase
          .from("businesses")
          .select("id, name, type, owner_id, rating, review_count, address, city, state, zip, phone, website")
          .eq("owner_id", userId)
          .maybeSingle();

        if (!business) {
          return Response.json({
            reply: "❌ No business found for your account. Please create a business listing first."
          });
        }

        console.log("✅ Business loaded:", business.name);


        const { data: reviews } = await supabase
          .from("reviews")
          .select("id, rating, text, comment, user_name, created_at")
          .eq("business_id", business.id)
          .order("created_at", { ascending: false })
          .limit(100);

        console.log("✅ Business reviews:", reviews?.length || 0);


        const { data: competitors } = await supabase
          .from("businesses")
          .select("id, name, type, rating, review_count, address, city")
          .eq("type", business.type)
          .order("rating", { ascending: false });

        console.log("✅ Competitors:", competitors?.length || 0);


        let stats = {
          avgRating: Number(business.rating || 0).toFixed(1),
          totalReviews: business.review_count || 0,
          fiveStars: 0,
          fourStars: 0,
          oneStars: 0,
          recentReviews: 0
        };

        if (reviews && reviews.length > 0) {
          stats.fiveStars = reviews.filter((r: any) => r.rating === 5).length;
          stats.fourStars = reviews.filter((r: any) => r.rating === 4).length;
          stats.oneStars = reviews.filter((r: any) => r.rating === 1).length;

          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          stats.recentReviews = reviews.filter((r: any) => new Date(r.created_at) > thirtyDaysAgo).length;
        }


        let reviewsText = "No reviews yet";
        if (reviews && reviews.length > 0) {
          reviewsText = reviews
            .slice(0, 8)
            .map((r: any) => {
              const text = r.comment || r.text || "No comment";
              return `• ${r.user_name || 'Anonymous'}: ⭐${r.rating}/5 - "${text.substring(0, 35)}..."`;
            })
            .join('\n');
        }


        let competitorsText = "No competitors";
        if (competitors && competitors.length > 1) {
          competitorsText = competitors
            .filter((c: any) => c.id !== business.id)
            .slice(0, 5)
            .map((c: any) => {
              const ratingDisplay = c.review_count > 0 ? `⭐${Number(c.rating || 0).toFixed(1)}/5 (${c.review_count})` : "📝 No reviews";
              return `• **${c.name}** - ${ratingDisplay}`;
            })
            .join('\n');
        }

        const businessSystemPrompt = `You are Vicinity's Business Analytics AI.

**🏢 YOUR BUSINESS:**
**${business.name}** (${business.type})
📍 ${business.address}, ${business.city}, ${business.state} ${business.zip}
📞 ${business.phone || 'N/A'} | 🌐 ${business.website || 'N/A'}

**📊 PERFORMANCE:**
Rating: ⭐${stats.avgRating}/5 | Total Reviews: ${stats.totalReviews}
5-Star: ${stats.fiveStars} | 4-Star: ${stats.fourStars} | 1-Star: ${stats.oneStars}
Recent (30 days): ${stats.recentReviews}

**💬 REVIEWS:**
${reviewsText}

**🏆 TOP COMPETITORS:**
${competitorsText}

---

**Instructions:**
1. When asked "how am I doing?" - Compare YOUR rating to competitors
2. Analyze review trends and sentiment
3. Use real data only
4. Max 120 words`;

        return await callGroqAPI(businessSystemPrompt, message);

      } catch (error: any) {
        console.error("❌ Business error:", error);
        return Response.json({
          reply: "❌ Error loading your business data.",
        });
      }
    }

    return Response.json({
      error: "Unknown user type",
      reply: "❌ I couldn't determine your account type.",
    }, { status: 400 });

  } catch (error: any) {
    console.error("❌ Chat API Error:", error);
    return Response.json({
      error: "Failed to process",
      reply: "❌ I'm having trouble. Please try again.",
    }, { status: 500 });
  }
}

async function callGroqAPI(systemPrompt: string, message: string) {
  try {
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
            content: `${systemPrompt}

**CRITICAL RESPONSE RULES:**
- ONLY use data provided above — never invent businesses or stats
- When asked for a type (coffee, cafe, restaurant), SEARCH the list for matching type
- Match "coffee" with type="coffee" or type="cafe"
- For "best" questions, recommend the highest rated
- If type not found, say "We don't have that category yet" and suggest top businesses instead
- For greetings (hi, hello, hey), respond warmly and offer to help
- Keep responses under 250 words

**FORMATTING RULES:**
- Use **bold** for business names and key info
- Use bullet points (- ) for lists
- Use numbered lists (1. ) for rankings or steps
- Keep paragraphs short (2-3 sentences max)
- Be friendly and conversational`,
          },
          {
            role: "user",
            content: message,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("❌ Groq error:", error);
      throw new Error("API Error");
    }

    const data = await response.json();
    const reply = data.choices[0]?.message?.content || "Sorry, I couldn't respond.";

    return Response.json({ reply });
  } catch (error: any) {
    console.error("❌ Groq call failed:", error);
    return Response.json({
      error: "API Error",
      reply: "❌ I'm having trouble. Please try again.",
    }, { status: 500 });
  }
}
