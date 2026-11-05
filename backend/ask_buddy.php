<?php
/**
 * Travel Buddy AI - Multi-Agent Travel Intelligence Engine
 * Modeled on the AutoGen Multi-Agent Architecture (lordlinus/travel-chatbot):
 * 
 * 1. SemanticRouterAgent: Analyzes intent, user context, and directs queries
 * 2. GroupChatManager (Trip Coordinator Agent): Synthesizes multi-domain plans
 * 3. BudgetSpecialistAgent (budget_planner): Financial allocations & daily burn rates
 * 4. HotelSpecialistAgent (hotel_booking): Simulated booking engine & accommodations
 * 5. TransitSpecialistAgent (flight_booking / transit_booking): Trains, flights & buses
 * 6. DestinationSpecialistAgent (destination_info): Landmarks, geocoordinates & climate
 * 7. ActivitySpecialistAgent (activities_booking): Adventures, water sports & tours
 * 8. CarRentalSpecialistAgent (car_rental): Scooters, self-drive rentals & cabs
 * 9. DefaultGreeterAgent (default_agent): Welcomes user with starter quick chips
 * 
 * Always emits structured AgentStructuredResponse:
 * - agent_type: string
 * - agent_name: string (badge label)
 * - data: structured domain model
 * - answer / reply: markdown formatted text
 * - options: interactive action pills for Web and Android apps
 */

require_once 'config.php';

// Retrieve input from JSON payload, POST, or GET
$raw = file_get_contents('php://input');
$json = !empty($raw) ? json_decode($raw, true) : [];

$question = trim($json['question'] ?? ($json['message'] ?? ($_POST['question'] ?? ($_POST['message'] ?? ($_GET['question'] ?? ($_GET['message'] ?? ''))))));
$userBudget = $json['budget'] ?? ($_POST['budget'] ?? null);
$userDest = $json['destination'] ?? ($_POST['destination'] ?? null);
$userDays = $json['days'] ?? ($_POST['days'] ?? null);

if (empty($question) && empty($userDest)) {
    echo json_encode([
        "status" => "error",
        "message" => "No question or destination specified."
    ]);
    exit;
}

// Instantiate Semantic Router and orchestrate agent execution
$router = new SemanticRouterAgent();
$response = $router->routeMessage($question, $userDest, $userBudget, $userDays);

echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
exit;


// =========================================================================
// 1. SEMANTIC ROUTER AGENT
// =========================================================================

class SemanticRouterAgent {
    public function routeMessage($question, $userDest = null, $userBudget = null, $userDays = null) {
        $q = strtolower($question);

        // 1. Detect Greetings & Salutations (default_agent)
        if ($this->isGreeting($q)) {
            $agent = new DefaultGreeterAgent();
            return $agent->handle($question);
        }

        // 2. Detect Specific Domain Inquiries
        $hasBudget = $this->hasBudgetIntent($q) || !empty($userBudget);
        $hasHotel = $this->hasHotelIntent($q);
        $hasTransit = $this->hasTransitIntent($q);
        $hasActivity = $this->hasActivityIntent($q);
        $hasCarRental = $this->hasCarRentalIntent($q);
        $hasDestinationInfo = $this->hasDestinationInfoIntent($q);
        $hasFullTripPlan = $this->hasFullTripPlanIntent($q);

        // Extract context entities
        $dest = detectDestination($question, $userDest);
        $budget = $userBudget ?: (parseBudgetAmount($question) ?: 6000);
        $days = $userDays ?: parseDurationDays($question);

        // Compound Request Check:
        // If the query asks for a full trip, or combines multiple domains (e.g. budget + hotel, plan + transit)
        $domainCount = ($hasBudget ? 1 : 0) + ($hasHotel ? 1 : 0) + ($hasTransit ? 1 : 0) + ($hasActivity ? 1 : 0) + ($hasDestinationInfo ? 1 : 0);

        if ($hasFullTripPlan || $domainCount >= 2 || (strpos($q, 'plan') !== false && ($hasBudget || !empty($dest)))) {
            $coordinator = new GroupChatManager();
            return $coordinator->coordinatePlan($question, $dest, $budget, $days);
        }

        // Single Domain Routing:
        if ($hasBudget) {
            $agent = new BudgetSpecialistAgent();
            return $agent->handle($question, $dest, $budget, $days);
        }

        if ($hasHotel) {
            $agent = new HotelSpecialistAgent();
            return $agent->handle($question, $dest, $budget, $days);
        }

        if ($hasTransit) {
            $agent = new TransitSpecialistAgent();
            return $agent->handle($question, $dest, $budget, $days);
        }

        if ($hasCarRental) {
            $agent = new CarRentalSpecialistAgent();
            return $agent->handle($question, $dest, $budget, $days);
        }

        if ($hasActivity) {
            $agent = new ActivitySpecialistAgent();
            return $agent->handle($question, $dest, $budget, $days);
        }

        if ($hasDestinationInfo) {
            $agent = new DestinationSpecialistAgent();
            return $agent->handle($question, $dest, $budget, $days);
        }

        // Default to Group Chat Coordinator for general travel questions
        $coordinator = new GroupChatManager();
        return $coordinator->coordinatePlan($question, $dest, $budget, $days);
    }

    private function isGreeting($text) {
        $greetings = ['hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening', 'who are you', 'what can you do', 'start', 'help me'];
        $clean = trim(preg_replace('/[^a-z\s]/', '', $text));
        return in_array($clean, $greetings);
    }

    private function hasBudgetIntent($text) {
        return preg_match('/\b(budget|cost|price|expense|cheap|affordable|\d+k|\d{4,6}|inr|rs|rupees|allocation)\b/i', $text);
    }

    private function hasHotelIntent($text) {
        return preg_match('/\b(hotel|resort|homestay|room|stay|rooms|booking|hostel|lodge|accommodation|checkin)\b/i', $text);
    }

    private function hasTransitIntent($text) {
        return preg_match('/\b(flight|fly|airline|plane|train|vande bharat|railway|irctc|bus|tickets?|transit|travel to|tickets booking)\b/i', $text);
    }

    private function hasActivityIntent($text) {
        return preg_match('/\b(activities|activity|adventure|scuba|surfing|water sports|boating|sightseeing|safari|things to do|tour)\b/i', $text);
    }

    private function hasCarRentalIntent($text) {
        return preg_match('/\b(car rental|rent car|rent a car|bike rental|rent bike|scooter|activa|cab|taxi|self-drive)\b/i', $text);
    }

    private function hasDestinationInfoIntent($text) {
        return preg_match('/\b(tell me about|about|weather|climate|best time|attractions|places to see|history of)\b/i', $text);
    }

    private function hasFullTripPlanIntent($text) {
        return preg_match('/\b(plan|trip|itinerary|vacation|holiday|getaway|weekend|full plan|tour plan)\b/i', $text);
    }
}


// =========================================================================
// 2. GROUP CHAT MANAGER (TRIP COORDINATOR AGENT)
// =========================================================================

class GroupChatManager {
    public function coordinatePlan($question, $dest, $budget, $days) {
        $catalog = getTravelCatalog();
        $data = $catalog[$dest] ?? generateDynamicCatalogData($dest, $days, $budget);
        $budgetBreakdown = calculateBudgetBreakdown($budget, $days, $dest);

        $plan = [
            "placeName" => $dest,
            "destination" => $dest,
            "noOfDays" => $days,
            "totalBudget" => $budget,
            "abouttheplace" => $data['abouttheplace'],
            "besttimetovisit" => $data['besttimetovisit'],
            "topplacestovisit" => $data['topplacestovisit'],
            "adventuresactivitiestodo" => $data['adventuresactivitiestodo'],
            "localcuisinerecommendations" => $data['localcuisinerecommendations'],
            "packingchecklist" => $data['packingchecklist'],
            "itinerary" => array_slice($data['itinerary'], 0, $days),
            "budgetBreakdown" => $budgetBreakdown
        ];

        $markdown = formatPlanToMarkdown($plan);
        $options = [
            ["label" => "🗺️ View on Map", "action" => "map", "param" => $dest],
            ["label" => "🏨 Recommended Hotels", "action" => "hotels", "param" => $dest],
            ["label" => "💰 Set ₹" . number_format($budget) . " in Budget", "action" => "budget", "param" => (string)$budget],
            ["label" => "🎒 Packing Checklist", "action" => "packing", "param" => $dest],
            ["label" => "🌤️ Live Weather", "action" => "weather", "param" => $dest],
            ["label" => "🎫 Book Tickets", "action" => "tickets", "param" => $dest],
            ["label" => "📋 Copy Itinerary", "action" => "copy_itinerary", "param" => $dest]
        ];

        return [
            "status" => "success",
            "agent_type" => "group_chat_manager",
            "agent_name" => "🤖 Trip Coordinator Agent",
            "data" => $plan,
            "answer" => $markdown,
            "reply" => $markdown,
            "options" => $options
        ];
    }
}


