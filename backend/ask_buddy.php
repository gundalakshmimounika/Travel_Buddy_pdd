<?php
// Smart AI Travel Buddy Engine with Dynamic Action Options
require_once 'config.php';

$raw = file_get_contents('php://input');
$json = !empty($raw) ? json_decode($raw, true) : [];
$question = trim($json['question'] ?? ($json['message'] ?? ($_POST['question'] ?? ($_POST['message'] ?? ($_GET['question'] ?? ($_GET['message'] ?? ''))))));

if (empty($question)) {
    echo json_encode(["status" => "error", "message" => "No question specified"]);
    exit;
}

// 1. Try Gemini API first if available and not expired
$prompt = "You are 'Travel Buddy', an expert, enthusiastic travel assistant. Answer this question concisely with helpful bullet points and actionable travel advice: " . $question;
$ai_response = callGemini($prompt);

if (isset($ai_response['success']) && !empty($ai_response['text'])) {
    $answer = trim($ai_response['text']);
    // Generate context-aware options based on prompt & answer
    $options = generateContextOptions($question, $answer);
    echo json_encode([
        "status" => "success",
        "answer" => $answer,
        "reply" => $answer,
        "options" => $options
    ]);
    exit;
}

// 2. High-Performance Comprehensive Travel Intelligence Engine
$result = generateComprehensiveTravelAdvice($question);

echo json_encode([
    "status" => "success",
    "answer" => $result['answer'],
    "reply" => $result['answer'],
    "options" => $result['options']
]);
exit;

/**
 * Generate rich, context-aware options for any query
 */
function generateContextOptions($query, $text) {
    $q = strtolower($query . ' ' . $text);
    $options = [];

    // Parse budget if present
    $budget = parseBudgetAmount($query);
    if ($budget) {
        $options[] = ["label" => "💰 Set ₹" . number_format($budget) . " in Budget", "action" => "budget", "param" => (string)$budget];
        $options[] = ["label" => "🏨 Budget Hotels (<₹2,000)", "action" => "hotels", "param" => "Pondicherry"];
        $options[] = ["label" => "🎫 Book Tickets", "action" => "tickets", "param" => "Pondicherry"];
        $options[] = ["label" => "ℹ️ Travel Info & Tips", "action" => "info", "param" => "Budget Info"];
        return $options;
    }

    if (strpos($q, 'goa') !== false) {
        $options[] = ["label" => "📍 Explore Goa", "action" => "place", "param" => "Goa"];
        $options[] = ["label" => "🏨 Goa Beach Resorts", "action" => "hotels", "param" => "Goa"];
        $options[] = ["label" => "🌤️ Goa Weather", "action" => "weather", "param" => "Goa"];
        $options[] = ["label" => "🎫 Goa Flights & Trains", "action" => "tickets", "param" => "Goa"];
        $options[] = ["label" => "ℹ️ Travel Info", "action" => "info", "param" => "Goa Info"];
    } elseif (strpos($q, 'pondy') !== false || strpos($q, 'pondicherry') !== false) {
        $options[] = ["label" => "📍 Explore Pondicherry", "action" => "place", "param" => "Pondicherry"];
        $options[] = ["label" => "🏨 French Quarter Hotels", "action" => "hotels", "param" => "Pondicherry"];
        $options[] = ["label" => "🎫 Book Bus / Train", "action" => "tickets", "param" => "Pondicherry"];
        $options[] = ["label" => "ℹ️ Travel Info", "action" => "info", "param" => "Pondicherry Info"];
    } elseif (strpos($q, 'ooty') !== false) {
        $options[] = ["label" => "📍 Explore Ooty", "action" => "place", "param" => "Ooty"];
        $options[] = ["label" => "🏨 Ooty Hill Stays", "action" => "hotels", "param" => "Ooty"];
        $options[] = ["label" => "🌤️ Ooty Climate", "action" => "weather", "param" => "Ooty"];
        $options[] = ["label" => "ℹ️ Travel Info", "action" => "info", "param" => "Ooty Info"];
    } elseif (strpos($q, 'pack') !== false) {
        $options[] = ["label" => "🎒 Open Packing Checklist", "action" => "packing", "param" => ""];
        $options[] = ["label" => "🌤️ Check Weather Forecast", "action" => "weather", "param" => "Goa"];
        $options[] = ["label" => "ℹ️ Travel Info & Essentials", "action" => "info", "param" => "Packing Info"];
    } elseif (strpos($q, 'hotel') !== false || strpos($q, 'stay') !== false) {
        $options[] = ["label" => "🏨 Browse All Hotels", "action" => "hotels", "param" => "Goa"];
        $options[] = ["label" => "💰 Track Stay Budget", "action" => "budget", "param" => "5000"];
        $options[] = ["label" => "ℹ️ Hotel Booking Info", "action" => "info", "param" => "Hotel Info"];
    } else {
        $options[] = ["label" => "💰 Budget Planner", "action" => "budget", "param" => "10000"];
        $options[] = ["label" => "🏨 Find Hotels", "action" => "hotels", "param" => "Goa"];
        $options[] = ["label" => "🎫 Book Tickets", "action" => "tickets", "param" => "Goa"];
        $options[] = ["label" => "🎒 Packing List", "action" => "packing", "param" => ""];
        $options[] = ["label" => "ℹ️ Travel Info", "action" => "info", "param" => "General Info"];
    }

    return $options;
}

