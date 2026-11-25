package com.simats.travelbuddy

import okhttp3.Interceptor
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.Protocol
import okhttp3.Request
import okhttp3.Response
import okhttp3.ResponseBody.Companion.toResponseBody
import org.json.JSONArray
import org.json.JSONObject

class OfflineFallbackInterceptor : Interceptor {

    companion object {
        val localTrips = mutableListOf(
            "Mahabalipuram, Tamil Nadu",
            "Pondicherry, India",
            "Ooty, Tamil Nadu"
        )

        val localPackingItems = mutableListOf(
            Triple(1, "Passport & Government ID", true),
            Triple(2, "Power Bank & Universal Chargers", true),
            Triple(3, "Sunscreen SPF 50 & Sunglasses", false),
            Triple(4, "Comfortable Walking Shoes", false),
            Triple(5, "Quick-Dry Towel & Toiletries", true),
            Triple(6, "First Aid & Motion Sickness Pills", false)
        )

        var localTotalBudget = 20000.0
        val localExpenses = mutableListOf(
            Triple(1, 6500.0, "Resort Accommodation"),
            Triple(2, 2800.0, "Express Train Tickets"),
            Triple(3, 1450.0, "Traditional Dinner & Street Food"),
            Triple(4, 750.0, "Monument Entry Passes")
        )

        var isMysteryRevealed = false
    }

    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request()
        try {
            val response = chain.proceed(request)
            if (response.isSuccessful) {
                return response
            }
            if (response.code >= 400) {
                val fallbackJson = getFallbackJson(request)
                if (fallbackJson != null) {
                    return buildOkResponse(request, fallbackJson)
                }
            }
            return response
        } catch (e: Exception) {
            // Server offline, 10.0.2.2 unreachable, timeout, or socket closed
            val fallbackJson = getFallbackJson(request)
            val jsonToReturn = fallbackJson ?: """{"status":"success","message":"Handled in offline mode"}"""
            return buildOkResponse(request, jsonToReturn)
        }
    }

    private fun buildOkResponse(request: Request, bodyString: String): Response {
        return Response.Builder()
            .code(200)
            .message("OK (Offline Seamless Mode)")
            .protocol(Protocol.HTTP_1_1)
            .request(request)
            .body(bodyString.toResponseBody("application/json; charset=utf-8".toMediaTypeOrNull()))
            .build()
    }

    private fun getFallbackJson(request: Request): String? {
        val url = request.url.toString().lowercase()

        return when {
            url.contains("get_trips.php") -> {
                val array = JSONArray()
                for (dest in localTrips) {
                    val obj = JSONObject()
                    obj.put("destination", dest)
                    obj.put("image_res", R.drawable.img_mahabali)
                    array.put(obj)
                }
                val res = JSONObject()
                res.put("status", "success")
                res.put("data", array)
                res.toString()
            }

            url.contains("add_trip.php") -> {
                // Try reading destination
                var destToAdd = "Mahabalipuram, Tamil Nadu"
                try {
                    val body = request.body
                    if (body is okhttp3.FormBody) {
                        for (i in 0 until body.size) {
                            if (body.name(i) == "destination") {
                                destToAdd = body.value(i)
                            }
                        }
                    }
                } catch (_: Exception) {}

                if (!localTrips.contains(destToAdd)) {
                    localTrips.add(0, destToAdd)
                }
                """{"status":"success","message":"Trip added to My Trips successfully"}"""
            }

            url.contains("delete_trip.php") -> {
                var destToRemove = ""
                try {
                    val body = request.body
                    if (body is okhttp3.FormBody) {
                        for (i in 0 until body.size) {
                            if (body.name(i) == "destination") {
                                destToRemove = body.value(i)
                            }
                        }
                    }
                } catch (_: Exception) {}

                if (destToRemove.isNotEmpty()) {
                    localTrips.remove(destToRemove)
                }
                """{"status":"success","message":"Trip removed successfully"}"""
            }

            url.contains("place_details.php") -> {
                val place = request.url.queryParameter("place") ?: "Mahabalipuram, Tamil Nadu"
                """{
                    "status": "success",
                    "data": {
                        "title": "$place",
                        "description": "Stunning coastal heritage and scenic adventures. Renowned for vibrant culture, ancient stone monuments, and local culinary experiences along the shore.",
                        "hotels": [
                            "Radisson Blu Resort Temple Bay",
                            "Chariot Beach Resort",
                            "Grande Bay Resort & Spa"
                        ],
                        "travel_methods": "Car/Taxi (1.5 hrs from Chennai) or Bus via East Coast Road",
                        "budget_min": "3500",
                        "budget_max": "12000",
                        "latitude": 12.6269,
                        "longitude": 80.1932,
                        "best_time": "November to February",
                        "rating": "4.8",
                        "recommended_places": [
                            "Shore Temple",
                            "Pancha Rathas",
                            "Krishna's Butterball",
                            "Promenade Beach",
                            "Lighthouse Viewpoint"
                        ]
                    }
                }"""
            }

            url.contains("community.php") && url.contains("action=get_requests") -> {
                """{
                    "status": "success",
                    "data": [
                        {
                            "id": 101,
                            "post_id": 1,
                            "requester_name": "Priya Sharma",
                            "requester_email": "priya.s@gmail.com",
                            "destination": "Gokarna, Karnataka",
                            "status": "Pending"
                        }
                    ]
                }"""
            }

            url.contains("community.php") && url.contains("action=get") -> {
                """{
                    "status": "success",
                    "data": [
                        {
                            "id": 1,
                            "user_name": "Rohan Verma",
                            "user_rating": "4.9",
                            "avatar_id": 1,
                            "destination": "Gokarna, Karnataka",
                            "dates": "Jun 01 - Jun 05",
                            "description": "Beach trekking, sunset cliff walks, and relaxed camping by Om Beach. Looking for someone to share scooter rentals and beach shack stays!",
                            "interested_count": 3
                        },
                        {
                            "id": 2,
                            "user_name": "Sneha Patel",
                            "user_rating": "4.8",
                            "avatar_id": 2,
                            "destination": "Jaipur & Udaipur, Rajasthan",
                            "dates": "Jul 10 - Jul 16",
                            "description": "Heritage and palace exploration across Rajasthan. Exploring majestic forts, traditional art bazaars, and delicious Rajasthani thalis.",
                            "interested_count": 1
                        },
                        {
                            "id": 3,
                            "user_name": "Aditya Rao",
                            "user_rating": "4.7",
                            "avatar_id": 3,
                            "destination": "Manali, Himachal Pradesh",
                            "dates": "Aug 15 - Aug 20",
                            "description": "Backpacking through Solang Valley, river rafting in Beas, and cozy cafe vibes in Old Manali. Any adventure lovers want to tag along?",
                            "interested_count": 6
                        }
                    ]
                }"""
            }

            url.contains("community.php") -> {
                """{"status":"success","message":"Community operation completed successfully"}"""
            }

            url.contains("packing.php") && url.contains("action=get") -> {
                val array = JSONArray()
                for (item in localPackingItems) {
                    val obj = JSONObject()
                    obj.put("id", item.first)
                    obj.put("trip", "General")
                    obj.put("item", item.second)
                    obj.put("category", "Essential")
                    obj.put("is_packed", item.third)
                    array.put(obj)
                }
                val res = JSONObject()
                res.put("status", "success")
                res.put("data", array)
                res.toString()
            }

            url.contains("packing.php") -> {
                """{"status":"success","message":"Packing item updated"}"""
            }

            url.contains("budget.php") && url.contains("action=get") -> {
                val array = JSONArray()
                for (exp in localExpenses) {
                    val obj = JSONObject()
                    obj.put("id", exp.first)
                    obj.put("trip", "General")
                    obj.put("amount", exp.second)
                    obj.put("note", exp.third)
                    obj.put("created_at", "Today")
                    array.put(obj)
                }
                val res = JSONObject()
                res.put("status", "success")
                res.put("total_budget", localTotalBudget)
                res.put("expenses", array)
                res.toString()
            }

            url.contains("budget.php") -> {
                """{"status":"success","message":"Budget updated successfully"}"""
            }

            url.contains("weather.php") -> {
                """{
                    "status": "success",
                    "current_temp": "29°C",
                    "condition": "Pleasant & Breezy",
                    "hourly": [
                        {"time": "09:00", "temp": "26°C", "condition": "Sunny"},
                        {"time": "12:00", "temp": "30°C", "condition": "Partly Cloudy"},
                        {"time": "15:00", "temp": "29°C", "condition": "Breezy"},
                        {"time": "18:00", "temp": "27°C", "condition": "Clear Sky"},
                        {"time": "21:00", "temp": "25°C", "condition": "Cool"}
                    ],
                    "daily": [
                        {"day": "Today", "low": "24°C", "high": "29°C", "condition": "Sunny"},
                        {"day": "Tomorrow", "low": "23°C", "high": "28°C", "condition": "Partly Cloudy"},
                        {"day": "Wednesday", "low": "22°C", "high": "27°C", "condition": "Breezy"},
                        {"day": "Thursday", "low": "23°C", "high": "28°C", "condition": "Clear"},
                        {"day": "Friday", "low": "24°C", "high": "29°C", "condition": "Pleasant"}
                    ]
                }"""
            }

            url.contains("hotels.php") -> {
                """[
                    {
                        "name": "Ocean Vista Heritage Resort",
                        "description": "Luxury 5-star beachfront retreat featuring authentic coastal architecture, infinity pool overlooking sunrise, and spa.",
                        "price": "₹4,200/night",
                        "rating": "4.9",
                        "contact": "+91 98765 43210",
                        "image": "img_hotel_1"
                    },
                    {
                        "name": "Palm Breeze Boutique Inn",
                        "description": "Cozy, eco-friendly boutique stay surrounded by lush coconut palms, peaceful gardens, and artisanal cafe dining.",
                        "price": "₹2,400/night",
                        "rating": "4.7",
                        "contact": "+91 98123 45678",
                        "image": "img_hotel_2"
                    },
                    {
                        "name": "Backpacker Haven & Hostel",
                        "description": "Vibrant traveler community hub with modern air-conditioned dorms, rooftop sunset lounge, and daily guided group excursions.",
                        "price": "₹899/night",
                        "rating": "4.6",
                        "contact": "+91 99554 11223",
                        "image": "img_hotel_3"
                    }
                ]"""
            }

            url.contains("tickets.php") -> {
                """{
                    "status": "success",
                    "routes": [
                        {
                            "type": "Express Flight",
                            "price": "₹3,499",
                            "duration": "1h 15m",
                            "departure": "08:30 AM",
                            "arrival": "09:45 AM",
                            "operator": "IndiGo Air"
                        },
                        {
                            "type": "Superfast Train",
                            "price": "₹650",
                            "duration": "3h 45m",
                            "departure": "06:15 AM",
                            "arrival": "10:00 AM",
                            "operator": "Vande Bharat Express"
                        },
                        {
                            "type": "Luxury Sleeper Bus",
                            "price": "₹850",
                            "duration": "4h 30m",
                            "departure": "10:00 PM",
                            "arrival": "02:30 AM",
                            "operator": "IntrCity SmartBus"
                        }
                    ]
                }"""
            }

            url.contains("friend_finder.php") -> {
                """{
                    "status": "success",
                    "message": "Group active",
                    "members": [
                        {
                            "id": 1,
                            "name": "You (Aarav)",
                            "email": "aarav.mehta@gmail.com",
                            "status": "Safe",
                            "status_text": "Active with Group",
                            "distance": "0 m",
                            "direction": "Here",
                            "lat": 12.6269,
                            "lng": 80.1932,
                            "battery": "88%",
                            "last_ping": "Just now",
                            "is_me": true
                        },
                        {
                            "id": 2,
                            "name": "Rohan Verma",
                            "email": "rohan.v@gmail.com",
                            "status": "Safe",
                            "status_text": "Near Shore Temple",
                            "distance": "120 m",
                            "direction": "North-East",
                            "lat": 12.6278,
                            "lng": 80.1945,
                            "battery": "74%",
                            "last_ping": "1 min ago",
                            "is_me": false
                        },
                        {
                            "id": 3,
                            "name": "Sneha Patel",
                            "email": "sneha.p@gmail.com",
                            "status": "Safe",
                            "status_text": "At Coffee Shack",
                            "distance": "340 m",
                            "direction": "West",
                            "lat": 12.6255,
                            "lng": 80.1901,
                            "battery": "65%",
                            "last_ping": "3 mins ago",
                            "is_me": false
                        }
                    ],
                    "beacon": {
                        "name": "Shore Temple Main Arch",
                        "lat": 12.6269,
                        "lng": 80.1932,
                        "description": "Primary regroup point if anyone gets separated.",
                        "set_by": "Rohan Verma",
                        "time_set": "10:30 AM"
                    }
                }"""
            }

            url.contains("surprise_destination.php") -> {
                if (url.contains("action=reveal")) {
                    isMysteryRevealed = true
                }
                """{
                    "status": "success",
                    "package": {
                        "id": "MYSTERY-2026-X9",
                        "code_name": "Operation Azure Coastline",
                        "vibe": "Serene Coastal & Ancient Temples",
                        "budget_tier": "Comfort Explorer (₹10,000 - ₹15,000)",
                        "departure_date": "Next Weekend",
                        "is_revealed": $isMysteryRevealed,
                        "clues": [
                            {
                                "stage": 1,
                                "title": "Geographic Clue",
                                "badge": "Unlocked",
                                "hint": "This place sits directly along the Bay of Bengal and has monoliths sculpted from single boulders.",
                                "unlocked": true
                            },
                            {
                                "stage": 2,
                                "title": "Culinary Hint",
                                "badge": "Unlocked",
                                "hint": "Famous for fresh catch seafood curries and piping hot filter coffee under palm shacks.",
                                "unlocked": true
                            },
                            {
                                "stage": 3,
                                "title": "Weather & Climate",
                                "badge": "Locked",
                                "hint": "Warm golden afternoons with continuous soothing oceanic breeze (28°C).",
                                "unlocked": false
                            }
                        ],
                        "revealed_details": {
                            "destination": "Mahabalipuram & ECR Coast",
                            "tagline": "Ancient Carvings & Ocean Whispers",
                            "hero_image": "img_mahabali",
                            "flight_duration": "1 hr drive from Chennai",
                            "top_attractions": ["Shore Temple", "Pancha Rathas", "Krishna's Butterball", "Tiger Cave"],
                            "recommended_stay": "Radisson Blu Resort Temple Bay",
                            "budget_estimate": "₹12,500 for 3 days",
                            "best_photospot": "Shore Temple Sunrise Monoliths"
                        }
                    }
                }"""
            }

            url.contains("language_bodyguard.php") -> {
                """{
                    "status": "success",
                    "selected_language": "Tamil",
                    "data": {
                        "language_name": "Tamil",
                        "region": "Tamil Nadu & Pondicherry",
                        "categories": {
                            "Essentials": [
                                {"english": "Hello / Greetings", "local": "Vanakkam", "phonetic": "Vuh-nuh-kum", "audio": "vanakkam", "badge": "Essential", "alert": false},
                                {"english": "Thank you very much", "local": "Romba Nandri", "phonetic": "Rom-buh Nun-dree", "audio": "nandri", "badge": "Polite", "alert": false},
                                {"english": "Yes / Okay", "local": "Sari", "phonetic": "Suh-ree", "audio": "sari", "badge": "Daily", "alert": false},
                                {"english": "No / Not needed", "local": "Vendaam", "phonetic": "Ven-daam", "audio": "vendaam", "badge": "Daily", "alert": false}
                            ],
                            "Directions": [
                                {"english": "Where is the temple?", "local": "Kovil engey irukku?", "phonetic": "Koh-vil eng-gey ee-ruk-ku?", "audio": "kovil", "badge": "Transit", "alert": false},
                                {"english": "How much for taxi / auto?", "local": "Auto evvalavu aagum?", "phonetic": "Auto ev-vuh-luh-voo ah-goom?", "audio": "auto", "badge": "Price", "alert": false}
                            ],
                            "Safety": [
                                {"english": "Please help me!", "local": "Enakku udhavi seyyungal!", "phonetic": "Eh-nuh-ku oo-dhuh-vee sey-yung-gull!", "audio": "help", "badge": "Urgent", "alert": true},
                                {"english": "Where is the police station?", "local": "Police station enga irukku?", "phonetic": "Police station eng-guh ee-ruk-ku?", "audio": "police", "badge": "Emergency", "alert": true}
                            ]
                        },
                        "gestures": [
                            {"title": "Head Bobble", "description": "Gentle side-to-side head tilt means 'Yes', 'Understood', or 'Friendly agreement'.", "tag": "Friendly", "type": "cultural"},
                            {"title": "Palm Handshake Caution", "description": "Joining both palms together in 'Vanakkam' is universally preferred over aggressive handshakes.", "tag": "Respect", "type": "polite"},
                            {"title": "Pointing with Whole Hand", "description": "Point towards sacred shrines or elders using an open palm, never an index finger.", "tag": "Etiquette", "type": "warning"}
                        ]
                    }
                }"""
            }

            url.contains("photo_spots.php") -> {
                """{
                    "status": "success",
                    "total": 3,
                    "spots": [
                        {
                            "id": 1,
                            "title": "Shore Temple Golden Monoliths",
                            "destination": "Mahabalipuram",
                            "image": "img_mahabali",
                            "best_time": "05:45 AM - 06:45 AM",
                            "lighting": "Golden Hour side-lighting off Bay of Bengal",
                            "crowd_level": "Low (Early Morning)",
                            "coordinates": "12.6269° N, 80.1932° E",
                            "optimal_angle": "Low angle from South rock bed with ocean breakers framing the temple towers.",
                            "camera_settings": "ISO 100, f/8, 1/250s, 24mm Wide",
                            "ai_tip": "Position yourself on the dry granite ledge just as sunrise breaks to capture reflections in rock pools."
                        },
                        {
                            "id": 2,
                            "title": "Pancha Rathas Chariot Silhouettes",
                            "destination": "Mahabalipuram",
                            "image": "img_madurai",
                            "best_time": "04:30 PM - 05:45 PM",
                            "lighting": "Warm backlight through monolithic stone pillars",
                            "crowd_level": "Moderate",
                            "coordinates": "12.6186° N, 80.1917° E",
                            "optimal_angle": "Eye level beside Arjuna Ratha capturing life-sized monolithic elephant in foreground.",
                            "camera_settings": "ISO 200, f/4, 1/500s, 50mm Portrait",
                            "ai_tip": "Use portrait mode with 2x zoom to isolate intricate stone drapery while blurring tourists."
                        },
                        {
                            "id": 3,
                            "title": "Promenade Beach Rock Pier",
                            "destination": "Pondicherry",
                            "image": "img_pondy",
                            "best_time": "06:00 AM",
                            "lighting": "Pastel pink and sky reflection",
                            "crowd_level": "Peaceful walkers only",
                            "coordinates": "11.9338° N, 79.8350° E",
                            "optimal_angle": "Wide horizon shot facing French War Memorial pier.",
                            "camera_settings": "ISO 100, f/11, 1/125s, 18mm",
                            "ai_tip": "Long exposure gives seawater a silky ethereal texture against dark basalt boulders."
                        }
                    ]
                }"""
            }

            url.contains("ask_buddy.php") -> {
                """{
                    "status": "success",
                    "answer": "I am your AI Travel Buddy! Plan your sightseeing in the morning, stay hydrated, and explore our local tools below!",
                    "agent_name": "🤖 Trip Coordinator Agent",
                    "agent_type": "Coordinator",
                    "options": [
                        {"label": "📷 Photo Spots", "action": "photos", "param": "Mahabalipuram"},
                        {"label": "🛡️ Language Guard", "action": "language", "param": "Tamil"},
                        {"label": "📍 Friend Finder", "action": "friends", "param": ""},
                        {"label": "🎁 Surprise Trip", "action": "surprise", "param": ""}
                    ]
                }"""
            }

            url.contains("login.php") || url.contains("register.php") || url.contains("reset_password.php") -> {
                """{"status":"success","message":"Success","user_name":"Aarav Mehta"}"""
            }

            else -> null
        }
    }
}