// =========================================================================
// 3. BUDGET SPECIALIST AGENT (budget_planner)
// =========================================================================

class BudgetSpecialistAgent {
    public function handle($question, $dest, $budget, $days) {
        $bb = calculateBudgetBreakdown($budget, $days, $dest);
        $formatted = "₹" . number_format($budget);
        $perNightStay = round($bb['stay']['amount'] / max(1, $days - 1));
        $perDayFood = round($bb['food']['amount'] / $days);

        $md = "💰 **Budget Specialist Analysis for {$dest} ({$formatted} Total)**\n\n"
            . "Here is your optimized, itemized financial allocation designed for a high-value {$days}-day trip to {$dest}:\n\n"
            . "• 🏨 **Stay Allocation (38%):** ₹" . number_format($bb['stay']['amount']) . "\n"
            . "  - Budget per night: ~₹" . number_format($perNightStay) . "/night for " . ($days - 1) . " nights.\n"
            . "  - Recommendation: Verified AC boutique homestay, hostel private room, or 3-star resort.\n\n"
            . "• 🚆 **Travel & Transit (22%):** ₹" . number_format($bb['transport']['amount']) . "\n"
            . "  - Roundtrip express train (Sleeper/3AC) or state luxury bus + local scooter rental (₹400/day).\n\n"
            . "• 🍲 **Food & Dining (25%):** ₹" . number_format($bb['food']['amount']) . "\n"
            . "  - Daily allowance: ~₹" . number_format($perDayFood) . "/day for authentic local messes, coastal seafood thalis & cafes.\n\n"
            . "• 🎟️ **Sightseeing & Excursions (10%):** ₹" . number_format($bb['activities']['amount']) . "\n"
            . "  - Entry tickets for historic monuments, beach ferries, museum passes, and water sports.\n\n"
            . "• 🛡️ **Emergency & Contingency Buffer (5%):** ₹" . number_format($bb['buffer']['amount']) . "\n"
            . "  - Packaged mineral water, snacks, medicine, and emergency backup.\n\n"
            . "💡 **Pro-Tip:** Tap **'Set {$formatted} in Budget'** below to instantly sync this allocation into your real-time Budget Tracker!";

        $options = [
            ["label" => "💰 Set {$formatted} in Budget", "action" => "budget", "param" => (string)$budget],
            ["label" => "🏨 Budget Hotels (~₹" . number_format($perNightStay) . "/nt)", "action" => "hotels", "param" => $dest],
            ["label" => "🎫 Book Tickets (~₹" . number_format($bb['transport']['amount']) . ")", "action" => "tickets", "param" => $dest],
            ["label" => "🗺️ Explore {$dest} on Map", "action" => "map", "param" => $dest],
            ["label" => "ℹ️ Travel & Expense Tips", "action" => "info", "param" => "Budget Guidelines"]
        ];

        return [
            "status" => "success",
            "agent_type" => "budget_planner",
            "agent_name" => "💰 Budget Specialist Agent",
            "data" => [
                "total_budget" => $budget,
                "destination" => $dest,
                "days" => $days,
                "breakdown" => $bb
            ],
            "answer" => $md,
            "reply" => $md,
            "options" => $options
        ];
    }
}


// =========================================================================
// 4. HOTEL SPECIALIST AGENT (hotel_booking)
// =========================================================================

class HotelSpecialistAgent {
    public function handle($question, $dest, $budget, $days) {
        $hotels = $this->getSimulatedHotels($dest, $budget, $days);
        $checkIn = date('Y-m-d', strtotime('+3 days'));
        $checkOut = date('Y-m-d', strtotime("+" . (3 + $days) . " days"));
        $bookingRef = "HT-" . rand(1000, 9999) . "-" . strtoupper(substr(preg_replace('/[^a-zA-Z]/', '', $dest), 0, 3));

        $md = "🏨 **Hotel Specialist Recommendations for {$dest}**\n\n"
            . "Here are verified, top-rated accommodations matching your stay in {$dest} (Check-in: **{$checkIn}**, Check-out: **{$checkOut}**):\n\n";

        foreach ($hotels as $h) {
            $md .= "• **{$h['name']}** ({$h['rating']}★ | {$h['type']})\n"
                 . "  - Tariff: ₹" . number_format($h['price_per_night']) . "/night (Total for " . ($days - 1) . " nights: **₹" . number_format($h['price_per_night'] * max(1, $days - 1)) . "**)\n"
                 . "  - Amenities: {$h['amenities']}\n"
                 . "  - Location: {$h['location']}\n\n";
        }

        $md .= "📋 **Simulated Reservation Code:** `{$bookingRef}`\n"
             . "💡 Select **'Browse Hotels'** below to reserve your room with instant booking confirmation!";

        $options = [
            ["label" => "🏨 Browse Hotels in {$dest}", "action" => "hotels", "param" => $dest],
            ["label" => "💰 Track Stay in Budget", "action" => "budget", "param" => (string)($hotels[0]['price_per_night'] * max(1, $days - 1))],
            ["label" => "🗺️ View Hotels on Map", "action" => "map", "param" => $dest],
            ["label" => "🎫 Book Transit Tickets", "action" => "tickets", "param" => $dest],
            ["label" => "ℹ️ Hotel Check-in Guidelines", "action" => "info", "param" => "Hotel Check-in"]
        ];

        return [
            "status" => "success",
            "agent_type" => "hotel_booking",
            "agent_name" => "🏨 Hotel Specialist Agent",
            "data" => [
                "city" => $dest,
                "check_in_date" => $checkIn,
                "check_out_date" => $checkOut,
                "booking_reference" => $bookingRef,
                "hotels" => $hotels
            ],
            "answer" => $md,
            "reply" => $md,
            "options" => $options
        ];
    }

    private function getSimulatedHotels($dest, $budget, $days) {
        $nightlyTarget = round(($budget * 0.38) / max(1, $days - 1));
        if ($nightlyTarget < 900) $nightlyTarget = 1200;

        return [
            [
                "name" => "Heritage Colonial Villa & Suites",
                "type" => "Boutique Heritage AC Stay",
                "price_per_night" => $nightlyTarget,
                "rating" => 4.8,
                "amenities" => "Free High-Speed Wi-Fi, Breakfast Included, Swimming Pool, 24/7 Security",
                "location" => "Central {$dest}, 500m from Promenade/Beach"
            ],
            [
                "name" => "Ocean Palms Resort & Spa",
                "type" => "Deluxe Sea-View Room",
                "price_per_night" => round($nightlyTarget * 1.25),
                "rating" => 4.6,
                "amenities" => "AC, Balcony with Sunset View, Multi-cuisine Restaurant, Travel Desk",
                "location" => "Coastline Highway, {$dest}"
            ],
            [
                "name" => "Green Haven Budget Guest House",
                "type" => "Standard AC Double Room",
                "price_per_night" => round($nightlyTarget * 0.75),
                "rating" => 4.3,
                "amenities" => "AC, Clean Linens, Hot Water Shower, Luggage Storage",
                "location" => "Near Railway Station / Market Square, {$dest}"
            ]
        ];
    }
}


// =========================================================================
// 5. TRANSIT SPECIALIST AGENT (flight_booking / transit_booking)
// =========================================================================

class TransitSpecialistAgent {
    public function handle($question, $dest, $budget, $days) {
        $bookingRef = "TR-" . rand(1000, 9999) . "-" . strtoupper(substr(preg_replace('/[^a-zA-Z]/', '', $dest), 0, 3));
        $transitOptions = $this->getSimulatedTransit($dest);

        $md = "🚆 **Transit & Booking Specialist Advisory for {$dest}**\n\n"
            . "Here are verified travel options, timings, and schedules connecting to **{$dest}**:\n\n";

        foreach ($transitOptions as $opt) {
            $md .= "• **{$opt['name']}** ({$opt['type']})\n"
                 . "  - Departure: {$opt['departure']} | Arrival: {$opt['arrival']} (Duration: {$opt['duration']})\n"
                 . "  - Fare: **₹" . number_format($opt['fare']) . "** ({$opt['class']})\n"
                 . "  - Availability: {$opt['availability']}\n\n";
        }

        $md .= "🎫 **Instant Transit Booking Reference:** `{$bookingRef}`\n"
             . "💡 Tap **'Book Tickets'** below to reserve your train or bus seats!";

        $options = [
            ["label" => "🎫 Book Tickets to {$dest}", "action" => "tickets", "param" => $dest],
            ["label" => "🏨 Browse Stays in {$dest}", "action" => "hotels", "param" => $dest],
            ["label" => "💰 Add Transit to Budget", "action" => "budget", "param" => (string)($transitOptions[0]['fare'] * 2)],
            ["label" => "🗺️ View Route on Map", "action" => "map", "param" => $dest],
            ["label" => "ℹ️ Railway Security (139)", "action" => "info", "param" => "Transit Security"]
        ];

        return [
            "status" => "success",
            "agent_type" => "transit_booking",
            "agent_name" => "🚆 Transit & Booking Specialist",
            "data" => [
                "destination" => $dest,
                "booking_reference" => $bookingRef,
                "transit_options" => $transitOptions
            ],
            "answer" => $md,
            "reply" => $md,
            "options" => $options
        ];
    }