/**
 * Extracts numeric budget amount from free text (e.g. 6k -> 6000, 10000, 15k)
 */
function parseBudgetAmount($text) {
    if (preg_match('/(?:budget\s*(?:is|of|around|:)?\s*|(?:rs\.?|inr|₹)\s*)(\d+)\s*(k|thousand|l|lakh)?/i', $text, $matches)) {
        $num = (int)$matches[1];
        $unit = strtolower($matches[2] ?? '');
        if ($unit === 'k' || $unit === 'thousand') return $num * 1000;
        if ($unit === 'l' || $unit === 'lakh') return $num * 100000;
        return $num;
    }
    if (preg_match('/\b(\d+)\s*k\b/i', $text, $matches)) {
        return (int)$matches[1] * 1000;
    }
    if (preg_match('/\b(\d{3,6})\b/', $text, $matches)) {
        $val = (int)$matches[1];
        if ($val >= 500 && $val <= 500000) return $val;
    }
    return null;
}

/**
 * Generates an exhaustive, high-quality, personalized travel response
 */
function generateComprehensiveTravelAdvice($question) {
    $q = trim($question);
    $lower = strtolower($q);

    $budget = parseBudgetAmount($question);

    // ── 1. Specific Numeric Budget Query (e.g. "my budget is 6k") ──
    if ($budget !== null) {
        $formatted = "₹" . number_format($budget);
        
        // Dynamic breakdown percentages
        $stayPct = 0.38;
        $travelPct = 0.22;
        $foodPct = 0.25;
        $sightseeingPct = 0.15;

        $stayAmt = round($budget * $stayPct);
        $travelAmt = round($budget * $travelPct);
        $foodAmt = round($budget * $foodPct);
        $sightseeingAmt = $budget - ($stayAmt + $travelAmt + $foodAmt);

        $days = ($budget < 4000) ? "1 to 2 days" : (($budget < 12000) ? "2 to 3 days" : "4 to 7 days");

        $answer = "💰 **Smart Travel Plan for {$formatted} Budget:**\n\n"
                . "With **{$formatted}**, you can enjoy an incredible **{$days}** trip! Here is an optimal breakdown designed to maximize your adventure without overspending:\n\n"
                . "📍 **Top Recommended Destinations within {$formatted}:**\n";

        if ($budget <= 7000) {
            $answer .= "• **Pondicherry:** Coastal promenade walks, French Quarter heritage, beach cafes & Auroville.\n"
                    . "• **Mahabalipuram:** UNESCO Shore Temple, coastal seafood, surf schools & beach strolls.\n"
                    . "• **Tirupati & Chandragiri:** Sacred hilltop views, scenic waterfalls & historic fort trails.\n"
                    . "• **Yelagiri Hills:** Pleasant hill station climate, lake boating, nature parks & easy treks.\n"
                    . "• **Hampi Heritage:** Ancient stone temples, river coracle rides & charming backpacker cafes.\n\n";
        } elseif ($budget <= 15000) {
            $answer .= "• **Goa Beach Escape:** North Goa beach life, watersports, beach shacks & Old Goa churches.\n"
                    . "• **Ooty & Coonoor:** Scenic Nilgiri Mountain Toy Train, lush tea estates & botanical gardens.\n"
                    . "• **Munnar & Kochi:** Misty hill slopes, spice plantations, backwaters & fresh seafood.\n"
                    . "• **Wayanad / Coorg:** Coffee plantation homestays, waterfalls, wildlife safari & trekking.\n\n";
        } else {
            $answer .= "• **Goa Luxury Stays:** Private villa with pool, ocean cruises & fine coastal dining.\n"
                    . "• **Kerala Backwaters & Munnar:** Houseboat stay in Alleppey, tea gardens & luxury spa.\n"
                    . "• **Manali & Shimla:** Himalayan mountain views, snow activities & cozy pine cabin stays.\n"
                    . "• **Jaipur & Udaipur:** Royal palace heritage, lakeside dining & vibrant cultural bazaars.\n\n";
        }

        $answer .= "📊 **Optimal {$formatted} Budget Breakdown:**\n"
                . "• 🏨 **Accommodation ({$days}):** ₹" . number_format($stayAmt) . " (Verified budget hotel, hostel or homestay)\n"
                . "• 🚆 **Travel & Transit (Round Trip):** ₹" . number_format($travelAmt) . " (Express train sleeper berth or express bus)\n"
                . "• 🍲 **Food & Drinks:** ₹" . number_format($foodAmt) . " (Authentic local thalis, cafes & coastal street food)\n"
                . "• 🎟️ **Sightseeing & Buffer:** ₹" . number_format($sightseeingAmt) . " (Entry tickets, local auto/rickshaws & emergency fund)\n\n"
                . "💡 **Pro Money-Saving Tips:**\n"
                . "1. Book your train sleeper berth 2–3 weeks in advance to save up to 50% compared to last-minute cabs.\n"
                . "2. Eat at famous local messes and family-run diners for the best authentic food at budget prices.\n"
                . "3. Tap **Set {$formatted} in Budget** below to pre-configure your Budget Tracker in TravelBuddy!";

        $destParam = ($budget <= 7000) ? "Pondicherry" : "Goa";
        $options = [
            ["label" => "💰 Set {$formatted} in Budget", "action" => "budget", "param" => (string)$budget],
            ["label" => "🏨 Budget Hotels in {$destParam}", "action" => "hotels", "param" => $destParam],
            ["label" => "🎫 Book Tickets to {$destParam}", "action" => "tickets", "param" => $destParam],
            ["label" => "🎒 Packing Checklist", "action" => "packing", "param" => $destParam],
            ["label" => "ℹ️ Travel Info & Tips", "action" => "info", "param" => "Budget Info"]
        ];

        return ["answer" => $answer, "options" => $options];
    }

    // ── 2. General Budget Query ──
    if (strpos($lower, 'budget') !== false || strpos($lower, 'cost') !== false || strpos($lower, 'money') !== false || strpos($lower, 'cheap') !== false) {
        $answer = "💰 **Smart Travel Budgeting Guide & Tips:**\n\n"
                . "Traveling on a budget is easy when you plan strategically! Here are the 3 tiers for Indian & regional travel:\n\n"
                . "🎒 **1. Backpacker Tier (₹1,000–₹1,800 / day):**\n"
                . "• Stay in verified social hostels (Zostel, goSTOPS) or clean guest houses.\n"
                . "• Travel by sleeper class train or state transport express buses.\n"
                . "• Eat at local messes, Udupi cafes, and bustling street food markets.\n\n"
                . "🏨 **2. Mid-Range Comfort (₹3,500–₹6,000 / day):**\n"
                . "• Stay in 3-star AC boutique hotels or private homestays with breakfast.\n"
                . "• Travel via AC 3-Tier train or rental self-drive cars.\n"
                . "• Enjoy a mix of seaside cafes, popular restaurants, and guided tours.\n\n"
                . "✨ **3. Premium Experience (₹8,000+ / day):**\n"
                . "• 4 to 5-star beachfront resorts, heritage palaces, or private villas.\n"
                . "• Flights and private chauffeured AC cabs for all sightseeing.\n\n"
                . "💡 **Top Tip:** Tap the **Set Budget** or **Hotels** options below to plan your trip step-by-step!";

        $options = [
            ["label" => "💰 Open Budget Tracker", "action" => "budget", "param" => "6000"],
            ["label" => "🏨 Browse Budget Hotels", "action" => "hotels", "param" => "Goa"],
            ["label" => "🎫 Check Ticket Fares", "action" => "tickets", "param" => "Goa"],
            ["label" => "ℹ️ Travel Info", "action" => "info", "param" => "Budget Info"]
        ];
        return ["answer" => $answer, "options" => $options];
    }

    // ── 3. Destination Queries ──
    if (strpos($lower, 'goa') !== false) {
        $answer = "🏖️ **Goa 3-Day Ultimate Beach & Culture Itinerary:**\n\n"
                . "📅 **Day 1: North Goa Coastal Charm & Sunsets**\n"
                . "• **Morning:** Visit 17th-century **Fort Aguada** for breathtaking Arabian sea views.\n"
                . "• **Afternoon:** Relax at Calangute & Baga beaches; try jet skiing or parasailing.\n"
                . "• **Evening:** Sunset cocktails & live music at Curlies or Cafe Mambo in Anjuna.\n\n"
                . "📅 **Day 2: Old Goa Heritage & Latin Quarter**\n"
                . "• **Morning:** Marvel at the **Basilica of Bom Jesus** and Se Cathedral in Old Goa.\n"
                . "• **Afternoon:** Stroll the pastel-colored Portuguese streets of **Fontainhas, Panjim**.\n"
                . "• **Evening:** 1-hour sunset cruise on the Mandovi River with Goan folk dances.\n\n"
                . "📅 **Day 3: Serene South Goa & Waterfalls**\n"
                . "• **Morning:** Day trip to majestic four-tiered **Dudhsagar Waterfalls**.\n"
                . "• **Evening:** Unwind on the pristine white sands of Palolem or Colva beach.\n\n"
                . "🍴 **Must-Try Dishes:** Goan Fish Curry Thali, Prawn Balchão, Bebinca cake.\n"
                . "☀️ **Best Season:** October to March for cool coastal breezes.";

        $options = [
            ["label" => "📍 View Goa Details", "action" => "place", "param" => "Goa"],
            ["label" => "🏨 Top Goa Hotels", "action" => "hotels", "param" => "Goa"],
            ["label" => "🌤️ Goa Live Weather", "action" => "weather", "param" => "Goa"],
            ["label" => "🎫 Book Tickets to Goa", "action" => "tickets", "param" => "Goa"],
            ["label" => "ℹ️ Goa Travel Info", "action" => "info", "param" => "Goa"]
        ];
        return ["answer" => $answer, "options" => $options];
    }

    if (strpos($lower, 'pondy') !== false || strpos($lower, 'pondicherry') !== false) {
        $answer = "🌊 **Pondicherry 3-Day Coastal & French Quarter Guide:**\n\n"
                . "📅 **Day 1: French Quarter Heritage & Promenade**\n"
                . "• **Morning:** Sunrise stroll along the famous **Promenade Rock Beach**.\n"
                . "• **Afternoon:** Explore colorful mustard-yellow colonial houses in **White Town**; visit French bakeries (Baker Street, Coromandel Cafe).\n"
                . "• **Evening:** Relax at Sri Aurobindo Ashram and browse local handicraft boutiques.\n\n"
                . "📅 **Day 2: Auroville & Golden Matrimandir**\n"
                . "• **Morning:** Cycle or scooter to the universal township of **Auroville**; view the iconic Golden Globe Matrimandir.\n"
                . "• **Evening:** Watch the golden sunset at Serenity Beach or quiet Bodhi Beach.\n\n"
                . "📅 **Day 3: Paradise Beach & Mangrove Boating**\n"
                . "• **Morning:** Take the scenic backwater ferry to isolated **Paradise Beach**.\n"
                . "• **Afternoon:** Chunnambar boat house water sports and local seafood lunch.\n\n"
                . "🍴 **Must-Try:** Freshly baked croissants, wood-fired pizza, and Creole seafood curry!";

        $options = [
            ["label" => "📍 View Pondicherry Details", "action" => "place", "param" => "Pondicherry"],
            ["label" => "🏨 Pondicherry Stays", "action" => "hotels", "param" => "Pondicherry"],
            ["label" => "🌤️ Live Weather", "action" => "weather", "param" => "Pondicherry"],
            ["label" => "🎫 Book Tickets", "action" => "tickets", "param" => "Pondicherry"],
            ["label" => "ℹ️ Pondicherry Travel Info", "action" => "info", "param" => "Pondicherry"]
        ];
        return ["answer" => $answer, "options" => $options];
    }

    if (strpos($lower, 'ooty') !== false) {
        $answer = "🌲 **Ooty (Queen of Hill Stations) 3-Day Guide:**\n\n"
                . "📅 **Day 1: Mountain Toy Train & Botanical Gardens**\n"
                . "• **Morning:** Ride the historic UNESCO **Nilgiri Mountain Railway** toy train from Mettupalayam or Coonoor.\n"
                . "• **Afternoon:** Walk through 55 acres of exotic flora at the Government Botanical Gardens.\n"
                . "• **Evening:** Paddle boat ride on misty Ooty Lake and taste local homemade chocolates.\n\n"
                . "📅 **Day 2: Peak Panoramas & Tea Estates**\n"
                . "• **Morning:** Climb to **Doddabetta Peak** (2,637m), the highest viewpoint in the Nilgiris.\n"
                . "• **Afternoon:** Tour the Doddabetta Tea Factory & Museum; enjoy freshly brewed hot cardamom tea.\n"
                . "• **Evening:** Sunset over pine forests at Wenlock Downs 9th Mile Shooting Point.\n\n"
                . "📅 **Day 3: Pykara Waterfalls & Glenmorgan**\n"
                . "• **Morning:** Speedboating on Pykara Lake and walking to cascading Pykara Falls.\n"
                . "• **Evening:** Shopping for Nilgiri Eucalyptus oil, spices, and bakery items in Charing Cross.\n\n"
                . "☕ **Must-Buy:** Ooty homemade dark chocolates, Silver Oak honey & Nilgiri green tea!";

        $options = [
            ["label" => "📍 View Ooty Details", "action" => "place", "param" => "Ooty"],
            ["label" => "🏨 Ooty Hill Stays", "action" => "hotels", "param" => "Ooty"],
            ["label" => "🌤️ Ooty Weather", "action" => "weather", "param" => "Ooty"],
            ["label" => "🎫 Book Tickets to Ooty", "action" => "tickets", "param" => "Ooty"],
            ["label" => "ℹ️ Ooty Travel Info", "action" => "info", "param" => "Ooty"]
        ];
        return ["answer" => $answer, "options" => $options];
    }

    if (strpos($lower, 'mahabalipuram') !== false) {
        $answer = "🏛️ **Mahabalipuram Coastal Heritage 2-Day Guide:**\n\n"
                . "📅 **Day 1: UNESCO Stone Temples & Ocean Waves**\n"
                . "• **Morning:** Visit the iconic 8th-century granite **Shore Temple** by the Bay of Bengal.\n"
                . "• **Afternoon:** Marvel at the giant monolithic rock carving of **Arjuna's Penance** and the monolithic **Five Rathas**.\n"
                . "• **Evening:** Touch the famous 250-ton gravity-defying **Krishna’s Butterball**; sunset at Mahabalipuram Beach.\n\n"
                . "📅 **Day 2: Surfing & Coastal Seafood**\n"
                . "• **Morning:** Take a beginner surfing or paddleboard lesson at Covelong/Kovalam beach.\n"
                . "• **Afternoon:** Fresh grilled coastal fish lunch at seaside shacks (Moonrakers, Santana).\n"
                . "• **Evening:** Visit the Madras Crocodile Bank trust on the East Coast Road (ECR).\n\n"
                . "💡 **Pro Tip:** Located just 1.5 hours from Chennai; great for weekend budget trips!";

        $options = [
            ["label" => "📍 View Mahabalipuram", "action" => "place", "param" => "Mahabalipuram"],
            ["label" => "🏨 Coastal Hotels", "action" => "hotels", "param" => "Mahabalipuram"],
            ["label" => "🎫 Book Tickets", "action" => "tickets", "param" => "Mahabalipuram"],
            ["label" => "ℹ️ Travel Info", "action" => "info", "param" => "Mahabalipuram"]
        ];
        return ["answer" => $answer, "options" => $options];
    }

    // ── 4. Packing Queries ──
    if (strpos($lower, 'pack') !== false) {
        $answer = "🎒 **Complete Travel Packing Checklist:**\n\n"
                . "📄 **1. Documents & Valuables:**\n"
                . "• Govt ID card (Aadhaar / Voter ID / Passport) & driver's license.\n"
                . "• Confirmed train/flight tickets & hotel booking confirmation vouchers.\n"
                . "• UPI-ready phone, physical ATM cards & emergency cash (₹2,000–₹3,000).\n\n"
                . "🔌 **2. Electronics:**\n"
                . "• Phone charger & fast-charging braided cable.\n"
                . "• High-capacity Power Bank (10,000mAh+) for sightseeing and trains.\n"
                . "• Earphones / AirPods with protective case.\n\n"
                . "👕 **3. Clothing & Footwear:**\n"
                . "• 3–4 light breathable cotton t-shirts, 2 pairs of versatile pants/trousers.\n"
                . "• 1 light windbreaker/sweater for AC transport or evening hill chills.\n"
                . "• Comfortable walking sneakers + 1 pair of waterproof slip-ons / flip-flops.\n\n"
                . "💊 **4. Health & Toiletries:**\n"
                . "• Travel-size sunscreen (SPF 50), insect repellent spray, wet wipes.\n"
                . "• Mini medicine pouch: Paracetamol, antacid, motion sickness tablets & Band-Aids.\n\n"
                . "💡 **Check out our interactive Packing List tab to tick off items in real-time!**";

        $options = [
            ["label" => "🎒 Open Interactive Packing List", "action" => "packing", "param" => ""],
            ["label" => "🌤️ Check Weather Forecast", "action" => "weather", "param" => "Goa"],
            ["label" => "💰 Set Trip Budget", "action" => "budget", "param" => "5000"],
            ["label" => "ℹ️ Travel Info & Tips", "action" => "info", "param" => "Packing Info"]
        ];
        return ["answer" => $answer, "options" => $options];
    }

    // ── 5. Hotel Queries ──
    if (strpos($lower, 'hotel') !== false || strpos($lower, 'stay') !== false || strpos($lower, 'resort') !== false) {
        $answer = "🏨 **Expert Hotel & Accommodation Booking Guide:**\n\n"
                . "Finding the right place to stay makes all the difference! Here is how to pick the best verified stays:\n\n"
                . "✨ **What to Look For:**\n"
                . "• **Location:** Pick stays within 1–2 km of major attractions or transit stations to save on taxis.\n"
                . "• **Guest Ratings:** Always select properties with **4.2★ or higher** and 100+ verified guest reviews.\n"
                . "• **Amenities:** Ensure high-speed WiFi, complimentary breakfast, 24/7 security, and AC rooms.\n\n"
                . "💳 **Price Estimates:**\n"
                . "• Budget Hostels / Homestays: ₹800 – ₹1,800 / night\n"
                . "• Boutique & 3-Star AC Hotels: ₹2,500 – ₹4,500 / night\n"
                . "• Luxury Beach Resorts: ₹6,500 – ₹15,000+ / night\n\n"
                . "👉 **Tap 'Browse All Hotels' below to book verified stays with instant confirmation!**";

        $options = [
            ["label" => "🏨 Browse All Hotels", "action" => "hotels", "param" => "Goa"],
            ["label" => "💰 Track Stay Budget", "action" => "budget", "param" => "4000"],
            ["label" => "🎫 Book Transit Tickets", "action" => "tickets", "param" => "Goa"],
            ["label" => "ℹ️ Hotel Booking Info", "action" => "info", "param" => "Hotel Info"]
        ];
        return ["answer" => $answer, "options" => $options];
    }

    // ── 6. Weather Queries ──
    if (strpos($lower, 'weather') !== false || strpos($lower, 'climate') !== false || strpos($lower, 'rain') !== false || strpos($lower, 'temp') !== false) {
        $answer = "🌤️ **Live Weather & Best Travel Seasons:**\n\n"
                . "Weather is the secret to a great vacation! Here is the seasonal breakdown across popular regions:\n\n"
                . "🍂 **Winter & Peak Season (October – March):**\n"
                . "• Ideal for coastal beaches (Goa, Pondicherry, Kerala) and heritage plains.\n"
                . "• Daytime temperatures hover between **24°C – 30°C** with low humidity and cool evenings.\n\n"
                . "☀️ **Summer (April – June):**\n"
                . "• Perfect for South Indian hill stations (Ooty, Kodaikanal, Coorg, Munnar, Yercaud) with refreshing **15°C – 22°C**.\n\n"
                . "🌧️ **Monsoon (July – September):**\n"
                . "• Lush green landscapes, misty mountain valleys, and roaring waterfalls (Dudhsagar, Jog Falls).\n\n"
                . "👉 **Tap 'Live Weather Forecast' below to see hourly and 7-day temperature trends!**";

        $options = [
            ["label" => "🌤️ Live Weather Forecast", "action" => "weather", "param" => "Goa"],
            ["label" => "🎒 Packing List for Weather", "action" => "packing", "param" => ""],
            ["label" => "🏨 View Cozy Stays", "action" => "hotels", "param" => "Goa"],
            ["label" => "ℹ️ Weather Info & Alerts", "action" => "info", "param" => "Weather Info"]
        ];
        return ["answer" => $answer, "options" => $options];
    }

    // ── 7. Default Rich Conversational Travel Guide ──
    $answer = "🌍 **Travel Buddy AI Concierge:**\n\n"
            . "I'm your personal travel buddy calibrated with real-time transit schedules, live hotel rates, weather forecasts, and custom itinerary planning!\n\n"
            . "✨ **Here is what I can help you with right now:**\n"
            . "• 💰 **Budget Calculations:** Tell me your budget (e.g. *'my budget is 6k'* or *'15k trip'*), and I will build an exact cost breakdown & itinerary!\n"
            . "• 🏖️ **Destination Guides:** Ask about Goa, Pondicherry, Ooty, Mahabalipuram, Tirupati, Kerala, or Mumbai!\n"
            . "• 🏨 **Hotel Stays:** Compare AC vs Non-AC verified rooms and book with 1-click confirmation.\n"
            . "• 🎒 **Smart Packing:** Generate instant checklists customized to your trip's weather.\n\n"
            . "👉 **Select any quick action option below to jump directly into your trip planning:**";

    $options = [
        ["label" => "💰 Plan ₹6,000 Trip", "action" => "budget", "param" => "6000"],
        ["label" => "🏖️ Explore Goa Beaches", "action" => "place", "param" => "Goa"],
        ["label" => "🏨 Browse Top Hotels", "action" => "hotels", "param" => "Goa"],
        ["label" => "🎫 Book Travel Tickets", "action" => "tickets", "param" => "Goa"],
        ["label" => "🎒 Packing Checklist", "action" => "packing", "param" => ""],
        ["label" => "ℹ️ Travel Info & Helpline", "action" => "info", "param" => "General Info"]
    ];

    return ["answer" => $answer, "options" => $options];
}
?>
