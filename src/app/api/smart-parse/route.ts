import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");

/**
 * Fallback Mock Parser
 * Uses regex and keyword matching when Gemini API is unavailable
 */
function mockParse(description: string): Record<string, unknown> {
    const text = description.toLowerCase();
    const today = new Date();

    // Extract role type
    let role_type: string | null = null;
    if (text.includes("bartender") || text.includes("mixologist") || text.includes("bar")) {
        role_type = "bartender";
    } else if (text.includes("server") || text.includes("waiter") || text.includes("waitress")) {
        role_type = "server";
    } else if (text.includes("host") || text.includes("hostess") || text.includes("greeter")) {
        role_type = "host";
    } else if (text.includes("sommelier") || text.includes("wine")) {
        role_type = "sommelier";
    } else if (text.includes("valet") || text.includes("parking")) {
        role_type = "valet";
    } else if (text.includes("security") || text.includes("bouncer")) {
        role_type = "security";
    } else if (text.includes("coat check") || text.includes("cloakroom")) {
        role_type = "coat_check";
    }

    // Extract number of workers
    let workers_needed: number | null = null;
    const workersMatch = text.match(/(\d+)\s*(?:bartender|server|host|staff|people|worker)/);
    if (workersMatch) {
        workers_needed = parseInt(workersMatch[1]);
    }

    // Extract hourly rate
    let hourly_rate: number | null = null;
    const rateMatch = text.match(/\$(\d+)(?:\/hr|\/hour| per hour| an hour)?/);
    if (rateMatch) {
        hourly_rate = parseInt(rateMatch[1]);
    }

    // Extract times (e.g., "6pm", "6:00 PM", "18:00")
    let start_time: string | null = null;
    let end_time: string | null = null;
    const timePattern = /(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/gi;
    const times: string[] = [];
    let match;
    while ((match = timePattern.exec(text)) !== null) {
        let hour = parseInt(match[1]);
        const minutes = match[2] || "00";
        const ampm = match[3]?.toLowerCase();

        if (ampm === "pm" && hour < 12) hour += 12;
        if (ampm === "am" && hour === 12) hour = 0;

        times.push(`${hour.toString().padStart(2, "0")}:${minutes}`);
    }
    if (times.length >= 1) start_time = times[0];
    if (times.length >= 2) end_time = times[1];

    // Extract venue name (look for "at" followed by location)
    let venue_name: string | null = null;
    const venueMatch = description.match(/(?:at|@)\s+(?:the\s+)?([A-Z][A-Za-z\s']+?)(?:\s+(?:on|from|next|this|\d)|\.|,|$)/);
    if (venueMatch) {
        venue_name = venueMatch[1].trim();
    }

    // Extract date
    let event_date: string | null = null;
    const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

    for (let i = 0; i < daysOfWeek.length; i++) {
        if (text.includes(`next ${daysOfWeek[i]}`)) {
            const daysUntil = (i - today.getDay() + 7) % 7 + 7;
            const targetDate = new Date(today);
            targetDate.setDate(today.getDate() + daysUntil);
            event_date = targetDate.toISOString().split("T")[0];
            break;
        } else if (text.includes(`this ${daysOfWeek[i]}`) || text.includes(daysOfWeek[i])) {
            const daysUntil = (i - today.getDay() + 7) % 7 || 7;
            const targetDate = new Date(today);
            targetDate.setDate(today.getDate() + daysUntil);
            event_date = targetDate.toISOString().split("T")[0];
            break;
        }
    }

    // Generate a title based on context
    let title: string | null = null;
    if (text.includes("wedding")) title = "Wedding Reception";
    else if (text.includes("gala")) title = "Charity Gala";
    else if (text.includes("party")) title = "Private Party";
    else if (text.includes("corporate") || text.includes("company")) title = "Corporate Event";
    else if (text.includes("dinner")) title = "Dinner Event";
    else if (text.includes("cocktail")) title = "Cocktail Reception";
    else if (role_type) title = `${role_type.charAt(0).toUpperCase() + role_type.slice(1)} Shift`;

    // Extract attire
    let attire_code: string | null = null;
    if (text.includes("black tie") || text.includes("tuxedo")) attire_code = "Black tie / Tuxedo";
    else if (text.includes("formal")) attire_code = "Black formal attire";
    else if (text.includes("casual")) attire_code = "Smart casual";
    else if (text.includes("all black")) attire_code = "All black attire";

    return {
        title,
        description: description.slice(0, 200),
        event_date,
        start_time,
        end_time,
        venue_name,
        venue_address: null,
        role_type,
        workers_needed,
        hourly_rate,
        attire_code,
    };
}

/**
 * Smart-Parse API
 * Extracts structured shift data from natural language descriptions
 * Uses Google Gemini for robust NL understanding, with fallback to mock parser
 */
export async function POST(request: Request) {
    try {
        const { description } = await request.json();

        if (!description || typeof description !== "string") {
            return NextResponse.json(
                { error: "Missing or invalid description" },
                { status: 400 }
            );
        }

        // Get current date for relative date parsing
        const today = new Date();
        const currentDateStr = today.toISOString().split("T")[0];
        const currentDayName = today.toLocaleDateString("en-US", { weekday: "long" });

        const prompt = `You are a shift/event parsing assistant for a luxury event staffing platform.

Today is ${currentDayName}, ${currentDateStr}.

Extract structured data from this event staffing description:
"${description}"

Return ONLY valid JSON with these fields (use null for unknown values):
{
  "title": "string - Event title (infer from context)",
  "description": "string - Brief description",
  "event_date": "YYYY-MM-DD format",
  "start_time": "HH:MM in 24-hour format",
  "end_time": "HH:MM in 24-hour format",
  "venue_name": "string - Venue name",
  "venue_address": "string - Address if provided",
  "role_type": "one of: bartender, server, host, valet, security, coat_check, sommelier",
  "workers_needed": number,
  "hourly_rate": number in dollars,
  "attire_code": "string - Dress code"
}

Rules:
- Parse relative dates from today (${currentDateStr})
- Convert 12-hour to 24-hour format
- Return ONLY the JSON, no markdown or explanation`;

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            const result = await model.generateContent(prompt);
            const responseText = result.response.text();

            // Extract JSON from response
            let jsonStr = responseText;
            const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
            if (jsonMatch) {
                jsonStr = jsonMatch[1];
            }

            // Parse the JSON
            const parsedData = JSON.parse(jsonStr.trim());

            // Validate and sanitize
            const resultData = {
                title: parsedData.title || null,
                description: parsedData.description || null,
                event_date: parsedData.event_date || null,
                start_time: parsedData.start_time || null,
                end_time: parsedData.end_time || null,
                venue_name: parsedData.venue_name || null,
                venue_address: parsedData.venue_address || null,
                role_type: validateRoleType(parsedData.role_type),
                workers_needed: typeof parsedData.workers_needed === "number"
                    ? parsedData.workers_needed
                    : null,
                hourly_rate: typeof parsedData.hourly_rate === "number"
                    ? parsedData.hourly_rate
                    : null,
                attire_code: parsedData.attire_code || null,
            };

            return NextResponse.json({
                success: true,
                parsed: resultData,
                confidence: calculateConfidence(resultData),
                mode: "gemini",
            });

        } catch (aiError) {
            // Gemini failed - use mock parser
            console.warn("Gemini API failed, using mock parser:", aiError);

            const mockResult = mockParse(description);
            const resultData = {
                title: mockResult.title || null,
                description: mockResult.description || null,
                event_date: mockResult.event_date || null,
                start_time: mockResult.start_time || null,
                end_time: mockResult.end_time || null,
                venue_name: mockResult.venue_name || null,
                venue_address: mockResult.venue_address || null,
                role_type: validateRoleType(mockResult.role_type as string),
                workers_needed: typeof mockResult.workers_needed === "number"
                    ? mockResult.workers_needed
                    : null,
                hourly_rate: typeof mockResult.hourly_rate === "number"
                    ? mockResult.hourly_rate
                    : null,
                attire_code: mockResult.attire_code || null,
            };

            return NextResponse.json({
                success: true,
                parsed: resultData,
                confidence: calculateConfidence(resultData),
                mode: "fallback",
            });
        }

    } catch (error) {
        console.error("Smart-Parse error:", error);
        return NextResponse.json(
            { error: "Failed to process description" },
            { status: 500 }
        );
    }
}

function validateRoleType(role: string | null): string | null {
    const validRoles = [
        "bartender", "server", "host", "valet",
        "security", "coat_check", "sommelier"
    ];

    if (!role) return null;

    const normalized = role.toLowerCase().replace(/[^a-z_]/g, "");
    return validRoles.includes(normalized) ? normalized : null;
}

function calculateConfidence(data: Record<string, unknown>): number {
    const requiredFields = [
        "event_date", "start_time", "end_time",
        "role_type", "workers_needed", "hourly_rate"
    ];

    const parsed = requiredFields.filter(f => data[f] !== null).length;
    return Math.round((parsed / requiredFields.length) * 100);
}