    private function getSimulatedTransit($dest) {
        return [
            [
                "name" => "Vande Bharat / Express Special",
                "type" => "Superfast AC Express",
                "departure" => "06:15 AM",
                "arrival" => "10:45 AM",
                "duration" => "4h 30m",
                "class" => "AC Chair Car / 3AC",
                "fare" => 850,
                "availability" => "Available (RAC/Confirmed)"
            ],
            [
                "name" => "State Express Luxury Sleeper",
                "type" => "Multi-Axle Volvo AC Bus",
                "departure" => "10:30 PM (Overnight)",
                "arrival" => "05:45 AM",
                "duration" => "7h 15m",
                "class" => "AC Sleeper Berth",
                "fare" => 680,
                "availability" => "14 Berths Available"
            ],
            [
                "name" => "Regional Intercity Fast Passenger",
                "type" => "Budget Intercity Train",
                "departure" => "01:20 PM",
                "arrival" => "06:40 PM",
                "duration" => "5h 20m",
                "class" => "Second Seating / Sleeper",
                "fare" => 220,
                "availability" => "Seats Available"
            ]
        ];
    }
}


// =========================================================================
// 6. DESTINATION SPECIALIST AGENT (destination_info)
// =========================================================================

class DestinationSpecialistAgent {
    public function handle($question, $dest, $budget, $days) {
        $catalog = getTravelCatalog();
        $data = $catalog[$dest] ?? generateDynamicCatalogData($dest, $days, $budget);

        $md = "🌍 **Destination Specialist Guide: {$dest}**\n\n"
            . "📖 **About {$dest}:**\n{$data['abouttheplace']}\n\n"
            . "🌤️ **Climate & Best Time to Visit:**\n{$data['besttimetovisit']}\n\n"
            . "📍 **Must-Visit Landmarks & Coordinates:**\n";

        foreach ($data['topplacestovisit'] as $spot) {
            $lat = $spot['coordinates']['lat'] ?? '';
            $lng = $spot['coordinates']['lng'] ?? '';
            $coordStr = ($lat && $lng) ? " `[{$lat}, {$lng}]`" : "";
            $md .= "• **{$spot['name']}** ({$spot['type']}){$coordStr}\n";
        }

        $md .= "\n🍲 **Culinary Highlights & Eateries:**\n";
        foreach ($data['localcuisinerecommendations'] as $dish) {
            $md .= "• {$dish}\n";
        }

        $md .= "\n💡 Tap **'View on Map'** to open interactive coordinates or check **'Live Weather'**!";

        $options = [
            ["label" => "🗺️ View on Map", "action" => "map", "param" => $dest],
            ["label" => "🌤️ Live Weather", "action" => "weather", "param" => $dest],
            ["label" => "🏨 Recommended Hotels", "action" => "hotels", "param" => $dest],
            ["label" => "🎫 Book Tickets to {$dest}", "action" => "tickets", "param" => $dest],
            ["label" => "🎒 Packing Checklist", "action" => "packing", "param" => $dest]
        ];

        return [
            "status" => "success",
            "agent_type" => "destination_info",
            "agent_name" => "🌍 Destination Specialist Agent",
            "data" => [
                "city" => $dest,
                "overview" => $data['abouttheplace'],
                "best_time" => $data['besttimetovisit'],
                "landmarks" => $data['topplacestovisit']
            ],
            "answer" => $md,
            "reply" => $md,
            "options" => $options
        ];
    }
}


// =========================================================================
// 7. ACTIVITY SPECIALIST AGENT (activities_booking)
// =========================================================================

class ActivitySpecialistAgent {
    public function handle($question, $dest, $budget, $days) {
        $catalog = getTravelCatalog();
        $data = $catalog[$dest] ?? generateDynamicCatalogData($dest, $days, $budget);

        $md = "🏄 **Activity & Adventure Specialist: Top Experiences in {$dest}**\n\n"
            . "Here are curated excursions and adventure activities to elevate your time in {$dest}:\n\n";

        foreach ($data['adventuresactivitiestodo'] as $idx => $act) {
            $md .= ($idx + 1) . ". **{$act}**\n";
        }

        $md .= "\n💡 Select any option below to view activity coordinates or plan accommodation!";

        $options = [
            ["label" => "🗺️ Activity Locations on Map", "action" => "map", "param" => $dest],
            ["label" => "🏨 Stays Near Activities", "action" => "hotels", "param" => $dest],
            ["label" => "💰 Plan Activity Budget", "action" => "budget", "param" => (string)($budget ?: 6000)],
            ["label" => "🎒 Packing Gear List", "action" => "packing", "param" => $dest],
            ["label" => "ℹ️ Adventure Safety Tips", "action" => "info", "param" => "Adventure Safety"]
        ];

        return [
            "status" => "success",
            "agent_type" => "activities_booking",
            "agent_name" => "🏄 Activity & Adventure Specialist",
            "data" => [
                "destination" => $dest,
                "activities" => $data['adventuresactivitiestodo']
            ],
            "answer" => $md,
            "reply" => $md,
            "options" => $options
        ];
    }
}


// =========================================================================
// 8. CAR & SCOOTER RENTAL SPECIALIST AGENT (car_rental)
// =========================================================================

class CarRentalSpecialistAgent {
    public function handle($question, $dest, $budget, $days) {
        $bookingRef = "CR-" . rand(1000, 9999) . "-" . strtoupper(substr(preg_replace('/[^a-zA-Z]/', '', $dest), 0, 3));
        $vehicles = [
            [
                "type" => "Gearless Scooter (Honda Activa 6G)",
                "tariff" => 450,
                "fuel" => "Petrol (Mileage: ~45 km/l)",
                "deposit" => "₹1,000 refundable + Original Govt ID"
            ],
            [
                "type" => "Royal Enfield Classic 350 / Himalayan",
                "tariff" => 900,
                "fuel" => "Petrol (Helmet & lock included)",
                "deposit" => "₹2,000 refundable + DL"
            ],
            [
                "type" => "Self-Drive AC Hatchback (Swift / i20)",
                "tariff" => 1600,
                "fuel" => "Petrol / Diesel (Unlimited km)",
                "deposit" => "₹3,000 refundable"
            ]
        ];

        $md = "🚗 **Car & Scooter Rental Specialist for {$dest}**\n\n"
            . "Here are verified, self-drive rental options available in {$dest}:\n\n";

        foreach ($vehicles as $v) {
            $md .= "• **{$v['type']}**\n"
                 . "  - Daily Tariff: **₹" . number_format($v['tariff']) . "/day**\n"
                 . "  - Specs: {$v['fuel']}\n"
                 . "  - Security Deposit: {$v['deposit']}\n\n";
        }

        $md .= "📋 **Pre-Approved Rental Reference:** `{$bookingRef}`\n"
             . "💡 Driving license (DL) and valid original government photo ID required at pick-up.";

        $options = [
            ["label" => "🛵 Rent Scooter (~₹450/day)", "action" => "hotels", "param" => $dest],
            ["label" => "💰 Add Rental to Budget", "action" => "budget", "param" => (string)(450 * $days)],
            ["label" => "🗺️ View Roads on Map", "action" => "map", "param" => $dest],
            ["label" => "ℹ️ Rental Terms & Guidelines", "action" => "info", "param" => "Rental Rules"]
        ];

        return [
            "status" => "success",
            "agent_type" => "car_rental",
            "agent_name" => "🚗 Car & Scooter Rental Specialist",
            "data" => [
                "destination" => $dest,
                "booking_reference" => $bookingRef,
                "vehicles" => $vehicles
            ],
            "answer" => $md,
            "reply" => $md,
            "options" => $options
        ];
    }
}


// =========================================================================
// 9. DEFAULT GREETER AGENT (default_agent)
// =========================================================================

