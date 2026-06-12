import { NextRequest, NextResponse } from "next/server";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

function normalizeId(id: any) {
  return String(id).trim().toLowerCase();
}

export async function POST(req: NextRequest) {
  let savedBusinesses: any[] = [];
  let businesses: any[] = [];

  try {
    const body = await req.json();
    savedBusinesses = body.savedBusinesses || [];
    businesses = body.businesses || [];

    if (!businesses || businesses.length === 0) {
      return NextResponse.json({
        success: true,
        favorites: [],
        similar: [],
        better: [],
      });
    }

    if (!GROQ_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing API key",
        },
        {
          status: 500,
        }
      );
    }

    // 1. Create mapping from original ID to sequential short ID (biz_1, biz_2, etc.)
    const idMap = new Map<string, string>(); // shortId -> originalId
    const originalIdMap = new Map<string, string>(); // originalId -> shortId

    businesses.forEach((b: any, index: number) => {
      const shortId = `biz_${index + 1}`;
      const originalId = normalizeId(b.id);
      idMap.set(shortId, originalId);
      originalIdMap.set(originalId, shortId);
    });

    const lightweightBusinesses = businesses
      .slice(0, 50)
      .map((b: any) => {
        const originalId = normalizeId(b.id);
        const shortId = originalIdMap.get(originalId) || originalId;
        return {
          id: shortId,
          name: b.name,
          type: b.type,
          rating: b.rating,
          description: (b.description || "").slice(0, 100),
        };
      });

    const businessList = lightweightBusinesses
      .map(
        (b: any) =>
          `ID:${b.id}|NAME:${b.name}|TYPE:${b.type}|RATING:${b.rating}|DESC:${b.description}`
      )
      .join("\n");

    const savedText = (savedBusinesses || [])
      .map((b: any) => {
        const originalId = normalizeId(b.id);
        const shortId = originalIdMap.get(originalId) || "unknown";
        return `[${shortId}] ${b.name} (${b.type})`;
      })
      .join("\n");

    const prompt = `
You are an AI recommendation engine.

USER SAVED BUSINESSES:
${savedText || "None"}

AVAILABLE BUSINESSES:
${businessList}

TASKS:

1. RECOMMENDATIONS BASED ON SAVED BUSINESSES:
- If USER SAVED BUSINESSES is NOT empty:
  Recommend exactly 6 businesses from AVAILABLE BUSINESSES that have a similar category/type to the user's saved places.
  The reason for each recommendation MUST be strictly formatted as: "b/c you saved that [Category]" (replace [Category] with the actual lowercase category/type of the user's saved business that this recommendation matches, e.g., "b/c you saved that restaurant" or "b/c you saved that cafe"). Do NOT include the specific name of any saved place.
- If USER SAVED BUSINESSES is empty:
  Recommend exactly 6 random or top businesses from AVAILABLE BUSINESSES.
  The reason for each recommendation MUST be strictly: "You can do this nearby".

RULES:
- Do NOT recommend already saved businesses.
- Only use AVAILABLE BUSINESSES.
- Return ONLY a JSON object with this exact format (using the short ID e.g., "biz_1" for the "id" field):
{
  "favorites": [
    { "id": "biz_x", "reason": "reason_string" }
  ]
}
`;

    const groq = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          model: "llama-3.1-8b-instant",

          messages: [
            {
              role: "system",
              content:
                "You are a recommendation engine. Return ONLY JSON.",
            },

            {
              role: "user",
              content: prompt,
            },
          ],

          temperature: 0.3,

          max_tokens: 1000,
        }),
      }
    );

    const savedIdsSet = new Set((savedBusinesses || []).map((b: any) => normalizeId(b.id)));

    // Failsafe fallback generator
    const getFallbackRecommendations = () => {
      const unsaved = businesses.filter((b: any) => !savedIdsSet.has(normalizeId(b.id)));
      return unsaved.slice(0, 6).map((b: any) => {
        let reason = "You can do this nearby";
        if (savedBusinesses && savedBusinesses.length > 0) {
          reason = `b/c you saved that ${(savedBusinesses[0]?.type || "place").toLowerCase()}`;
        }
        return {
          ...b,
          reason,
        };
      });
    };

    if (!groq.ok) {
      return NextResponse.json({
        success: true,
        favorites: getFallbackRecommendations(),
        similar: [],
        better: [],
      });
    }

    const groqData = await groq.json();

    const response =
      groqData?.choices?.[0]?.message?.content || "";

    let parsed;

    try {
      // Regex extraction to be completely robust to wrapping text/markdown
      let cleanResponse = response.trim();
      const jsonRegex = /\{[\s\S]*\}/;
      const match = cleanResponse.match(jsonRegex);
      if (match) {
        cleanResponse = match[0];
      }
      parsed = JSON.parse(cleanResponse);
    } catch {
      return NextResponse.json({
        success: true,
        favorites: getFallbackRecommendations(),
        similar: [],
        better: [],
      });
    }

    const favoritesRecs = parsed.favorites || [];

    const getBusinessesWithReason = (recs: any[]) => {
      return recs
        .map((rec: any) => {
          const rawId = rec?.id ? String(rec.id).trim().toLowerCase() : normalizeId(rec);
          
          // Map short ID back to original UUID
          const originalId = idMap.get(rawId) || rawId;
          
          // Filter out already saved businesses
          if (savedIdsSet.has(originalId)) return null;

          let reason = rec?.reason || "";

          const business = businesses.find((b: any) => normalizeId(b.id) === originalId);
          if (!business) return null;

          if (!reason) {
            if (!savedBusinesses || savedBusinesses.length === 0) {
              reason = "You can do this nearby";
            } else {
              reason = `b/c you saved that ${(savedBusinesses[0]?.type || "place").toLowerCase()}`;
            }
          }

          return {
            ...business,
            reason: reason,
          };
        })
        .filter(Boolean);
    };

    let favorites = getBusinessesWithReason(favoritesRecs);
    if (favorites.length === 0) {
      favorites = getFallbackRecommendations();
    }

    return NextResponse.json({
      success: true,
      favorites,
      similar: [],
      better: [],
    });
  } catch (err) {
    console.log(err);

    // Dynamic fallback in catch block
    const savedIdsSet = new Set((savedBusinesses || []).map((b: any) => normalizeId(b.id)));
    const unsaved = businesses.filter((b: any) => !savedIdsSet.has(normalizeId(b.id)));
    const fallback = unsaved.slice(0, 6).map((b: any) => ({
      ...b,
      reason: (savedBusinesses && savedBusinesses.length > 0) 
        ? `b/c you saved that ${(savedBusinesses[0]?.type || "place").toLowerCase()}`
        : "You can do this nearby"
    }));

    return NextResponse.json({
      success: true,
      favorites: fallback,
      similar: [],
      better: [],
    });
  }
}