class DefaultGreeterAgent {
    public function handle($question) {
        $md = "🌟 **Hello, Adventurer! Welcome to Travel Buddy AI.** 🌍\n\n"
            . "I'm your intelligent multi-agent travel concierge, modeled on the AutoGen Multi-Agent Architecture. Here is how my specialist team assists your journey:\n\n"
            . "• 💰 **Budget Specialist Agent:** Itemized expense allocation, hotel room rates & transit costs.\n"
            . "• 🏨 **Hotel Specialist Agent:** Verified boutique stays, resort reviews & reservation codes.\n"
            . "• 🚆 **Transit & Booking Specialist:** Flight, express train (Vande Bharat) & bus tickets.\n"
            . "• 🌍 **Destination Specialist Agent:** Climate, best travel seasons & GPS coordinates.\n"
            . "• 🏄 **Activity Specialist Agent:** Adventure sports, boat ferries, scuba & food trails.\n"
            . "• 🤖 **Trip Coordinator Agent:** Multi-agent synthesis for complete day-by-day itineraries.\n\n"
            . "How can my specialist team assist you today?";

        $options = [
            ["label" => "💰 Plan ₹6,000 Trip", "action" => "prompt", "param" => "my budget is 6k"],
            ["label" => "🏖️ Explore Goa 3-Day Trip", "action" => "prompt", "param" => "plan a 3-day trip to Goa"],
            ["label" => "🏨 Browse Top Hotels", "action" => "hotels", "param" => "Goa"],
            ["label" => "🎫 Book Tickets", "action" => "tickets", "param" => "Pondicherry"],
            ["label" => "ℹ️ Travel & Emergency Info", "action" => "info", "param" => "General Info"]
        ];

        return [
            "status" => "success",
            "agent_type" => "default_agent",
            "agent_name" => "🌟 Travel Buddy Concierge",
            "data" => [
                "greeting" => "Welcome to Travel Buddy AI"
            ],
            "answer" => $md,
            "reply" => $md,
            "options" => $options
        ];
    }
}


// =========================================================================
// HELPER FUNCTIONS & CATALOG
// =========================================================================

function parseBudgetAmount($text) {
    if (empty($text)) return null;
    if (preg_match('/(?:budget\s*(?:is|of|around|:)?\s*|(?:rs\.?|inr|₹)\s*)(\d+)\s*(k|thousand|l|lakh)?/i', $text, $m)) {
        $num = (int)$m[1];
        $unit = strtolower($m[2] ?? '');
        if ($unit === 'k' || $unit === 'thousand') return $num * 1000;
        if ($unit === 'l' || $unit === 'lakh') return $num * 100000;
        return $num;
    }
    if (preg_match('/\b(\d+)\s*k\b/i', $text, $m)) {
        return (int)$m[1] * 1000;
    }
    if (preg_match('/\b(\d{3,6})\b/', $text, $m)) {
        $val = (int)$m[1];
        if ($val >= 500 && $val <= 500000) return $val;
    }
    return null;
}

function parseDurationDays($text) {
    if (empty($text)) return 3;
    if (preg_match('/(\d+)\s*(?:day|days|d\b)/i', $text, $m)) {
        $d = (int)$m[1];
        if ($d >= 1 && $d <= 14) return $d;
    }
    if (preg_match('/(?:weekend|2\s*days)/i', $text)) return 2;
    if (preg_match('/(?:1\s*week|7\s*days)/i', $text)) return 7;
    return 3;
}

function detectDestination($text, $explicitDest = null) {
    if (!empty($explicitDest)) return trim($explicitDest);
    $q = strtolower($text);

    $destinations = [
        'pondy' => 'Pondicherry',
        'pondicherry' => 'Pondicherry',
        'puducherry' => 'Pondicherry',
        'goa' => 'Goa',
        'ooty' => 'Ooty',
        'nilgiri' => 'Ooty',
        'coonoor' => 'Ooty',
        'mahabalipuram' => 'Mahabalipuram',
        'mamallapuram' => 'Mahabalipuram',
        'nellore' => 'Nellore',
        'mypadu' => 'Nellore',
        'pulicat' => 'Nellore',
        'tirupati' => 'Tirupati',
        'chandragiri' => 'Tirupati',
        'kerala' => 'Kerala',
        'munnar' => 'Kerala',
        'alleppey' => 'Kerala',
        'kochi' => 'Kerala',
        'manali' => 'Manali',
        'shimla' => 'Manali',
        'himachal' => 'Manali',
        'jaipur' => 'Jaipur',
        'rajasthan' => 'Jaipur',
        'udaipur' => 'Jaipur',
        'mumbai' => 'Mumbai',
        'bombay' => 'Mumbai',
        'coorg' => 'Coorg',
        'bangalore' => 'Bangalore',
        'bengaluru' => 'Bangalore',
        'hampi' => 'Hampi',
        'paris' => 'Paris',
        'dubai' => 'Dubai',
        'tokyo' => 'Tokyo',
        'bali' => 'Bali',
        'singapore' => 'Singapore',
        'london' => 'London',
        'agra' => 'Agra',
        'delhi' => 'Delhi',
        'varanasi' => 'Varanasi',
        'mysore' => 'Mysore',
        'mysuru' => 'Mysore'
    ];

    foreach ($destinations as $keyword => $canonical) {
        if (strpos($q, $keyword) !== false) {
            return $canonical;
        }
    }

    if (preg_match('/(?:trip\s+to|visit|explore|travel\s+to|plan\s+(?:a\s+)?(?:trip\s+to\s+)?)\s*([a-zA-Z\s]{3,20})/i', $text, $m)) {
        $extracted = trim($m[1]);
        $extracted = preg_replace('/\b(for|with|in|under|on|budget|days?)\b.*/i', '', $extracted);
        $extracted = trim($extracted);
        if (strlen($extracted) >= 3) {
            return ucwords(strtolower($extracted));
        }
    }

    return 'Pondicherry';
}

function calculateBudgetBreakdown($total, $days, $dest) {
    $stayPct = 0.38;
    $foodPct = 0.25;
    $transitPct = 0.22;
    $activitiesPct = 0.10;
    
    $stayAmt = round($total * $stayPct);
    $foodAmt = round($total * $foodPct);
    $transitAmt = round($total * $transitPct);
    $actAmt = round($total * $activitiesPct);
    $bufferAmt = $total - ($stayAmt + $foodAmt + $transitAmt + $actAmt);

    $perNight = round($stayAmt / max(1, $days - 1));
    $perDayFood = round($foodAmt / $days);

    return [
        "total" => $total,
        "days" => $days,
        "stay" => [
            "amount" => $stayAmt,
            "description" => "AC boutique stay or verified guest house (~₹" . number_format($perNight) . "/night for " . ($days - 1) . " nights)"
        ],
        "transport" => [
            "amount" => $transitAmt,
            "description" => "Roundtrip express train/bus + local auto/scooter rental"
        ],
        "food" => [
            "amount" => $foodAmt,
            "description" => "Local cafes, authentic coastal/regional thalis (~₹" . number_format($perDayFood) . "/day)"
        ],
        "activities" => [
            "amount" => $actAmt,
            "description" => "Monument entry tickets, boating, water sports & bicycle rentals"
        ],
        "buffer" => [
            "amount" => $bufferAmt,
            "description" => "Emergency contingency, mineral water, snacks & souvenirs"
        ]
    ];
}

function formatPlanToMarkdown($plan) {
    $dest = $plan['destination'] ?? ($plan['placeName'] ?? 'Destination');
    $days = $plan['noOfDays'] ?? count($plan['itinerary'] ?? []);
    $budget = $plan['totalBudget'] ?? ($plan['budgetBreakdown']['total'] ?? 6000);
    $formattedBudget = "₹" . number_format($budget);

    $md = "🌟 **{$dest} {$days}-Day Travel Plan (Budget: {$formattedBudget})**\n\n";
    $md .= "📖 **About {$dest}:**\n" . $plan['abouttheplace'] . "\n\n";
    $md .= "🌤️ **Best Time to Visit:** " . $plan['besttimetovisit'] . "\n\n";

    $md .= "📅 **Interactive {$days}-Day Itinerary:**\n\n";
    if (!empty($plan['itinerary'])) {
        foreach ($plan['itinerary'] as $idx => $day) {
            $dayTitle = $day['title'] ?? ("Day " . ($idx + 1));
            $md .= "🗓️ **{$dayTitle}**\n";

            if (!empty($day['activities']['morning'])) {
                $md .= "• 🌅 **Morning:**\n";
                foreach ($day['activities']['morning'] as $act) {
                    $item = $act['itineraryItem'] ?? '';
                    $desc = $act['briefDescription'] ?? '';
                    $md .= "  - **{$item}:** {$desc}\n";
                }
            }

            if (!empty($day['activities']['afternoon'])) {
                $md .= "• ☀️ **Afternoon:**\n";
                foreach ($day['activities']['afternoon'] as $act) {
                    $item = $act['itineraryItem'] ?? '';
                    $desc = $act['briefDescription'] ?? '';
                    $md .= "  - **{$item}:** {$desc}\n";
                }
            }

            if (!empty($day['activities']['evening'])) {
                $md .= "• 🌆 **Evening:**\n";
                foreach ($day['activities']['evening'] as $act) {
                    $item = $act['itineraryItem'] ?? '';
                    $desc = $act['briefDescription'] ?? '';
                    $md .= "  - **{$item}:** {$desc}\n";
                }
            }
            $md .= "\n";
        }
    }

    if (!empty($plan['topplacestovisit'])) {
        $md .= "📍 **Top Places to Visit & Landmarks:**\n";
        foreach ($plan['topplacestovisit'] as $spot) {
            $name = $spot['name'] ?? '';
            $lat = $spot['coordinates']['lat'] ?? null;
            $lng = $spot['coordinates']['lng'] ?? null;
            $coordStr = ($lat && $lng) ? " [{$lat}, {$lng}]" : "";
            $type = isset($spot['type']) ? " ({$spot['type']})" : "";
            $md .= "• **{$name}**{$type}{$coordStr}\n";
        }
        $md .= "\n";
    }

    if (!empty($plan['adventuresactivitiestodo'])) {
        $md .= "🏖️ **Top Adventure Activities:**\n";
        foreach ($plan['adventuresactivitiestodo'] as $adv) {
            $md .= "• {$adv}\n";
        }
        $md .= "\n";
    }

    if (!empty($plan['localcuisinerecommendations'])) {
        $md .= "🍲 **Local Cuisine Recommendations & Foodie Hotspots:**\n";
        foreach ($plan['localcuisinerecommendations'] as $dish) {
            $md .= "• {$dish}\n";
        }
        $md .= "\n";
    }

    if (!empty($plan['budgetBreakdown'])) {
        $bb = $plan['budgetBreakdown'];
        $md .= "💰 **Itemized Budget Breakdown ({$formattedBudget}):**\n"
             . "• 🏨 **Stay ({$days} Days):** ₹" . number_format($bb['stay']['amount']) . " — " . $bb['stay']['description'] . "\n"
             . "• 🚆 **Travel & Transit:** ₹" . number_format($bb['transport']['amount']) . " — " . $bb['transport']['description'] . "\n"
             . "• 🍲 **Food & Dining:** ₹" . number_format($bb['food']['amount']) . " — " . $bb['food']['description'] . "\n"
             . "• 🎟️ **Sightseeing & Activities:** ₹" . number_format($bb['activities']['amount']) . " — " . $bb['activities']['description'] . "\n"
             . "• 🛡️ **Emergency Buffer:** ₹" . number_format($bb['buffer']['amount']) . " — " . $bb['buffer']['description'] . "\n\n";
    }

    if (!empty($plan['packingchecklist'])) {
        $md .= "🎒 **Tailored Packing Checklist:**\n";
        foreach ($plan['packingchecklist'] as $item) {
            $md .= "• ✓ {$item}\n";
        }
        $md .= "\n";
    }

    $md .= "💡 **Next Steps:** Tap any action option below to view spots on the live interactive map, reserve verified hotels, or configure this plan into your Budget Tracker!";

    return $md;
}

function getTravelCatalog() {
    return [
        'Pondicherry' => [
            'abouttheplace' => "Pondicherry (Puducherry) is an enchanting coastal union territory nestled on India's southeast Coromandel Coast. Renowned for its distinctive French colonial heritage, bougainvillea-draped mustard villas, tranquil tree-lined boulevards in White Town, and the peaceful global township of Auroville, it offers an irresistible blend of bohemian beaches, chic cafes, and spiritual serenity.",
            'besttimetovisit' => "October to March (Delightful 22°C - 30°C coastal breeze with minimal rainfall)",
            'topplacestovisit' => [
                ['name' => 'Promenade Rock Beach', 'coordinates' => ['lat' => 11.9338, 'lng' => 79.8358], 'type' => 'Scenic Coastal Boardwalk'],
                ['name' => 'White Town (French Quarter)', 'coordinates' => ['lat' => 11.9310, 'lng' => 79.8335], 'type' => 'Colonial Heritage & Architecture'],
                ['name' => 'Auroville & Matrimandir', 'coordinates' => ['lat' => 12.0070, 'lng' => 79.8106], 'type' => 'Universal Spiritual Township'],
                ['name' => 'Paradise Beach & Chunnambar', 'coordinates' => ['lat' => 11.8847, 'lng' => 79.8078], 'type' => 'Golden Sand Beach & Backwaters'],
                ['name' => 'Sri Aurobindo Ashram', 'coordinates' => ['lat' => 11.9366, 'lng' => 79.8344], 'type' => 'Meditation & Spiritual Sanctuary'],
                ['name' => 'Serenity Beach', 'coordinates' => ['lat' => 11.9702, 'lng' => 79.8432], 'type' => 'Surfing & Rocky Breakwaters']
            ],
            'adventuresactivitiestodo' => [
                "Scuba diving and coral reef exploration at Temple Reef, Pondicherry",
                "Beginner surfing lessons with certified instructors at Kallialay Surf School, Serenity Beach",
                "Scenic backwater speedboating and banana boat rides at Chunnambar Boat House",
                "Vintage bicycle heritage ride through the mustard-yellow colonial lanes of White Town",
                "Sunrise paddleboarding and mangrove kayaking in Ariyankuppam backwaters"
            ],
            'localcuisinerecommendations' => [
                "French Baguettes, Almond Croissants & Café au Lait at Baker Street & Cafe des Arts",
                "Authentic Pondicherry Creole Prawn Curry with steamed rice at Carte Blanche",
                "Artisanal Wood-Fired Neapolitan Pizza at Cafe Xtasi",
                "Ghee Roast Podi Dosa & Filter Kaapi at historic Surguru Restaurant",
                "Fresh grilled coastal calamari and spicy butter garlic crab at seaside shacks"
            ],
            'packingchecklist' => [
                "Govt photo ID (Aadhaar or Passport) & hotel booking confirmations",
                "Breathable cotton linen shirts, lightweight shorts & swimwear",
                "Sunscreen lotion (SPF 50+), UV-protective sunglasses & wide-brim hat",
                "Slip-resistant sandals or water shoes for walking on rocky beaches",
                "10,000mAh Power bank, universal wall charger & waterproof phone pouch",
                "Personal mini medical kit, mosquito repellent & electrolyte packets (ORS)"
            ],
            'itinerary' => [
                [
                    'title' => 'Day 1: French Quarter Heritage, Promenade Walk & Sunset Cafes',
                    'activities' => [
                        'morning' => [
                            ['itineraryItem' => 'Sunrise Stroll at Promenade Beach', 'briefDescription' => 'Catch breathtaking pastel dawn skies along the 1.5km sea-facing promenade without vehicle traffic.'],
                            ['itineraryItem' => 'Heritage Breakfast at Baker Street', 'briefDescription' => 'Savor flaky French butter croissants, pain au chocolat, and freshly brewed cafe au lait in White Town.']
                        ],
                        'afternoon' => [
                            ['itineraryItem' => 'Colonial Architecture & Boutique Tour', 'briefDescription' => 'Stroll amidst vibrant mustard-yellow villas, bougainvillea gates, and visit the peaceful Sri Aurobindo Ashram.'],
                            ['itineraryItem' => 'Artisanal Pizza Lunch at Cafe Xtasi', 'briefDescription' => 'Enjoy giant crispy wood-fired pizza and refreshing iced teas at Pondicherry\'s most famous pizzeria.']
                        ],
                        'evening' => [
                            ['itineraryItem' => 'Sunset at Serenity Beach', 'briefDescription' => 'Watch crashing waves along the rocky breakwater boulders and enjoy live acoustic music at beachfront cafes.']
                        ]
                    ]
                ],
                [
                    'title' => 'Day 2: Auroville Township, Matrimandir & Crafts Village',
                    'activities' => [
                        'morning' => [
                            ['itineraryItem' => 'Scooter Ride to Auroville', 'briefDescription' => 'Ride through lush green canopies to the universal township and visit the iconic golden sphere Matrimandir.'],
                            ['itineraryItem' => 'Organic Farm Breakfast', 'briefDescription' => 'Enjoy organic sourdough bread, homemade cheese, and passionfruit juice at Auroville Bakery.']
                        ],
                        'afternoon' => [
                            ['itineraryItem' => 'Auroville Visitors Centre & Boutiques', 'briefDescription' => 'Shop for handmade incense, spirulina, artisanal pottery, and hand-woven garments.'],
                            ['itineraryItem' => 'Creole Seafood Lunch at Carte Blanche', 'briefDescription' => 'Taste authentic French-Tamil fusion cuisine featuring coconut-infused tiger prawns and fresh herbs.']
                        ],
                        'evening' => [
                            ['itineraryItem' => 'Promenade Rock Beach Night Stroll', 'briefDescription' => 'Enjoy the cool sea breeze, taste local street sundal and ice cream near the French War Memorial.']
                        ]
                    ]
                ],
                [
                    'title' => 'Day 3: Paradise Beach Ferry, Backwaters & Souvenirs',
                    'activities' => [
                        'morning' => [
                            ['itineraryItem' => 'Chunnambar Backwater Ferry', 'briefDescription' => 'Take the scenic 20-minute boat ride across mangrove lagoons to the pristine, golden sands of Paradise Beach.'],
                            ['itineraryItem' => 'Water Sports & Beach Football', 'briefDescription' => 'Enjoy jet skiing, banana rides, or relaxing under thatched palm huts with fresh tender coconut.']
                        ],
                        'afternoon' => [
                            ['itineraryItem' => 'Seafood Shack Lunch at Chunnambar', 'briefDescription' => 'Feast on freshly caught grilled sea bass, calamari fry, and lemon rice.'],
                            ['itineraryItem' => 'Mission Street Souvenir Shopping', 'briefDescription' => 'Browse local leather goods, handmade paper at Aurobindo Paper Factory, and aromatic essential oils.']
                        ],
                        'evening' => [
                            ['itineraryItem' => 'Farewell Dinner at Coromandel Cafe', 'briefDescription' => 'Celebrate an unforgettable getaway with signature mocktails, pasta, and dark chocolate mousse in a colonial courtyard.']
                        ]
                    ]
                ]
            ]
        ],

        'Goa' => [
            'abouttheplace' => "Goa is India's premier coastal haven stretching along the Arabian Sea on the Konkan coast. Celebrated worldwide for its sun-kissed beaches, Portuguese colonial cathedrals, dramatic sea forts, vibrant spice plantations, lively flea markets, and world-class seafood, Goa delivers an unmatched combination of tropical relaxation and high-octane adventure.",
            'besttimetovisit' => "October to April (Pleasant 24°C - 31°C coastal breezes and lively beach shacks)",
            'topplacestovisit' => [
                ['name' => 'Baga & Calangute Beach', 'coordinates' => ['lat' => 15.5553, 'lng' => 73.7517], 'type' => 'Water Sports & Beach Shacks'],
                ['name' => 'Fort Aguada & Lighthouse', 'coordinates' => ['lat' => 15.4926, 'lng' => 73.7737], 'type' => '17th-Century Portuguese Coastal Fort'],
                ['name' => 'Basilica of Bom Jesus', 'coordinates' => ['lat' => 15.5009, 'lng' => 73.9116], 'type' => 'UNESCO World Heritage Church'],
                ['name' => 'Fontainhas Latin Quarter', 'coordinates' => ['lat' => 15.4989, 'lng' => 73.8315], 'type' => 'Pastel Colonial Streetscape'],
                ['name' => 'Dudhsagar Waterfalls', 'coordinates' => ['lat' => 15.3144, 'lng' => 74.3143], 'type' => 'Majestic Four-Tier Waterfall'],
                ['name' => 'Palolem Beach', 'coordinates' => ['lat' => 15.0100, 'lng' => 74.0232], 'type' => 'Crescent Bay & Beach Cabanas']
            ],
            'adventuresactivitiestodo' => [
                "Parasailing, jet skiing, and bumper boat rides at Calangute and Baga beaches",
                "Full-day scuba diving and dolphin spotting boat expedition at Grande Island",
                "Off-road 4x4 Jeep jungle safari and trek to the misty Dudhsagar Waterfalls",
                "Sunset sailing cruise with live Goan folk music along the Mandovi River",
                "Kayaking through serene mangrove lagoons in Morjim and Chapora River"
            ],
            'localcuisinerecommendations' => [
                "Authentic Goan Fish Curry Thali with Kingfish, Sol Kadi, and Kokum at Ritz Classic",
                "Spicy Prawn Balchão and Pork Vindaloo at historic Martin's Corner",
                "Traditional multi-layered Goan Bebinca cake and Dodol dessert",
                "Rawa-fried Kingfish and Butter Garlic Crab at Fisherman's Wharf",
                "Chilled coconut water and tropical mocktails by the beach shacks"
            ],
            'packingchecklist' => [
                "Govt photo ID (Aadhaar or Passport), driving license for bike rentals",
                "Lightweight cotton t-shirts, beach shorts, linen shirts & swimwear",
                "High-SPF sunscreen (SPF 50+), polarized sunglasses & sun hat",
                "Waterproof phone dry bag & lightweight quick-dry microfiber towel",
                "Comfortable flip-flops, walking sneakers & mosquito repellent cream",
                "Personal medicines, anti-motion sickness pills & rehydration electrolytes"
            ],
            'itinerary' => [
                [
                    'title' => 'Day 1: North Goa Coastal Charm, Fort Aguada & Sunset Shacks',
                    'activities' => [
                        'morning' => [
                            ['itineraryItem' => 'Fort Aguada & Lighthouse', 'briefDescription' => 'Explore the 1612 Portuguese bastion and enjoy 360-degree panoramic ocean views over Sinquerim beach.'],
                            ['itineraryItem' => 'Breakfast at Infantaria Bakery', 'briefDescription' => 'Feast on freshly baked croissants, Goan sausages, and espresso in Calangute.']
                        ],
                        'afternoon' => [
                            ['itineraryItem' => 'Water Sports at Baga Beach', 'briefDescription' => 'Soar high with parasailing and zip across waves on a high-speed jet ski.'],
                            ['itineraryItem' => 'Beach Shack Lunch at Brittos', 'briefDescription' => 'Taste fresh calamari rings, prawn curry, and chilled beverages right on the sand.']
                        ],
                        'evening' => [
                            ['itineraryItem' => 'Sunset at Anjuna & Curlies', 'briefDescription' => 'Watch the golden sun sink into the Arabian Sea with chilled music and coastal breeze.']
                        ]
                    ]
                ],
                [
                    'title' => 'Day 2: Old Goa Heritage, Panjim Latin Quarter & River Cruise',
                    'activities' => [
                        'morning' => [
                            ['itineraryItem' => 'Basilica of Bom Jesus & Se Cathedral', 'briefDescription' => 'Marvel at the mortal remains of St. Francis Xavier and grand Manueline architecture.'],
                            ['itineraryItem' => 'Fontainhas Walking Tour', 'briefDescription' => 'Photograph historic pastel yellow and blue Portuguese houses with tiled terracotta roofs in Panjim.']
                        ],
                        'afternoon' => [
                            ['itineraryItem' => 'Goan Fish Thali at Ritz Classic', 'briefDescription' => 'Savor authentic surmai fry, crab masala, kismoor, and sol kadi with local red rice.'],
                            ['itineraryItem' => 'Miramar Beach & Dona Paula Viewpoint', 'briefDescription' => 'Visit the famous viewpoint where Mandovi and Zuari rivers merge into the ocean.']
                        ],
                        'evening' => [
                            ['itineraryItem' => 'Mandovi River Sunset Cruise', 'briefDescription' => 'Enjoy a 1-hour cruise featuring live DJ music, Portuguese folk dances, and sparkling river views.']
                        ]
                    ]
                ],
                [
                    'title' => 'Day 3: Dudhsagar Waterfalls or Serene South Goa Palolem',
                    'activities' => [
                        'morning' => [
                            ['itineraryItem' => 'Dudhsagar Jeep Safari Trek', 'briefDescription' => 'Drive through Bhagwan Mahavir Wildlife Sanctuary to swim in the cool base pool of Dudhsagar.'],
                            ['itineraryItem' => 'Spice Plantation Tour with Traditional Lunch', 'briefDescription' => 'Walk among vanilla, nutmeg, and pepper trees followed by a royal Goan buffet on banana leaf.']
                        ],
                        'afternoon' => [
                            ['itineraryItem' => 'Relaxation at Palolem Beach', 'briefDescription' => 'Walk along the calm crescent shoreline flanked by leaning coconut palms in South Goa.']
                        ],
                        'evening' => [
                            ['itineraryItem' => 'Candlelight Seafood Dinner at Dropadi', 'briefDescription' => 'Conclude your vacation with grilled jumbo prawns, garlic butter naan, and beach stargazing.']
                        ]
                    ]
                ]
            ]
        ],

        'Ooty' => [
            'abouttheplace' => "Ooty (Udhagamandalam) is the celebrated 'Queen of Hill Stations' perched in Tamil Nadu's Nilgiri Hills at an altitude of 2,240 meters. Enclosed by rolling green tea plantations, fragrant eucalyptus groves, cascading waterfalls, and colonial-era heritage, Ooty offers cool alpine weather, the UNESCO Nilgiri Mountain Railway, and breathtaking peak vistas.",
            'besttimetovisit' => "October to June (Crisp 12°C - 20°C weather; March to May for blooming flower shows)",
            'topplacestovisit' => [
                ['name' => 'Nilgiri Mountain Railway (Toy Train)', 'coordinates' => ['lat' => 11.4070, 'lng' => 76.6853], 'type' => 'UNESCO Heritage Mountain Train'],
                ['name' => 'Doddabetta Peak', 'coordinates' => ['lat' => 11.4011, 'lng' => 76.7360], 'type' => 'Highest Nilgiri Viewpoint (2,637m)'],
                ['name' => 'Government Botanical Gardens', 'coordinates' => ['lat' => 11.4175, 'lng' => 76.7118], 'type' => '55-Acre Exotic Botanical Sanctuary'],
                ['name' => 'Pykara Falls & Lake', 'coordinates' => ['lat' => 11.4880, 'lng' => 76.5960], 'type' => 'Speedboating & Cascading Falls'],
                ['name' => 'Doddabetta Tea Museum & Factory', 'coordinates' => ['lat' => 11.4116, 'lng' => 76.7302], 'type' => 'Tea Processing & Tasting Hub'],
                ['name' => 'Wenlock Downs 9th Mile', 'coordinates' => ['lat' => 11.4550, 'lng' => 76.6250], 'type' => 'Scenic Rolling Meadow Shooting Point']
            ],
            'adventuresactivitiestodo' => [
                "Ride the vintage steam engine UNESCO Toy Train through mountain tunnels and bridges",
                "Trek to the summit of Doddabetta Peak for sweeping vistas of Coimbatore plains and Nilgiris",
                "Thrilling high-speed motorboating across the pristine waters of Pykara Lake",
                "Horse riding and paddle boating around the tranquil misty waters of Ooty Lake",
                "Cycling across the emerald tea estate trails and pine forests of Wenlock Downs"
            ],
            'localcuisinerecommendations' => [
                "Freshly handcrafted dark chocolates, fudge, and truffles at King Star Choco Palace",
                "Steaming hot Nilgiri cardamom, ginger & green tea at local estate stalls",
                "South Indian Ghee Roast Dosa and Medu Vada at Nahar's Sidewalk Cafe",
                "Traditional Chettinad Chicken Pepper Fry and hot parotta at Hyderabadi Biryani House",
                "Crunchy Ooty bakery rusks, coconut buns, and fresh wild honey"
            ],
            'packingchecklist' => [
                "Warm sweaters, fleece jackets, thermal inners & woolen socks (10°C at night)",
                "Windproof jacket, compact umbrella or raincoat (mountain mist & sudden showers)",
                "Sturdy walking shoes or hiking boots with good traction for uphill trails",
                "Moisturizing cream, cold lip balm & sunglasses for high-altitude sunlight",
                "Universal charger, power bank & high-resolution camera for tea gardens",
                "Personal medications, motion sickness pills for hairpin curve ghat roads"
            ],
            'itinerary' => [
                [
                    'title' => 'Day 1: UNESCO Mountain Toy Train & Botanical Splendor',
                    'activities' => [
                        'morning' => [
                            ['itineraryItem' => 'Nilgiri Toy Train Ride', 'briefDescription' => 'Board the historic steam-hauled toy train from Coonoor to Ooty over deep gorges and pine forests.'],
                            ['itineraryItem' => 'Government Botanical Gardens Walk', 'briefDescription' => 'Admire exotic Italian flora, fossil tree trunks, and terraced lawns laid out in 1848.']
                        ],
                        'afternoon' => [
                            ['itineraryItem' => 'Traditional Lunch at Nahar Nilgiris', 'briefDescription' => 'Taste authentic South Indian meals served on fresh plantain leaves.'],
                            ['itineraryItem' => 'Ooty Lake Boating & Cycling', 'briefDescription' => 'Rent a paddle boat to cruise along eucalyptus-lined shores and ride tandem cycles.']
                        ],
                        'evening' => [
                            ['itineraryItem' => 'Charing Cross Chocolate Shopping', 'briefDescription' => 'Sample and purchase Ooty\'s famous handmade chocolates, dark truffles, and eucalyptus oil.']
                        ]
                    ]
                ],
                [
                    'title' => 'Day 2: Doddabetta Peak, Tea Factory & 9th Mile Meadows',
                    'activities' => [
                        'morning' => [
                            ['itineraryItem' => 'Doddabetta Peak Viewpoint', 'briefDescription' => 'Stand at 2,637m altitude at the Telescope House for breathtaking views across misty Nilgiri ranges.'],
                            ['itineraryItem' => 'Tea Museum & Factory Tour', 'briefDescription' => 'Witness how fresh green tea leaves are processed and enjoy hot cardamom tea samples.']
                        ],
                        'afternoon' => [
                            ['itineraryItem' => 'Wenlock Downs 9th Mile Meadows', 'briefDescription' => 'Picnic on sprawling green slopes famous for Bollywood movie shoots and fresh hill air.'],
                            ['itineraryItem' => 'Lunch at Pine Forest Dhabas', 'briefDescription' => 'Enjoy piping hot Maggi, fresh corn on the cob, and parottas with mountain views.']
                        ],
                        'evening' => [
                            ['itineraryItem' => 'Rose Garden Sunset Walk', 'briefDescription' => 'Stroll through over 20,000 varieties of vibrant roses terraced along the slopes of Elk Hill.']
                        ]
                    ]
                ],
                [
                    'title' => 'Day 3: Pykara Waterfalls, Needle Rock & Pine Forests',
                    'activities' => [
                        'morning' => [
                            ['itineraryItem' => 'Pykara Lake Speedboating', 'briefDescription' => 'Zip across emerald waters surrounded by Toda settlements and pristine shola forest reserves.'],
                            ['itineraryItem' => 'Pykara Waterfalls Nature Walk', 'briefDescription' => 'Descend scenic stone trails to watch the Pykara river plunge down rocky tiers into the valley.']
                        ],
                        'afternoon' => [
                            ['itineraryItem' => 'Picnic Lunch near Pykara Dam', 'briefDescription' => 'Enjoy packed hill sandwiches and fresh fruit juice under the shade of ancient pine trees.'],
                            ['itineraryItem' => 'Needle Rock Viewpoint (Gudalur)', 'briefDescription' => 'Experience a 360-degree panoramic cliff view over Tamil Nadu and Kerala borders.']
                        ],
                        'evening' => [
                            ['itineraryItem' => 'Cozy Fireplace Dinner at Earl\'s Secret', 'briefDescription' => 'Dine in a glasshouse colonial bungalow with roast chicken, pasta, and hot apple pie.']
                        ]
                    ]
                ]
            ]
        ],

        'Mahabalipuram' => [
            'abouttheplace' => "Mahabalipuram (Mamallapuram) is an ancient coastal town in Tamil Nadu, recognized as a UNESCO World Heritage treasure for its 7th-century Pallava granite rock sanctuaries, monolithic rathas, and shore temples standing against the crashing waves of the Bay of Bengal. Just 55km from Chennai along the scenic East Coast Road, it blends deep historical lore with vibrant surfing culture.",
            'besttimetovisit' => "November to February (Cool coastal breezes, comfortable 22°C - 28°C)",
            'topplacestovisit' => [
                ['name' => 'Shore Temple', 'coordinates' => ['lat' => 12.6163, 'lng' => 80.1989], 'type' => '8th-Century Granite Seaside Temple'],
                ['name' => 'Five Rathas (Pancha Rathas)', 'coordinates' => ['lat' => 12.6094, 'lng' => 80.1925], 'type' => 'Monolithic Carved Chariots'],
                ['name' => 'Arjuna\'s Penance (Descent of the Ganges)', 'coordinates' => ['lat' => 12.6186, 'lng' => 80.1926], 'type' => 'World\'s Largest Bas-Relief Rock Carving'],
                ['name' => 'Krishna\'s Butterball', 'coordinates' => ['lat' => 12.6180, 'lng' => 80.1930], 'type' => '250-Ton Gravity-Defying Boulder'],
                ['name' => 'Covelong / Kovalam Beach', 'coordinates' => ['lat' => 12.7885, 'lng' => 80.2478], 'type' => 'Surfing & Coastal Beach Village'],
                ['name' => 'Madras Crocodile Bank', 'coordinates' => ['lat' => 12.8091, 'lng' => 80.2423], 'type' => 'Reptile Conservation Sanctuary']
            ],
            'adventuresactivitiestodo' => [
                "Surfing lessons and stand-up paddleboarding at Covelong Point Surf School",
                "Rock bouldering and exploration around Krishna's Butterball hillocks",
                "Scenic coastal cycling and motorbike cruising along the East Coast Road (ECR)",
                "Beach buggy and ATV joy rides along the sandy shores of Mahabalipuram",
                "Visiting the venom extraction show and breeding ponds at Madras Crocodile Bank"
            ],
            'localcuisinerecommendations' => [
                "Fresh grilled coastal Red Snapper and jumbo Tiger Prawns at Moonrakers Restaurant",
                "Spicy South Indian Fish Curry Thali on plantain leaf with steamed ponni rice",
                "Fresh chilled coconut water straight from seaside palms",
                "Seafood pizza and calamari fritters at Santana Beach Shack",
                "Chettinad pepper crab masala with hot parotta"
            ],
            'packingchecklist' => [
                "Govt photo ID, light cotton breathable shirts and shorts",
                "Sun protection (SPF 50+ lotion, UV-blocking sunglasses, sun hat)",
                "Comfortable walking sandals or shoes for exploring granite stone monuments",
                "Swimwear, beach towel & dry pouch for seaside visits",
                "Power bank and camera with plenty of storage for rock carvings",
                "Basic personal medications and hydration electrolyte packets"
            ],
            'itinerary' => [
                [
                    'title' => 'Day 1: UNESCO Monumental Sanctuaries & Coastal Sunsets',
                    'activities' => [
                        'morning' => [
                            ['itineraryItem' => 'Sunrise at Shore Temple', 'briefDescription' => 'Marvel at the ancient 8th-century monolithic structural temple as the sun rises over the Bay of Bengal.'],
                            ['itineraryItem' => 'Arjuna\'s Penance & Krishna Cave', 'briefDescription' => 'Inspect the world-famous bas-relief carving depicting celestial beings and elephant herds.']
                        ],
                        'afternoon' => [
                            ['itineraryItem' => 'Krishna\'s Butterball & Lighthouse', 'briefDescription' => 'Pose next to the gravity-defying 250-ton granite boulder and climb the circular lighthouse.'],
                            ['itineraryItem' => 'Seafood Feast at Moonrakers', 'briefDescription' => 'Enjoy freshly caught grilled butter garlic tiger prawns, calamari, and lemon soda.']
                        ],
                        'evening' => [
                            ['itineraryItem' => 'Five Rathas (Pancha Rathas)', 'briefDescription' => 'Tour the five monolithic chariot shrines carved from single blocks of pink granite.'],
                            ['itineraryItem' => 'Sunset Beach Walk', 'briefDescription' => 'Stroll along the beach, watch local stone sculptors chiseling granite idols, and enjoy cool breezes.']
                        ]
                    ]
                ],
                [
                    'title' => 'Day 2: Surfing, Crocodile Bank & Coastal Relaxation',
                    'activities' => [
                        'morning' => [
                            ['itineraryItem' => 'Surfing at Covelong Point', 'briefDescription' => 'Take a 2-hour surfing lesson with local pros on the gentle rolling waves of Kovalam.'],
                            ['itineraryItem' => 'Seaside Breakfast at Surf Turf', 'briefDescription' => 'Enjoy pancakes, sunny-side eggs, filter coffee, and ocean panoramas.']
                        ],
                        'afternoon' => [
                            ['itineraryItem' => 'Madras Crocodile Bank Tour', 'briefDescription' => 'Witness over 2,000 marsh crocodiles, gharials, and the Irula snake venom extraction.'],
                            ['itineraryItem' => 'Coastal Lunch along ECR', 'briefDescription' => 'Taste authentic Chettinad crab masala and flaky coin parottas.']
                        ],
                        'evening' => [
                            ['itineraryItem' => 'Stone Carving Souvenir Hunt', 'briefDescription' => 'Pick up miniature stone elephants, incense burners, and seashells from local artisan workshops.']
                        ]
                    ]
                ]
            ]
        ]
    ];
}

function generateDynamicCatalogData($dest, $days, $budget) {
    $cleanDest = htmlspecialchars($dest, ENT_QUOTES, 'UTF-8');
    
    return [
        'abouttheplace' => "{$cleanDest} is a captivating and dynamic destination renowned for its rich local culture, historical landmarks, vibrant streets, and distinctive regional culinary traditions. Whether you are traveling for a quick weekend recharge or an extended exploration, {$cleanDest} offers scenic viewpoints, authentic markets, and welcoming hospitality that makes every moment memorable.",
        'besttimetovisit' => "October to March (Pleasant weather, ideal temperatures for sightseeing and outdoor tours)",
        'topplacestovisit' => [
            ['name' => "{$cleanDest} City Center & Historic Square", 'coordinates' => ['lat' => 13.0827, 'lng' => 80.2707], 'type' => 'Heritage & Urban Hub'],
            ['name' => "{$cleanDest} Grand Monument & Museum", 'coordinates' => ['lat' => 13.0604, 'lng' => 80.2496], 'type' => 'Cultural Landmark'],
            ['name' => "{$cleanDest} Scenic Sunset Viewpoint", 'coordinates' => ['lat' => 13.0336, 'lng' => 80.2677], 'type' => 'Panoramic Vista'],
            ['name' => "{$cleanDest} Traditional Artisan Bazaar", 'coordinates' => ['lat' => 13.0878, 'lng' => 80.2785], 'type' => 'Local Handicrafts & Shopping'],
            ['name' => "{$cleanDest} Nature Botanical Park", 'coordinates' => ['lat' => 13.0232, 'lng' => 80.2312], 'type' => 'Green Space & Relaxation']
        ],
        'adventuresactivitiestodo' => [
            "Guided walking tour through historic streets and cultural quarters of {$cleanDest}",
            "Scenic cycling or scooter tour around iconic landmarks and hidden city alleys",
            "Sunset boat ride or panoramic view expedition from the highest elevation in {$cleanDest}",
            "Interactive local street food trail sampling signature culinary specialties",
            "Photography expedition capturing heritage facades, public squares, and sunset colors"
        ],
        'localcuisinerecommendations' => [
            "Signature regional platter and thali featuring locally grown seasonal ingredients",
            "Famous street food delicacy celebrated across local food stalls and bazaars",
            "Traditional slow-cooked curry served with freshly baked regional breads",
            "Locally brewed artisanal tea, filter coffee, or refreshing fruit coolers",
            "Traditional sweet or dessert unique to the culinary history of {$cleanDest}"
        ],
        'packingchecklist' => [
            "Govt photo ID (Aadhaar or Passport), digital tickets & hotel reservations",
            "Comfortable, weather-appropriate clothing and walking shoes",
            "High-capacity 10,000mAh power bank, charging cables & universal adapter",
            "Personal mini first aid kit, prescription medicines & rehydration salts",
            "Sunscreen (SPF 50+), sunglasses & reusable water bottle",
            "Emergency cash (₹2,000–₹3,000) and configured digital UPI payment apps"
        ],
        'itinerary' => [
            [
                'title' => "Day 1: Highlights & Cultural Landmarks of {$cleanDest}",
                'activities' => [
                    'morning' => [
                        ['itineraryItem' => "City Square & Landmark Tour", 'briefDescription' => "Start early at the main historic monument of {$cleanDest} to capture photos before the crowds arrive."],
                        ['itineraryItem' => "Local Breakfast Tasting", 'briefDescription' => "Enjoy signature breakfast specialities and freshly brewed hot beverages at a popular heritage cafe."]
                    ],
                    'afternoon' => [
                        ['itineraryItem' => "Museum & Heritage Exploration", 'briefDescription' => "Explore curated galleries, artifacts, and architecture detailing the story of {$cleanDest}."],
                        ['itineraryItem' => "Authentic Regional Lunch", 'briefDescription' => "Taste traditional dishes cooked with aromatic local spices at a highly rated local diner."]
                    ],
                    'evening' => [
                        ['itineraryItem' => "Sunset Viewpoint & Promenade", 'briefDescription' => "Watch the golden evening glow over the skyline and take a relaxed stroll along bustling evening avenues."]
                    ]
                ]
            ],
            [
                'title' => "Day 2: Hidden Gems, Nature & Artisan Markets of {$cleanDest}",
                'activities' => [
                    'morning' => [
                        ['itineraryItem' => "Nature Park & Lake Walk", 'briefDescription' => "Spend a serene morning listening to birdsong, walking shaded paths, or enjoying boating."],
                        ['itineraryItem' => "Fresh Bakery or Street Bites", 'briefDescription' => "Sample freshly baked goods or warm morning street treats at a local market stall."]
                    ],
                    'afternoon' => [
                        ['itineraryItem' => "Artisan Bazaar & Handicrafts", 'briefDescription' => "Browse colorful stalls for handmade souvenirs, textiles, and authentic regional crafts."],
                        ['itineraryItem' => "Traditional Thali Lunch", 'briefDescription' => "Feast on a multi-course traditional meal showcasing the best regional vegetarian or seafood recipes."]
                    ],
                    'evening' => [
                        ['itineraryItem' => "Night Food Street Tour", 'briefDescription' => "Embark on an evening tasting tour of sizzling street specialties, sweet desserts, and live city vibes."]
                    ]
                ]
            ],
            [
                'title' => "Day 3: Scenic Excursions & Farewell Experience",
                'activities' => [
                    'morning' => [
                        ['itineraryItem' => "Panoramic Hill or Waterfront Trail", 'briefDescription' => "Take an invigorating morning excursion to the highest viewpoint or tranquil waterfront near {$cleanDest}."],
                        ['itineraryItem' => "Relaxed Brunch with a View", 'briefDescription' => "Savor a leisurely brunch overlooking green valleys, the river, or city rooftops."]
                    ],
                    'afternoon' => [
                        ['itineraryItem' => "Last-Minute Shopping & Gift Hunting", 'briefDescription' => "Pick up specialty spices, local sweets, and memorable tokens for friends and family."],
                        ['itineraryItem' => "Coffee Break at a Vintage Cafe", 'briefDescription' => "Unwind in a quiet corner with artisanal coffee, reflecting on your trip adventures."]
                    ],
                    'evening' => [
                        ['itineraryItem' => "Celebratory Farewell Dinner", 'briefDescription' => "Celebrate the culmination of an incredible journey with fine local cuisine and dessert."]
                    ]
                ]
            ]
        ]
    ];
}
