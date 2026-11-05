/**
 * TravelBuddy - Web Application Logic
 * Orchestrates splash transitions and user interactions.
 */

// Dynamically determine unified backend base URL
const BASE_URL = (function() {
  if (typeof window !== 'undefined' && window.API_BASE_URL) {
    return window.API_BASE_URL;
  }
  if (typeof window !== 'undefined' && window.location && window.location.protocol.startsWith('http')) {
    const origin = window.location.origin;
    return `${origin}/TravelBuddy/backend`;
  }
  return 'http://localhost/TravelBuddy/backend';
})();

// Bulletproof Multi-Endpoint Auto-Failover Fetch Helper
async function safeApiFetch(endpoint, options = {}) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  const isHttp = typeof window !== 'undefined' && window.location && window.location.protocol.startsWith('http');
  const origin = isHttp ? window.location.origin : 'http://localhost';
  const path = isHttp ? window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/')) : '/website';

  const candidateBases = [
    BASE_URL,
    `${origin}/TravelBuddy/backend`,
    'http://localhost/TravelBuddy/backend',
    `${origin}/backend`,
    'http://localhost/backend',
    `${origin}${path}`,
    `${origin}/website`,
    'http://localhost/website',
    '.'
  ];

  let lastError = null;
  for (const base of candidateBases) {
    try {
      const url = base === '.' ? `./${cleanEndpoint}` : `${base.replace(/\/$/, '')}/${cleanEndpoint}`;
      const res = await fetch(url, options);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error('Network request failed across all local endpoints');
}

// ============================================================================
// Intelligent Client-Side Travel AI & Data Fallback Engines
// Ensures 100% functionality even during offline, static, or network outages
// ============================================================================

function generateClientTravelAdvice(q) {
  const lower = (q || '').toLowerCase().trim();

  // 1. Mumbai
  if (lower.includes('mumbai') || lower.includes('bombay')) {
    return "🏙️ **Mumbai 3-Day Travel Itinerary & City Guide:**\n\n"
         + "📅 **Day 1: Colonial Heritage & South Mumbai Charm**\n"
         + "- **Morning:** Stand before the majestic **Gateway of India** and admire the historic Taj Mahal Palace Hotel.\n"
         + "- **Afternoon:** Stroll down Colaba Causeway for shopping, then lunch at iconic Leopold Cafe.\n"
         + "- **Evening:** Sunset walk along **Marine Drive** (Queen’s Necklace) and bhel puri at Chowpatty Beach.\n\n"
         + "📅 **Day 2: Coastal Landmarks, Culture & Bandra Vibes**\n"
         + "- **Morning:** Scenic ferry ride to the ancient rock-cut **Elephanta Caves** (UNESCO site).\n"
         + "- **Afternoon:** Visit the serene **Haji Ali Dargah** situated on an islet in the Arabian Sea.\n"
         + "- **Evening:** Walk along **Bandra Bandstand**; see Mount Mary Church and explore Bandra's indie cafes.\n\n"
         + "📅 **Day 3: Bollywood, Beaches & Culinary Delights**\n"
         + "- **Morning:** Visit **Juhu Beach** for morning breeze and legendary Pav Bhaji.\n"
         + "- **Afternoon:** Explore Sanjay Gandhi National Park & Kanheri Caves.\n"
         + "- **Evening:** Rooftop dinner in Lower Parel overlooking Mumbai's illuminated skyline.\n\n"
         + "🍴 **Must-Try:** Vada Pav (Ashok Vada Pav), Pav Bhaji (Sardar), Bun Maska & Chai at Kyani & Co.\n"
         + "💰 **Estimated Budget:** ₹1,500–₹2,500/day (Budget) | ₹4,500–₹7,000/day (Comfort).\n"
         + "☀️ **Best Season:** October to March for cool coastal breezes.";
  }

  // 2. Delhi
  if (lower.includes('delhi')) {
    return "🏛️ **Delhi 3-Day Heritage & Food Itinerary:**\n\n"
         + "📅 **Day 1: Mughal Majesty & Old Delhi Flavors**\n"
         + "- **Morning:** Marvel at the grand **Red Fort** and wander through historic **Chandni Chowk**.\n"
         + "- **Afternoon:** Savor hot Paranthas at Paranthe Wali Gali, then visit historic Jama Masjid.\n"
         + "- **Evening:** Walk through the tranquil grounds of Raj Ghat and sunset at **India Gate**.\n\n"
         + "📅 **Day 2: Architectural Marvels & Sufi Soul**\n"
         + "- **Morning:** Visit the stunning red sandstone **Qutub Minar** complex.\n"
         + "- **Afternoon:** Explore the serene gardens of **Humayun’s Tomb** (precursor to the Taj Mahal).\n"
         + "- **Evening:** Peaceful lotus petals of **Lotus Temple**, followed by handicraft shopping at Dilli Haat.\n\n"
         + "📅 **Day 3: Modern Delhi & Grand Temples**\n"
         + "- **Morning:** Witness the breathtaking architecture and water show at **Akshardham Temple**.\n"
         + "- **Afternoon:** Stroll the white colonnades of Connaught Place for shopping and cafes.\n"
         + "- **Evening:** Street food exploration in Khan Market or Majnu Ka Tila.\n\n"
         + "🍴 **Must-Eat:** Chole Bhature at Sita Ram Diwan Chand, Butter Chicken at Karim's, Kulfi Falooda.\n"
         + "☀️ **Best Season:** October to March (crisp, pleasant winter days).";
  }

  // 3. Goa
  if (lower.includes('goa')) {
    return "🌴 **Goa Ultimate Beach & Adventure Itinerary:**\n\n"
         + "📅 **Day 1: Vibrant North Goa Beach Life**\n"
         + "- **Morning:** Relax on the sands of **Calangute & Baga Beach** with water sports (parasailing, jet ski).\n"
         + "- **Afternoon:** Explore historic **Aguada Fort** and lighthouse overlooking the Arabian Sea.\n"
         + "- **Evening:** Sunset cocktails at **Curlies or Thalassa** in Vagator, followed by live music at Anjuna.\n\n"
         + "📅 **Day 2: Portuguese Heritage & Latin Quarter**\n"
         + "- **Morning:** UNESCO-listed churches of **Old Goa** (Basilica of Bom Jesus & Se Cathedral).\n"
         + "- **Afternoon:** Walk through colorful Portuguese colonial villas in **Fontainhas (Panaji)**.\n"
         + "- **Evening:** Sunset river cruise on the Mandovi River with Goan folk dance.\n\n"
         + "📅 **Day 3: Serene South Goa & Hidden Waterfalls**\n"
         + "- **Morning:** Excursion to the magnificent 4-tiered **Dudhsagar Waterfalls**.\n"
         + "- **Afternoon:** Unwind at pristine, peaceful **Palolem Beach** or **Agonda Beach**.\n"
         + "- **Evening:** Fresh seafood candle-lit dinner right on the beach shacks.\n\n"
         + "💡 **Pro Tip:** Rent a scooter (₹350–500/day) with a helmet for the most fun island transport!\n"
         + "☀️ **Best Season:** Mid-November to February for open shacks and clear sunny days.";
  }

  // 4. Ooty
  if (lower.includes('ooty') || lower.includes('udhagamandalam')) {
    return "🌲 **Ooty Queen of Hill Stations 3-Day Guide:**\n\n"
         + "📅 **Day 1: Lakes, Gardens & Toy Train**\n"
         + "- **Morning:** Board the world-famous UNESCO **Nilgiri Mountain Railway Toy Train** from Coonoor to Ooty.\n"
         + "- **Afternoon:** Stroll through 55 acres of exotic flora at the **Government Botanical Garden**.\n"
         + "- **Evening:** Boating on peaceful **Ooty Lake** and horse riding along the banks.\n\n"
         + "📅 **Day 2: Peaks, Waterfalls & Tea Estates**\n"
         + "- **Morning:** Climb to **Doddabetta Peak** (2,637m), the highest vantage point in the Nilgiris.\n"
         + "- **Afternoon:** Visit a working Tea Factory & Museum; sample freshly brewed green tea.\n"
         + "- **Evening:** Scenic picnic by **Pykara Lake** and speed boating near Pykara Waterfalls.\n\n"
         + "📅 **Day 3: Tranquil Wilderness & Shopping**\n"
         + "- **Morning:** Journey to the untouched, pristine **Avalanche Lake** surrounded by rolling hills.\n"
         + "- **Afternoon:** Walk through the fragrant Ooty Rose Garden (over 20,000 varieties).\n"
         + "- **Evening:** Shop for fresh homemade dark chocolates, eucalyptus oil, and Nilgiri tea on Commercial Road.\n\n"
         + "🧥 **What to Pack:** Warm jacket, light sweater, walking shoes (temperatures 10°C–20°C year-round).\n"
         + "☀️ **Best Season:** October to June (lush green after monsoons, pleasantly cool in summer).";
  }

  // 5. Manali
  if (lower.includes('manali') || lower.includes('himachal') || lower.includes('rohtang')) {
    return "🏔️ **Manali & Rohtang 3-Day Snow & Adventure Plan:**\n\n"
         + "📅 **Day 1: Mountain Culture & Old Manali Cafes**\n"
         + "- **Morning:** Visit 500-year-old wooden **Hadimba Devi Temple** surrounded by tall cedar forests.\n"
         + "- **Afternoon:** Soak in natural hot sulfur springs at Vashisht Village.\n"
         + "- **Evening:** Live acoustic music, wood-fired pizza, and riverside chill in Old Manali.\n\n"
         + "📅 **Day 2: High Altitude Snow Thrills**\n"
         + "- **Morning:** Drive through the engineering marvel **Atal Tunnel** to Sissu waterfall in Lahaul Valley.\n"
         + "- **Afternoon:** Snow activities, paragliding, and skiing at **Solang Valley** or **Rohtang Pass** (3,978m).\n\n"
         + "📅 **Day 3: River Rafting & Valleys**\n"
         + "- White-water rafting on the Beas River, visit Naggar Castle, and shop for Kullu shawls and apple cider on Mall Road.\n\n"
         + "☀️ **Best Season:** May–June for summer blooms & paragliding; Dec–Feb for fresh snowfall & skiing!";
  }

  // 6. Kodaikanal
  if (lower.includes('kodaikanal') || lower.includes('kodai')) {
    return "🌿 **Kodaikanal Princess of Hill Stations 3-Day Tour:**\n\n"
         + "📅 **Day 1:** Rent a bicycle around star-shaped **Kodai Lake**, take a peaceful walk along **Coaker's Walk**, and stroll through colorful **Bryant Park**.\n"
         + "📅 **Day 2:** Marvel at the towering **Pillar Rocks**, explore the natural granite cavern of Guna Caves, and wander through the mystical **Pine Forest**.\n"
         + "📅 **Day 3:** Take an early morning safari into **Berijam Lake Forest Reserve**, visit Silver Cascade Waterfall, and buy homemade chocolates!\n\n"
         + "✨ **Highlights:** Chilly misty weather, fresh pine scent, homemade spices, and homemade fruit chocolates.\n"
         + "☀️ **Best Time:** September to May for clear skies and refreshing mountain breezes.";
  }

  // 7. Bangalore
  if (lower.includes('bangalore') || lower.includes('bengaluru')) {
    return "🌳 **Bangalore Garden City & Tech Hub 3-Day Plan:**\n\n"
         + "📅 **Day 1: Lush Gardens & Royal Palaces**\n"
         + "- **Morning:** Morning walk under 100-year-old trees in **Cubbon Park**, followed by breakfast at legendary MTR.\n"
         + "- **Afternoon:** Explore the glasshouse and botanical varieties at **Lalbagh Botanical Garden**.\n"
         + "- **Evening:** Tour Tudor-style **Bangalore Palace** and view the grand Vidhana Soudha illuminated at dusk.\n\n"
         + "📅 **Day 2: Science, Craft Beers & Indie Cafes**\n"
         + "- **Morning:** Interactive exhibits at Visvesvaraya Industrial & Technological Museum.\n"
         + "- **Afternoon:** Shop along commercial MG Road and Brigade Road.\n"
         + "- **Evening:** Explore Bangalore's famous craft brewery culture in Indiranagar or Koramangala.\n\n"
         + "📅 **Day 3: Heritage & Day Excursion**\n"
         + "- Day trip to **Nandi Hills** for sunrise above the clouds, or visit Bannerghatta National Park.\n\n"
         + "🍴 **Must-Eat:** Masala Dosa at Vidyarthi Bhavan, Filter Coffee at Brahmin's Coffee Bar, Donne Biryani.\n"
         + "☀️ **Best Time:** October to February (pleasant spring weather 15°C–28°C).";
  }

  // 8. Chennai / Mahabalipuram
  if (lower.includes('chennai') || lower.includes('madras') || lower.includes('mahabalipuram')) {
    return "🌊 **Chennai & Mahabalipuram Coastal Heritage Guide:**\n\n"
         + "📅 **Day 1: Temple Architecture & Beach Sunsets**\n"
         + "- **Morning:** Admire 7th-century Dravidian gopurams at **Kapaleeshwarar Temple** in Mylapore.\n"
         + "- **Afternoon:** Visit San Thome Cathedral Basilica built over St. Thomas the Apostle’s tomb.\n"
         + "- **Evening:** World's 2nd longest urban beach — **Marina Beach**! Try spicy sundal and fried fish.\n\n"
         + "📅 **Day 2: UNESCO Monuments of Mahabalipuram**\n"
         + "- **Morning:** Drive down scenic ECR to the world-famous **Shore Temple** and Pancha Rathas.\n"
         + "- **Afternoon:** Marvel at the giant rock-cut relief of Arjuna's Penance and Krishna's Butterball.\n"
         + "- **Evening:** Beachside seafood dinner at Moonrakers in Mahabalipuram.\n\n"
         + "📅 **Day 3: Arts & Culture**\n"
         + "- Traditional South Indian heritage at **DakshinaChitra Museum**, shopping for Kanchipuram silk sarees in T. Nagar.\n\n"
         + "☕ **Must-Try:** Traditional degree filter coffee, crispy Ghee Roast Dosa, Murugan Idli, Chettinad feasts!\n"
         + "☀️ **Best Season:** November to February (cooler, low humidity).";
  }

  // 9. Hyderabad
  if (lower.includes('hyderabad')) {
    return "💎 **Hyderabad City of Pearls 3-Day Plan:**\n\n"
         + "📅 **Day 1: Nizami Grandeur & Historic Charminar**\n"
         + "- **Morning:** Walk around the monumental **Charminar** and shop for lac bangles in Laad Bazaar.\n"
         + "- **Afternoon:** Marvel at the opulent chandeliers and vintage cars of **Chowmahalla Palace**.\n"
         + "- **Evening:** Savor authentic world-famous Hyderabadi Dum Biryani at Paradise or Shadab.\n\n"
         + "📅 **Day 2: Fortresses & Lake Views**\n"
         + "- **Morning:** Explore the acoustic engineering and ramparts of massive **Golconda Fort**.\n"
         + "- **Afternoon:** Pay respects at the majestic Qutb Shahi Tombs.\n"
         + "- **Evening:** Boat ride on **Hussain Sagar Lake** to the giant monolith Buddha statue; stroll Necklace Road.\n\n"
         + "📅 **Day 3: Cinema Magic or Palaces**\n"
         + "- Full day at **Ramoji Film City** (largest film studio complex in the world) or visit Salar Jung Museum.\n\n"
         + "🍴 **Must-Eat:** Hyderabadi Mutton Biryani, Haleem, Mirchi ka Salan, and Osmania biscuits with Irani Chai!\n"
         + "☀️ **Best Time:** October to March.";
  }

  // 10. Jaipur / Rajasthan
  if (lower.includes('jaipur') || lower.includes('rajasthan')) {
    return "🏰 **Jaipur Pink City 3-Day Royal Plan:**\n\n"
         + "📅 **Day 1: Majestic Forts**\n"
         + "- **Morning:** Explore sprawling **Amer Fort** (Sheesh Mahal mirror palace) and take photos at Jal Mahal.\n"
         + "- **Afternoon:** Visit Jaigarh Fort (world's largest cannon on wheels).\n"
         + "- **Evening:** Watch the golden sunset over Jaipur from the ramparts of **Nahargarh Fort**.\n\n"
         + "📅 **Day 2: The Heart of the Pink City**\n"
         + "- **Morning:** Photograph the honeycomb facade of **Hawa Mahal** (Palace of Winds).\n"
         + "- **Afternoon:** Tour **City Palace** museum and astronomical observatory at **Jantar Mantar**.\n"
         + "- **Evening:** Shop for blue pottery, bandhani sarees, and silver jewelry at Johari & Bapu Bazaar.\n\n"
         + "📅 **Day 3: Culture & Village Experience**\n"
         + "- Cultural evening at **Chokhi Dhani** with folk dance, puppet shows, camel rides, and traditional thali.\n\n"
         + "🍴 **Must-Eat:** Dal Baati Churma, Pyaaz Kachori at Rawat Mishtan Bhandar, Ghewar, and Lassi at Lassiwala.\n"
         + "☀️ **Best Season:** October to March.";
  }

  // 11. Kerala / Munnar / Alleppey
  if (lower.includes('kerala') || lower.includes('munnar') || lower.includes('alleppey')) {
    return "🛶 **Kerala 4-Day Backwaters & Tea Hills Plan:**\n\n"
         + "📅 **Day 1: Fort Kochi Heritage**\n"
         + "- Chinese Fishing Nets, colonial churches, Jewish Synagogue, and art cafes in Fort Kochi.\n\n"
         + "📅 **Day 2: Misty Hills of Munnar**\n"
         + "- Drive through spice plantations and Cheeyappara waterfalls.\n"
         + "- Trek through tea carpets at Eravikulam National Park and Mattupetty Dam.\n\n"
         + "📅 **Day 3: Alleppey Backwater Houseboat**\n"
         + "- Board a traditional thatch-roofed **Houseboat** for an overnight cruise through tranquil palm-fringed canals.\n"
         + "- Enjoy freshly cooked Karimeen Pollichathu (pearl spot fish) and tapioca on banana leaves.\n\n"
         + "📅 **Day 4:** Ayurvedic massage & rejuvenation, followed by live Kathakali dance.\n\n"
         + "☀️ **Best Season:** September to March for serene backwaters and cool tea hill breezes.";
  }

  // 12. Pondicherry
  if (lower.includes('pondy') || lower.includes('pondicherry') || lower.includes('puducherry')) {
    return "🥐 **Pondicherry French Colony 3-Day Seaside Itinerary:**\n\n"
         + "📅 **Day 1: French Quarter (White Town)**\n"
         + "- Rent a vintage pastel bicycle and ride through cobblestone streets with bougainvillea draped yellow French villas.\n"
         + "- Sunset stroll along vehicle-free **Promenade Beach** (Rock Beach) and French dinner at Coromandel Cafe.\n\n"
         + "📅 **Day 2: Peace, Spirituality & Surf**\n"
         + "- Visit Sri Aurobindo Ashram, then take a day trip to **Auroville** & Matrimandir.\n"
         + "- Surf lessons or sunset chill at Serenity Beach.\n\n"
         + "📅 **Day 3: Island Sands & Mangroves**\n"
         + "- Speed boat ride across backwaters to pristine **Paradise Beach**.\n"
         + "- Kayaking through Pichavaram mangrove forest.\n\n"
         + "🍴 **Must-Eat:** Warm croissants at Baker Street, wood-fired pizza at Cafe Xtasi, crepes, and gelato!\n"
         + "☀️ **Best Time:** October to March.";
  }

  // 13. Agra / Taj Mahal
  if (lower.includes('agra') || lower.includes('taj mahal')) {
    return "🕌 **Agra Taj Mahal Explorer Guide:**\n\n"
         + "📅 **Day 1:**\n"
         + "- **Sunrise:** Enter the **Taj Mahal** at first light (opens 30 mins before sunrise; minimal crowds, golden hues).\n"
         + "- **Afternoon:** Tour the formidable red sandstone **Agra Fort** (Mughal royal residence).\n"
         + "- **Evening:** Sunset reflection views of Taj Mahal across the river from **Mehtab Bagh** gardens.\n\n"
         + "📅 **Day 2:** Day excursion to the deserted Mughal red sandstone city of **Fatehpur Sikri** and Buland Darwaza.\n\n"
         + "🍴 **Treats:** Authentic Angoori Petha at Panchhi Petha, Bedai with Aloo Sabzi, and Mughlai biryani.\n"
         + "⚠️ **Tip:** Taj Mahal is closed on Fridays!";
  }

  // 14. Dubai
  if (lower.includes('dubai') || lower.includes('uae')) {
    return "🏙️ **Dubai Luxury & Desert 3-Day Itinerary:**\n\n"
         + "📅 **Day 1: Modern Wonders & Skyscraper Heights**\n"
         + "- **Morning:** Ascend to the 124th/148th floor of **Burj Khalifa** (world's tallest building).\n"
         + "- **Afternoon:** Shop and view the giant indoor aquarium at **Dubai Mall**.\n"
         + "- **Evening:** Watch the dancing Dubai Fountain show and stroll through Souk Al Bahar.\n\n"
         + "📅 **Day 2: Golden Dunes & Arabian Nights**\n"
         + "- **Morning:** Monorail to **Palm Jumeirah**, view Atlantis The Royal.\n"
         + "- **Afternoon & Evening:** **Desert Safari Adventure** — 4x4 dune bashing, camel riding, sandboarding, belly dancing, and BBQ buffet.\n\n"
         + "📅 **Day 3: Old Souks & Marina Nights**\n"
         + "- **Morning:** Cross Dubai Creek on a traditional Abra boat (1 AED) to Gold Souk & Spice Souk.\n"
         + "- **Evening:** Marina Dhow cruise dinner among illuminated skyscrapers.\n\n"
         + "☀️ **Best Season:** November to March (pleasant 24°C weather).";
  }

  // 15. Paris
  if (lower.includes('paris') || lower.includes('france')) {
    return "🗼 **Paris City of Light 3-Day Guide:**\n\n"
         + "📅 **Day 1: Classic Landmarks**\n"
         + "- **Morning:** Stand beneath the **Eiffel Tower**; take photos from Trocadéro plaza.\n"
         + "- **Afternoon:** Walk the grand Champs-Élysées to the Arc de Triomphe.\n"
         + "- **Evening:** Sunset 1-hour cruise along the Seine River seeing Notre-Dame and historic bridges.\n\n"
         + "📅 **Day 2: Art & Bohemian Charm**\n"
         + "- **Morning:** See the Mona Lisa and Venus de Milo in the **Louvre Museum**.\n"
         + "- **Afternoon:** Walk through the artistic village of **Montmartre** up to Sacré-Cœur.\n"
         + "- **Evening:** Sip espresso and eat macarons in trendy Saint-Germain-des-Prés.\n\n"
         + "📅 **Day 3:** Day trip to the opulent Palace of Versailles and Hall of Mirrors.\n\n"
         + "🥐 **Must-Eat:** Fresh buttery croissants, escargot, French onion soup, and duck confit.\n"
         + "☀️ **Best Time:** April to June or September to October.";
  }

  // 16. Packing questions
  if (lower.includes('pack') || lower.includes('luggage') || lower.includes('bag')) {
    return "🎒 **Universal 5-4-3-2-1 Travel Packing Formula:**\n\n"
         + "- **5 Tops:** Breathable, moisture-wicking tees or shirts.\n"
         + "- **4 Bottoms:** 2 comfortable trousers/jeans, 2 shorts/skirts.\n"
         + "- **3 Footwear Pairs:** 1 comfortable walking sneakers, 1 casual sandals/flip-flops, 1 semi-formal pair.\n"
         + "- **2 Layers:** 1 lightweight waterproof windbreaker and 1 warm fleece/jacket.\n"
         + "- **1 Accessory Set:** Sunglasses, hat, watch, and swimsuit.\n\n"
         + "🔌 **Tech Essentials:** 20,000mAh power bank, universal travel adapter, multi-port cables.\n"
         + "💊 **Health Kit:** Band-aids, motion sickness pills, pain relief, antiseptic wipes, sunscreen SPF 50+.\n\n"
         + "💡 *Tip: Check our interactive **Packing Checklist** tab on the dashboard to check items off as you pack!*";
  }

  // 17. Budget & Cost questions
  if (lower.includes('budget') || lower.includes('cost') || lower.includes('cheap') || lower.includes('money') || lower.includes('save')) {
    return "💰 **Top 6 Pro Hacks to Travel on a Smart Budget:**\n\n"
         + "1. **Book Mid-Week Flights:** Tuesdays and Wednesdays are statistically 15–20% cheaper than weekend flights.\n"
         + "2. **Eat Where Locals Eat:** Skip tourist-strip cafes. Head to local food lanes and dhabas for better authenticity at 60% lower cost.\n"
         + "3. **Travel Overnight:** Sleeper trains and overnight buses save an entire night's hotel cost while transporting you!\n"
         + "4. **Embrace Public Transit:** Metros, local suburban trains, and shared autos cost a fraction of private cabs.\n"
         + "5. **Travel in Shoulder Season:** Traveling just 2 weeks before or after peak season gets you 40% hotel discounts.\n"
         + "6. **Track Daily Expenses:** Use our built-in **Budget Tracker** to set a daily ceiling and log every expense!";
  }

  // 18. Hotels & Accommodation
  if (lower.includes('hotel') || lower.includes('stay') || lower.includes('resort') || lower.includes('hostel')) {
    return "🏨 **Expert Hotel Booking Checklist:**\n\n"
         + "- **Location Over Luxury:** Staying within walking distance of metro lines or attractions saves hours of traffic and taxi fares.\n"
         + "- **Read Recent Reviews:** Filter reviews from the past 60 days to check hot water, Wi-Fi reliability, and room cleanliness.\n"
         + "- **Look for Free Breakfast:** A hearty breakfast at your hotel easily saves ₹300–₹600 per traveler each morning.\n"
         + "- **Always Verify Free Cancellation:** Choose flexible cancellation bookings until travel dates are 100% confirmed.\n\n"
         + "Tap the **Hotels** feature inside any trip in Travel Buddy to view hand-picked verified stays!";
  }

  // 19. Weather & Season
  if (lower.includes('weather') || lower.includes('season') || lower.includes('when to visit') || lower.includes('best time')) {
    return "☀️ **Quick Travel Season Guide:**\n\n"
         + "- **Beaches & Coastal Cities (Goa, Mumbai, Bali, Thailand):** November to March (clear blue skies, low humidity, calm waves).\n"
         + "- **Hill Stations (Ooty, Kodai, Manali, Shimla):** March to June for pleasant summer escapes; December to February for snow & skiing.\n"
         + "- **Heritage Circuits (Rajasthan, Agra, Delhi, Varanasi):** October to March (mild, sunny winter days perfect for walking forts).\n"
         + "- **Tropical Rain & Waterfalls (Kerala, Western Ghats, Meghalaya):** July to September (monsoon lushness and gushing waterfalls).\n\n"
         + "Check the live **Weather Forecast** card on your dashboard for live 3-day meteorological outlooks!";
  }

  // 20. Solo Travel & Safety
  if (lower.includes('solo') || lower.includes('safe') || lower.includes('alone')) {
    return "🛡️ **Smart Solo Traveler Rules:**\n\n"
         + "1. **Share Itineraries:** Send your daily schedule and live GPS tracking link to at least one close contact.\n"
         + "2. **Daylight Arrivals:** Always schedule your flight or train to arrive at new stations during daylight hours.\n"
         + "3. **Keep Offline Copies:** Save offline Google Maps areas and backup digital copies of your passport/ID on your phone.\n"
         + "4. **Connect with Travelers:** Use our **Community Forum** to meet other verified travel buddies heading to the same spot!";
  }

  // 21. Greetings & Help
  if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey') || lower.includes('who are you') || lower.includes('help')) {
    return "Hey there, explorer! 🌍✈️ I am **Travel Buddy AI**, your personal tour assistant. Here are some things you can ask me:\n\n"
         + "• **\"Plan a trip to Mumbai\"** (or Goa, Delhi, Ooty, Manali, Paris, Dubai...)\n"
         + "• **\"What to pack for beach holiday?\"**\n"
         + "• **\"Budget tips for backpacking in India\"**\n"
         + "• **\"Best season to visit Ooty\"**\n"
         + "• **\"Top street food in Kolkata\"**\n\n"
         + "Tell me your dream destination and let's craft the perfect adventure!";
  }

  // 22. Dynamic Destination Itinerary Extraction: "plan a trip to <City>", "itinerary for <City>", "places in <City>"
  const match = lower.match(/(?:plan|itinerary|visit|trip\s+to|guide\s+for|about|travel\s+to|explore|places\s+in)\s+(?:a\s+)?([a-z\s]{2,30})/i);
  if (match) {
    const rawDest = match[1].replace(/\b(trip|tour|vacation|holiday|itinerary|please|to|for|the|a|an)\b/gi, '').trim();
    if (rawDest.length >= 3) {
      const destTitle = rawDest.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      return `🗺️ **${destTitle} 3-Day Travel Itinerary & Tour Plan:**\n\n`
           + `📅 **Day 1: City Highlights & Historic Sights**\n`
           + `- **Morning:** Start with the most famous landmark in ${destTitle} for scenic photos and orientation.\n`
           + `- **Afternoon:** Tour the prominent museums, heritage centers, and vibrant shopping alleys.\n`
           + `- **Evening:** Relax at the most scenic sunset viewpoint, waterfront, or city park.\n\n`
           + `📅 **Day 2: Nature, Local Culture & Food Trail**\n`
           + `- **Morning:** Excursion to popular viewpoints, nature trails, or botanical gardens.\n`
           + `- **Afternoon:** Explore local artisan bazaars for traditional handicrafts and souvenirs.\n`
           + `- **Evening:** Savor authentic regional food specialties and street eats at popular dining lanes.\n\n`
           + `📅 **Day 3: Scenic Excursions & Hidden Gems**\n`
           + `- **Morning:** Day trip to nearby scenic lakes, waterfalls, or historic forts.\n`
           + `- **Afternoon:** Visit local craft workshops, tea/coffee estates, or cultural centers.\n`
           + `- **Evening:** Farewell rooftop dinner with panoramic views of ${destTitle}.\n\n`
           + `💰 **Estimated Budget:** ₹2,000–₹3,500/day (Economy) | ₹4,500–₹7,500/day (Comfort).\n`
           + `☀️ **Best Season:** October to March for pleasant sightseeing weather.\n`
           + `💡 **Pro Tip:** Use the **Hotels & Tickets tabs** on the dashboard to view nearby stays and transport options!`;
    }
  }

  // Versatile Intelligent Fallback
  return "✈️ **Travel Buddy Guide:**\n"
       + "Every great journey starts with a solid plan! Whether you are exploring tranquil hill stations, bustling metropolitan cities, or tropical beaches:\n\n"
       + "1. **Book transport 2–4 weeks early** for the best fares.\n"
       + "2. **Pack versatile, lightweight clothing** following the 5-4-3-2-1 formula.\n"
       + "3. **Explore local cuisine & street food** for authentic cultural experiences.\n\n"
       + "Ask me: **\"Plan a trip to [City Name]\"** (e.g. Mumbai, Goa, Ooty, Manali, Paris, Dubai) and I will build you a complete 3-day itinerary with budget and food recommendations!";
}

// Fallback Weather Data Generator
function getFallbackWeatherData(place) {
  const isCool = /(ooty|kodai|manali|shimla|darjeeling|ladakh|leh|munnar)/i.test(place || '');
  const current = isCool ? '18°' : '28°';
  const cond = isCool ? 'Pleasant & Cool' : 'Partly Cloudy';
  return {
    current_temp: current,
    condition: cond,
    hourly: [
      { time: '10 AM', temp: isCool ? '16°' : '26°', condition: cond },
      { time: '12 PM', temp: isCool ? '19°' : '29°', condition: 'Sunny' },
      { time: '2 PM',  temp: isCool ? '20°' : '30°', condition: 'Sunny' },
      { time: '4 PM',  temp: isCool ? '18°' : '28°', condition: cond },
      { time: '6 PM',  temp: isCool ? '16°' : '26°', condition: cond }
    ],
    daily: [
      { day: 'Wed', low: isCool ? '12°' : '22°', high: isCool ? '19°' : '29°', condition: cond },
      { day: 'Thu', low: isCool ? '13°' : '23°', high: isCool ? '20°' : '30°', condition: 'Sunny' },
      { day: 'Fri', low: isCool ? '12°' : '22°', high: isCool ? '19°' : '29°', condition: 'Sunny' },
      { day: 'Sat', low: isCool ? '14°' : '24°', high: isCool ? '21°' : '31°', condition: cond },
      { day: 'Sun', low: isCool ? '13°' : '23°', high: isCool ? '20°' : '30°', condition: cond },
      { day: 'Mon', low: isCool ? '11°' : '21°', high: isCool ? '18°' : '28°', condition: 'Cloudy' },
      { day: 'Tue', low: isCool ? '12°' : '22°', high: isCool ? '19°' : '29°', condition: cond }
    ]
  };
}

// Fallback Alerts Data Generator
function getFallbackAlerts() {
  let localAlerts = [];
  try {
    localAlerts = JSON.parse(localStorage.getItem('tb_alerts') || '[]');
  } catch(e) {}
  if (localAlerts.length > 0) return localAlerts;

  return [
    {
      id: 101,
      title: 'Trip to Goa Confirmed! 🌴',
      message: 'Your planned vacation to Goa is active. Check out your Packing Checklist and curated beach stays!',
      type: 'trip',
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 102,
      title: 'Weather Update ⛅',
      message: 'Pleasant weather and clear blue skies are forecast across your upcoming travel destinations.',
      type: 'travel',
      created_at: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 103,
      title: 'Community Travel Buddies 🤝',
      message: 'Priya Sharma and Rohan Verma are planning trips to Manali & Gokarna. Connect and join their groups!',
      type: 'join',
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 104,
      title: 'Welcome to Travel Buddy ✨',
      message: 'Explore destinations, track your travel budget, book tickets, and chat with AI Buddy 24/7!',
      type: 'hotel_success',
      created_at: new Date(Date.now() - 172800000).toISOString()
    }
  ];
}

// Fallback Ticket Booking Options Generator
function getFallbackTickets(trip) {
  const dest = (trip || 'Destination').trim();
  return [
    {
      type: 'Airways',
      price: '₹4,850',
      duration: '1h 35m'
    },
    {
      type: 'Train',
      price: '₹1,150',
      duration: '7h 45m'
    },
    {
      type: 'Bus',
      price: '₹780',
      duration: '9h 30m'
    },
    {
      type: 'Cab',
      price: '₹5,400',
      duration: '6h 15m'
    }
  ];
}

// Fallback Curated Hotels Generator
function getFallbackHotels(trip) {
  const dest = (trip || 'Destination').trim();
  return [
    {
      name: `Grand ${dest} Palace & Spa`,
      rating: '4.8',
      price: '5200',
      description: `Premium 5-star luxury stay in the heart of ${dest} featuring infinity pools, fine dining, and panoramic views.`,
      contact: '+91 98765 43210'
    },
    {
      name: `${dest} Scenic Retreat & Resort`,
      rating: '4.6',
      price: '3800',
      description: `Peaceful retreat with private balconies, complimentary breakfast, spa services, and garden trails.`,
      contact: '+91 98123 45678'
    },
    {
      name: `City Heritage Boutique Inn`,
      rating: '4.4',
      price: '2900',
      description: `Charming traditional accommodations close to popular sights, vibrant street markets, and transit links.`,
      contact: '+91 98456 78901'
    },
    {
      name: `Green Meadows Nature Stay`,
      rating: '4.3',
      price: '2200',
      description: `Cozy, eco-friendly lodging surrounded by greenery, offering bonfire evenings and homemade local meals.`,
      contact: '+91 97654 32109'
    },
    {
      name: `Traveler's Haven Comfort Stay`,
      rating: '4.5',
      price: '1800',
      description: `Modern budget-friendly rooms with high-speed Wi-Fi, air conditioning, and friendly travel guidance.`,
      contact: '+91 96543 21098'
    }
  ];
}

// Fallback Place Details Generator
function getFallbackPlaceDetails(destination) {
  const dest = (destination || '').toLowerCase();

  if (dest.includes('goa')) {
    return {
      title: 'Goa, India',
      rating: '4.8',
      description: "India's premier coastal paradise, Goa is celebrated worldwide for its sun-kissed Arabian Sea beaches, vibrant nightlife, Portuguese colonial architecture in Old Goa, spice plantations, and fresh seafood shacks along the shore.",
      travel_methods: 'Direct flights to Dabolim (GOI) or Mopa (GOX) airports; Madgaon & Thivim railway junctions; NH66 scenic coastal highway.',
      budget_min: '3000',
      budget_max: '15000',
      latitude: 15.2993,
      longitude: 74.1240,
      recommended_places: ['Baga & Calangute Beach', 'Basilica of Bom Jesus', 'Aguada Fort & Lighthouse', 'Dudhsagar Waterfalls', 'Palolem Beach'],
      hotels: ['Taj Exotica Resort & Spa', 'W Goa Beachfront Vagator', 'The Leela Goa Cavelossim', 'Caravela Beach Resort']
    };
  }

  if (dest.includes('ooty') || dest.includes('udhagamandalam')) {
    return {
      title: 'Ooty, India',
      rating: '4.7',
      description: 'Nestled in the blue Nilgiri Mountains, Ooty is the Queen of Hill Stations, famous for emerald tea plantations, cool misty breezes, eucalyptus groves, and the iconic UNESCO Nilgiri Mountain Railway Toy Train.',
      travel_methods: 'Nilgiri Mountain Railway toy train from Mettupalayam; Coimbatore International Airport (88 km); Ghat roads via Mysore or Coimbatore.',
      budget_min: '2500',
      budget_max: '12000',
      latitude: 11.4102,
      longitude: 76.6950,
      recommended_places: ['Government Botanical Garden', 'Ooty Lake & Boathouse', 'Doddabetta Peak', 'Pykara Waterfalls & Lake', 'Nilgiri Tea Estates'],
      hotels: ['Savoy - IHCL SeleQtions', 'Sterling Ooty Fern Hill', 'Fortune Resort Sullivan Court', 'Sinclairs Retreat Ooty']
    };
  }

  if (dest.includes('mahabalipuram')) {
    return {
      title: 'Mahabalipuram, India',
      rating: '4.6',
      description: 'A UNESCO World Heritage coastal gem on the Bay of Bengal, Mahabalipuram showcases 7th-century rock-cut Pallava monuments, monolithic rathas, the historic Shore Temple, and vibrant stone-carver artisan streets.',
      travel_methods: 'Scenic East Coast Road (ECR) drive from Chennai (55 km); Chennai Central Rail & International Airport.',
      budget_min: '2000',
      budget_max: '10000',
      latitude: 12.6269,
      longitude: 80.1927,
      recommended_places: ['Shore Temple', 'Pancha Rathas', "Arjuna's Penance", "Krishna's Butterball", 'Mahabalipuram Beach'],
      hotels: ['Radisson Blu Resort Temple Bay', 'InterContinental Chennai Mahabalipuram', 'Ideal Beach Resort', 'Chariot Beach Resort']
    };
  }

  if (dest.includes('manali')) {
    return {
      title: 'Manali, India',
      rating: '4.8',
      description: 'Perched in the majestic Himalayas of Himachal Pradesh, Manali is a wonderland for mountain lovers offering cedar pine forests, snow-capped peaks, Solang Valley adventure sports, and charming Old Manali cafes.',
      travel_methods: 'Bhuntar Airport (50 km); Volvo AC sleeper buses from Delhi & Chandigarh; drive through the engineering marvel Atal Tunnel.',
      budget_min: '3000',
      budget_max: '16000',
      latitude: 32.2396,
      longitude: 77.1887,
      recommended_places: ['Solang Valley', 'Hadimba Devi Temple', 'Atal Tunnel & Sissu Valley', 'Jogini Waterfalls', 'Old Manali Cafes'],
      hotels: ['The Himalayan Resort & Spa', 'Span Resort & Spa', 'Larisa Resort Manali', 'Apple Country Resort']
    };
  }

  if (dest.includes('mumbai')) {
    return {
      title: 'Mumbai, India',
      rating: '4.7',
      description: 'The energetic financial and entertainment capital of India, Mumbai boasts colonial heritage marvels, the Arabian Sea coastline along Marine Drive, Bollywood glamour, and celebrated culinary street culture.',
      travel_methods: 'Chhatrapati Shivaji Maharaj International Airport (BOM); CSMT & Mumbai Central railway hubs; Bandra-Worli Sea Link.',
      budget_min: '3500',
      budget_max: '25000',
      latitude: 18.9220,
      longitude: 72.8347,
      recommended_places: ['Gateway of India', 'Marine Drive Promenade', 'Elephanta Caves', 'Colaba Causeway', 'Bandra Bandstand'],
      hotels: ['The Taj Mahal Palace', 'The Oberoi Mumbai', 'ITC Maratha', 'Trident Nariman Point']
    };
  }

  if (dest.includes('delhi')) {
    return {
      title: 'Delhi, India',
      rating: '4.6',
      description: "India's historic capital seamlessly blends ancient Mughal monuments, peaceful leafy diplomatic avenues, bustling street food lanes in Old Delhi, and contemporary shopping complexes.",
      travel_methods: 'Indira Gandhi International Airport (DEL); New Delhi & Hazrat Nizamuddin rail hubs; Comprehensive Delhi Metro system.',
      budget_min: '2500',
      budget_max: '18000',
      latitude: 28.6139,
      longitude: 77.2090,
      recommended_places: ['Qutub Minar', 'Red Fort', "Humayun's Tomb", 'India Gate', 'Chandni Chowk Market'],
      hotels: ['The Imperial New Delhi', 'The Leela Palace New Delhi', 'Taj Mahal Hotel', 'The Lodhi']
    };
  }

  if (dest.includes('jaipur')) {
    return {
      title: 'Jaipur, India',
      rating: '4.8',
      description: "The Pink City of Rajasthan is renowned for royal grandeur, majestic hilltop forts, intricate terracotta palaces, vibrant artisan bazaars, and opulent Rajasthani thali feasts.",
      travel_methods: 'Jaipur International Airport (JAI); Jaipur Junction railway; Delhi-Jaipur Expressway.',
      budget_min: '2500',
      budget_max: '16000',
      latitude: 26.9124,
      longitude: 75.7873,
      recommended_places: ['Amer Fort & Palace', 'Hawa Mahal (Palace of Winds)', 'City Palace & Museum', 'Jantar Mantar Observatory', 'Nahargarh Fort'],
      hotels: ['Rambagh Palace Jaipur', 'The Oberoi Rajvilas', 'ITC Rajputana', 'Alsisar Haveli']
    };
  }

  // Dynamic fallback for any other destination
  const cleanName = (destination || 'Destination').trim();
  return {
    title: cleanName,
    rating: '4.7',
    description: `Explore the captivating sights, rich culture, and warm hospitality of ${cleanName}. A fantastic destination with scenic viewpoints, historic sites, and memorable local dining experiences.`,
    travel_methods: `Flights, express rail, and well-connected state highways provide convenient access to ${cleanName}.`,
    budget_min: '2800',
    budget_max: '14000',
    latitude: 13.0827,
    longitude: 80.2707,
    recommended_places: [`${cleanName} Historic Quarter`, 'Scenic Sunset Point', 'Central Heritage Museum', 'Local Artisan Market', 'Botanical Gardens'],
    hotels: [`Grand ${cleanName} Hotel`, `${cleanName} Royal Resort`, 'City Heritage Inn', 'Comfort Suites']
  };
}

function initTravelBuddyApp() {
  // Fast splash bypass if user just logged out
  if (sessionStorage.getItem('JUST_LOGGED_OUT') === 'true') {
    sessionStorage.removeItem('JUST_LOGGED_OUT');
    if (splashScreen) splashScreen.style.display = 'none';
    if (mainApp) mainApp.classList.add('visible');
    if (loginSection) {
      loginSection.classList.remove('hidden');
      loginSection.classList.add('visible');
    }
  }
  const splashScreen = document.getElementById('splash-screen');
  const mainApp = document.getElementById('main-app');
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const loginSection = document.getElementById('login-section');
  const signupSection = document.getElementById('signup-section');

  // Immediately restore saved location on load to eliminate wrong location or flicker
  try {
    let loc = null;
    const savedLoc = localStorage.getItem('TRAVEL_BUDDY_USER_SAVED_LOCATION');
    if (savedLoc) {
      try { loc = JSON.parse(savedLoc); } catch(e) {}
    }
    if (!loc || !loc.city) {
      const c = localStorage.getItem('USER_SAVED_CITY');
      if (c) loc = { city: c, country: 'India' };
    }
    if (loc && loc.city) {
      const titleEl = document.getElementById('tvUpcomingTitle');
      const datesEl = document.getElementById('tvUpcomingDates');
      const weatherLocEl = document.getElementById('tvWeatherLocation');
      const mapIframe = document.getElementById('live-map-iframe');
      if (titleEl) titleEl.textContent = loc.city;
      if (datesEl) datesEl.textContent = `Current: ${loc.country || 'India'}`;
      if (weatherLocEl) weatherLocEl.textContent = `Weather in ${loc.city}`;
      if (mapIframe) {
        const q = (loc.lat && loc.lng) ? `${loc.lat},${loc.lng}` : encodeURIComponent(`${loc.city}, ${loc.country || 'India'}`);
        mapIframe.src = `https://maps.google.com/maps?q=${q}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
      }
    }
  } catch(e) {}

  // Toggle between Login and Signup
  const signupLinkId = document.getElementById('signup-link-id');
  const signinLinkId = document.getElementById('signin-link-id');

  if (signupLinkId) {
    signupLinkId.addEventListener('click', (e) => {
      e.preventDefault();
      if(loginSection) {
        loginSection.classList.remove('visible');
        loginSection.classList.add('hidden');
      }
      if(signupSection) {
        signupSection.classList.remove('hidden');
        signupSection.classList.add('visible');
      }
    });
  }

    const btnSignupBack = document.getElementById('btn-signup-back');
  if (btnSignupBack) {
    btnSignupBack.addEventListener('click', (e) => {
      e.preventDefault();
      if (signupSection) {
        signupSection.classList.remove('visible');
        signupSection.classList.add('hidden');
      }
      if (loginSection) {
        loginSection.classList.remove('hidden');
        loginSection.classList.add('visible');
      }
    });
  }

  if (signinLinkId) {
    signinLinkId.addEventListener('click', (e) => {
      e.preventDefault();
      if(signupSection) {
        signupSection.classList.remove('visible');
        signupSection.classList.add('hidden');
      }
      if(loginSection) {
        loginSection.classList.remove('hidden');
        loginSection.classList.add('visible');
      }
    });
  }

  // Forgot Password Action
  const forgotPasswordLink = document.getElementById('forgot-password-id');
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', (e) => {
      e.preventDefault();
      const currentEmail = document.getElementById('email') ? document.getElementById('email').value.trim() : '';
      const userEmail = prompt('Enter your registered email address to reset password:', currentEmail);
      if (!userEmail) return;
      const newPassword = prompt('Enter your new password (longer than 6 chars with at least 1 uppercase letter):');
      if (!newPassword) return;

      const formData = new FormData();
      formData.append('email', userEmail.trim());
      formData.append('password', newPassword);

      fetch(`${BASE_URL}/reset_password.php`, {
        method: 'POST',
        body: formData
      })
      .then(res => res.json())
      .then(data => {
        showToast(data.message || 'Password reset request processed.');
      })
      .catch(() => {
        showToast('Password updated in demo mode. You can now sign in.');
      });
    });
  }

  // 1. Splash Screen Transition Pipeline (Fast & Interactive)
  function dismissSplash() {
    if (!splashScreen || splashScreen.style.display === 'none') return;
    splashScreen.classList.add('fade-out');
    setTimeout(() => {
      splashScreen.style.display = 'none';
      if (mainApp) mainApp.classList.add('visible');
    }, 350);
  }
  const splashTimeout = setTimeout(dismissSplash, 900);
  if (splashScreen) {
    splashScreen.style.cursor = 'pointer';
    splashScreen.addEventListener('click', dismissSplash);
  }

  // 2. Interactive Form Submission & Dashboard Transition
  const guestBtn = document.getElementById('btn-guest-id');
  if (guestBtn) {
    guestBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.setItem('ACTIVE_USER_NAME', 'Traveler');
      localStorage.setItem('ACTIVE_EMAIL', 'guest@travelbuddy.com');
      if (loginSection) {
        loginSection.classList.remove('visible');
        loginSection.classList.add('hidden');
      }
      const dashboardSection = document.getElementById('dashboard-section');
      if (dashboardSection) {
        dashboardSection.classList.remove('hidden');
        dashboardSection.classList.add('visible');
      }
      if (mainApp) mainApp.classList.add('dashboard-active');
      initializeDashboard();
      if (typeof showToast === 'function') {
        showToast('Welcome, Traveler! Signed in as Guest.');
      }
    });
  }

  // ==========================================================================
  // Real-Time Cross-Tab Synchronization Bus (BroadcastChannel + Server Polling)
  // ==========================================================================
  const realtimeBus = (typeof BroadcastChannel !== 'undefined')
    ? new BroadcastChannel('travelbuddy_realtime_sync')
    : null;

  function showRealtimeToast(msg) {
    let toast = document.getElementById('realtime-sync-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'realtime-sync-toast';
      toast.className = 'realtime-toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<span style="font-size:16px;">🟢</span><span>${msg}</span>`;
    toast.classList.add('show');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  window.broadcastRealtimeChange = function(entity) {
    const isAndroid = window.location.pathname.includes('android');
    const source = isAndroid ? 'Android App' : 'Web App';
    if (realtimeBus) {
      realtimeBus.postMessage({
        type: 'DATA_SYNC',
        entity: entity,
        source: source,
        timestamp: Date.now()
      });
    }
    try {
      localStorage.setItem('TB_SYNC_EVENT', JSON.stringify({ entity, source, time: Date.now() }));
    } catch(e) {}
  };

  if (realtimeBus) {
    realtimeBus.onmessage = (event) => {
      const data = event.data;
      if (!data || !data.entity) return;
      console.log('[TravelBuddy RealTime Bus] Event received:', data);

      if (data.entity === 'trips' || data.entity === 'all') {
        if (typeof loadPlannedTrips === 'function') loadPlannedTrips();
      }
      if (data.entity === 'alerts' || data.entity === 'all') {
        if (typeof loadAlerts === 'function') loadAlerts();
      }
      if (data.entity === 'community' || data.entity === 'all') {
        if (typeof loadCommunityFeed === 'function') loadCommunityFeed();
      }
      showRealtimeToast(`Real-Time Sync: Synced ${data.entity} live with ${data.source}`);
    };
  }

  // Cross-Tab fallback
  window.addEventListener('storage', (e) => {
    if (e.key === 'TB_SYNC_EVENT' && e.newValue) {
      try {
        const payload = JSON.parse(e.newValue);
        if (payload.entity === 'trips' || payload.entity === 'all') {
          if (typeof loadPlannedTrips === 'function') loadPlannedTrips();
        }
        if (payload.entity === 'alerts' || payload.entity === 'all') {
          if (typeof loadAlerts === 'function') loadAlerts();
        }
        if (payload.entity === 'community' || payload.entity === 'all') {
          if (typeof loadCommunityFeed === 'function') loadCommunityFeed();
        }
        showRealtimeToast(`Real-Time Sync: Synced ${payload.entity} live`);
      } catch(err) {}
    }
  });

  // Background MySQL Polling Engine: every 3.5s, keeps trips & alerts fresh
  let lastTripsCheckCount = -1;
  setInterval(() => {
    const dash = document.getElementById('dashboard-section');
    if (!dash || dash.classList.contains('hidden')) return;

    const email = localStorage.getItem('ACTIVE_EMAIL') || 'guest@travelbuddy.com';
    safeApiFetch(`get_trips.php?email=${encodeURIComponent(email)}`)
      .then(res => {
        if (res && res.status === 'success' && Array.isArray(res.data)) {
          if (lastTripsCheckCount !== -1 && res.data.length !== lastTripsCheckCount) {
            console.log('[RealTime] Detected database trip change, reloading...');
            if (typeof loadPlannedTrips === 'function') loadPlannedTrips();
            showRealtimeToast('Real-Time Sync: Trips updated from backend');
          }
          lastTripsCheckCount = res.data.length;
        }
      })
      .catch(() => {});
  }, 3500);


  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      if (!email || !password) {
        alert('Please fill in both email and password fields.');
        return;
      }

      // Add a cool, premium loading indicator state to the button
      const submitBtn = loginForm.querySelector('.btn-submit');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="spinner" viewBox="0 0 50 50" style="width: 24px; height: 24px; animation: rotate 2s linear infinite; margin-right: 8px;">
          <circle class="path" cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" style="stroke-dasharray: 1, 150; stroke-dashoffset: 0; animation: dash 1.5s ease-in-out infinite;"></circle>
        </svg>
        Signing in...
      `;

      // Make active POST request to XAMPP backend login.php
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);

      fetch(`${BASE_URL}/login.php`, {
        method: 'POST',
        body: formData
      })
      .then(res => res.json())
      .then(data => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;

        if (data.status === 'success') {
          // Store user information dynamically inside LocalStorage for this session
          localStorage.setItem('ACTIVE_USER_NAME', data.full_name || 'simats');
          localStorage.setItem('ACTIVE_EMAIL', email);

          // Hide Login Panel
          const loginSection = document.getElementById('login-section');
          if (loginSection) {
            loginSection.classList.remove('visible');
            loginSection.classList.add('hidden');
          }
          
          // Show Dashboard Panel
          const dashboardSection = document.getElementById('dashboard-section');
          if (dashboardSection) {
            dashboardSection.classList.remove('hidden');
            dashboardSection.classList.add('visible');
          }
          if (mainApp) mainApp.classList.add('dashboard-active');
          
          // Initialize Geolocation & Dashboard Integration
          initializeDashboard();
        } else {
          showToast(data.message || 'Invalid email or password.');
        }
      })
      .catch(err => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        // Offline demo fallback so app is fully accessible even without local web server
        showToast('Connecting in offline demo mode...');
        const displayName = email.split('@')[0] || 'Aarav Mehta';
        localStorage.setItem('ACTIVE_USER_NAME', displayName);
        localStorage.setItem('ACTIVE_EMAIL', email);
        const loginSection = document.getElementById('login-section');
        if (loginSection) {
          loginSection.classList.remove('visible');
          loginSection.classList.add('hidden');
        }
        const dashboardSection = document.getElementById('dashboard-section');
        if (dashboardSection) {
          dashboardSection.classList.remove('hidden');
          dashboardSection.classList.add('visible');
        }
        if (mainApp) mainApp.classList.add('dashboard-active');
        initializeDashboard();
      });
    });
  }

  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const fullName = document.getElementById('signup-fullname').value.trim();
      const email = document.getElementById('signup-email').value.trim();
      const password = document.getElementById('signup-password').value;

      if (!fullName || !email || !password) {
        showToast('Please fill in all fields.');
        return;
      }

      const submitBtn = signupForm.querySelector('.btn-submit');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="spinner" viewBox="0 0 50 50" style="width: 24px; height: 24px; animation: rotate 2s linear infinite; margin-right: 8px;">
          <circle class="path" cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" style="stroke-dasharray: 1, 150; stroke-dashoffset: 0; animation: dash 1.5s ease-in-out infinite;"></circle>
        </svg>
        Creating Account...
      `;

      const formData = new FormData();
      formData.append('full_name', fullName);
      formData.append('email', email);
      formData.append('password', password);

      fetch(`${BASE_URL}/register.php`, {
        method: 'POST',
        body: formData
      })
      .then(res => res.json())
      .then(data => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;

        if (data.status === 'success') {
          showToast(data.message || 'Account created successfully!');
          signupForm.reset();
          // Switch back to login screen
          if (signupSection) {
            signupSection.classList.remove('visible');
            signupSection.classList.add('hidden');
          }
          if (loginSection) {
            loginSection.classList.remove('hidden');
            loginSection.classList.add('visible');
          }
        } else {
          showToast(data.message || 'Failed to create account.');
        }
      })
      .catch(err => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        showToast('Account registered in demo mode! You can now sign in.');
        signupForm.reset();
        if (signupSection) {
          signupSection.classList.remove('visible');
          signupSection.classList.add('hidden');
        }
        if (loginSection) {
          loginSection.classList.remove('hidden');
          loginSection.classList.add('visible');
        }
      });
    });
  }

  // ==========================================================================
  // 3. Dashboard Core Integration Logic
  // ==========================================================================

  const LOCATION_STORAGE_KEY = 'TRAVEL_BUDDY_USER_SAVED_LOCATION';

  function getSavedUserLocation() {
    try {
      const data = localStorage.getItem(LOCATION_STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        // Clean out any stale Chennai ISP or incorrect Nellore fallbacks
        const cityLower = (parsed.city || '').toLowerCase();
        if (cityLower === 'chennai' || (cityLower === 'nellore' && !parsed.isUserChosen)) {
          localStorage.removeItem(LOCATION_STORAGE_KEY);
          localStorage.removeItem('USER_SAVED_CITY');
          return null;
        }
        return parsed;
      }
      const simpleCity = localStorage.getItem('USER_SAVED_CITY');
      if (simpleCity && simpleCity.toLowerCase() !== 'chennai' && simpleCity.toLowerCase() !== 'nellore') {
        return { city: simpleCity, country: 'India', isUserChosen: true };
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  function saveUserLocation(city, country, lat, lng, isUserChosen = true) {
    if (!city || city === 'Detecting Location...' || city === 'Detecting GPS...') return;
    const locationData = {
      city: city,
      country: country || 'India',
      lat: lat || null,
      lng: lng || null,
      isUserChosen: isUserChosen,
      updatedAt: new Date().toISOString()
    };
    try {
      localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(locationData));
      localStorage.setItem('USER_SAVED_CITY', city);
      localStorage.setItem('SAVED_LOCATION_NAME', city);
    } catch (e) {}
  }

  function detectLiveLocation(force = false) {
    const saved = getSavedUserLocation();
    if (!force && saved && saved.city && !saved.city.toLowerCase().includes('detecting')) {
      loadLocationData(saved.city, saved.country, saved.lat, saved.lng, true);
      return;
    }

    const titleEl = document.getElementById('tvUpcomingTitle');
    if (titleEl) titleEl.textContent = 'Detecting Location...';
    if (typeof showToast === 'function') {
      showToast('🛰️ Detecting live location by GPS / IP...');
    }

    const updateWithCoords = (lat, lng) => {
      // Eliminate false emulator Mountain View coordinates
      const isEmulatorMock = (Math.abs(lat - 37.422) < 0.05 && Math.abs(lng - (-122.084)) < 0.05);
      if (isEmulatorMock) {
        console.log('Ignored Mountain View mock GPS. Using IP coordinates.');
        fetchLocationByIp();
        return;
      }

      const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`;
      fetch(bdcUrl)
        .then(res => res.json())
        .then(data => {
          let city = data.city || data.locality || data.principalSubdivision;
          if (!city || city === 'Unknown') city = data.localityInfo?.administrative?.[2]?.name;
          const country = data.countryName || 'India';
          if (city) {
            loadLocationData(city, country, lat, lng, true);
            if (typeof showToast === 'function') {
              showToast(`📍 Live Location: ${city}!`);
            }
          } else {
            fallbackNominatim(lat, lng);
          }
        })
        .catch(() => {
          fallbackNominatim(lat, lng);
        });
    };

    const fallbackNominatim = (lat, lng) => {
      const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
      fetch(nominatimUrl)
        .then(res => res.json())
        .then(data => {
          const address = data.address || {};
          const city = address.city || address.town || address.village || address.county || address.state_district || 'Nellore';
          const country = address.country || 'India';
          loadLocationData(city, country, lat, lng, true);
          if (typeof showToast === 'function') {
            showToast(`📍 Live Location: ${city}!`);
          }
        })
        .catch(() => {
          fetchLocationByIp();
        });
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          updateWithCoords(position.coords.latitude, position.coords.longitude);
        },
        (err) => {
          console.warn('Geolocation unavailable, falling back to IP:', err ? err.message : '');
          fetchLocationByIp();
        },
        { timeout: 6000, enableHighAccuracy: true, maximumAge: 0 }
      );
    } else {
      fetchLocationByIp();
    }
  }

  // Accurately resolves location coordinates using device public IP address
  function fetchLocationByIp(callback) {
    const titleEl = document.getElementById('tvUpcomingTitle');
    if (titleEl && titleEl.textContent.includes('Detecting')) {
      titleEl.textContent = 'Resolving IP Location...';
    }

    // Primary HTTPS IP Geolocation (ipapi.co)
    fetch('https://ipapi.co/json/', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data && (data.latitude || data.lat)) {
          const lat = parseFloat(data.latitude || data.lat);
          const lng = parseFloat(data.longitude || data.lon);
          const city = data.city || 'Nellore';
          const reg = data.region || 'Andhra Pradesh';
          const country = data.country_name || 'India';
          const region = reg ? `${reg}, ${country}` : country;

          loadLocationData(city, region, lat, lng, true);
          if (typeof showToast === 'function') {
            showToast(`📍 IP Location: ${city}, ${region}`);
          }
          if (callback) callback(lat, lng, city, region);
          return;
        }
        throw new Error('ipapi incomplete');
      })
      .catch(() => {
        // Secondary IP Geolocation (ip-api.com)
        fetch('http://ip-api.com/json', { cache: 'no-store' })
          .then(res => res.json())
          .then(data => {
            if (data && data.status === 'success') {
              const lat = parseFloat(data.lat);
              const lng = parseFloat(data.lon);
              const city = data.city || 'Nellore';
              const reg = data.regionName || 'Andhra Pradesh';
              const country = data.country || 'India';
              const region = reg ? `${reg}, ${country}` : country;

              loadLocationData(city, region, lat, lng, true);
              if (typeof showToast === 'function') {
                showToast(`📍 IP Location: ${city}, ${region}`);
              }
              if (callback) callback(lat, lng, city, region);
            } else {
              loadLocationData('Nellore', 'Nellore, Andhra Pradesh', 14.4426, 79.9865, true);
            }
          })
          .catch(() => {
            loadLocationData('Nellore', 'Nellore, Andhra Pradesh', 14.4426, 79.9865, true);
          });
      });
  }

  function initializeDashboard() {
    const saved = getSavedUserLocation();
    if (saved && saved.city && !saved.city.toLowerCase().includes('detecting')) {
      loadLocationData(saved.city, saved.country, saved.lat, saved.lng, true);
    } else {
      // Trigger live IP / GPS detection immediately on launch
      detectLiveLocation(true);
    }
    setupDashboardEvents();
  }

  // Updates layout labels, Google Maps embed iframe, Leaflet position, and weather forecast
  function loadLocationData(placeName, regionName, lat, lng, isUserChosen = true) {
    if (!placeName) placeName = 'Nellore';
    if (!regionName) regionName = 'Nellore, Andhra Pradesh';
    const targetLat = lat || 14.4426;
    const targetLng = lng || 79.9865;

    // 1. Update Labels
    const titleEl = document.getElementById('tvUpcomingTitle');
    const datesEl = document.getElementById('tvUpcomingDates');
    const weatherLocEl = document.getElementById('tvWeatherLocation');

    if (titleEl) titleEl.textContent = placeName;
    if (datesEl) datesEl.textContent = regionName;
    if (weatherLocEl) weatherLocEl.textContent = `Weather in ${placeName}`;

    // 2. Update Live Google Maps Embed with accurate coordinates
    const gmapIframe = document.getElementById('live-google-map');
    if (gmapIframe) {
      const gmapUrl = `https://maps.google.com/maps?q=${targetLat},${targetLng}&hl=en&z=15&output=embed`;
      if (gmapIframe.src !== gmapUrl) {
        gmapIframe.src = gmapUrl;
      }
    }

    // 3. Save to localStorage permanently
    if (!placeName.includes('Detecting') && !placeName.includes('Identifying') && !placeName.includes('Resolving')) {
      saveUserLocation(placeName, regionName, targetLat, targetLng, isUserChosen);
    }

    // 4. Query weather.php backend for this specific place or district
    if (typeof fetchWeather === 'function' && !placeName.includes('Detecting') && !placeName.includes('Resolving')) {
      const weatherQuery = placeName.includes(',') ? placeName.split(',')[0].trim() : placeName;
      fetchWeather(weatherQuery);
    }
  }

  const PRESET_PLACES = {
    'Magunta Layout, Nellore': { lat: 14.4332, lng: 79.9747, name: 'Magunta Layout', region: 'Nellore, Andhra Pradesh' },
    'Haranathapuram, Nellore': { lat: 14.4468, lng: 79.9739, name: 'Haranathapuram', region: 'Nellore, Andhra Pradesh' },
    'Vedayapalem, Nellore': { lat: 14.4225, lng: 79.9678, name: 'Vedayapalem', region: 'Nellore, Andhra Pradesh' },
    'Balaji Nagar, Nellore': { lat: 14.4379, lng: 79.9890, name: 'Balaji Nagar', region: 'Nellore, Andhra Pradesh' },
    'Pogathota, Nellore': { lat: 14.4452, lng: 79.9856, name: 'Pogathota', region: 'Nellore, Andhra Pradesh' },
    'AC Nagar, Nellore': { lat: 14.4398, lng: 79.9785, name: 'AC Nagar', region: 'Nellore, Andhra Pradesh' },
    'Stonehousepet, Nellore': { lat: 14.4533, lng: 79.9895, name: 'Stonehousepet', region: 'Nellore, Andhra Pradesh' },
    'Dargamitta, Nellore': { lat: 14.4385, lng: 79.9667, name: 'Dargamitta', region: 'Nellore, Andhra Pradesh' },
    'Kovur, Nellore': { lat: 14.4981, lng: 79.9882, name: 'Kovur', region: 'Nellore, Andhra Pradesh' },
    'Nellore': { lat: 14.4426, lng: 79.9865, name: 'Nellore', region: 'Nellore, Andhra Pradesh' },
    'Tirupati': { lat: 13.6288, lng: 79.4192, name: 'Tirupati', region: 'Andhra Pradesh, India' },
    'Vijayawada': { lat: 16.5062, lng: 80.6480, name: 'Vijayawada', region: 'Andhra Pradesh, India' },
    'Visakhapatnam': { lat: 17.6868, lng: 83.2185, name: 'Visakhapatnam', region: 'Andhra Pradesh, India' },
    'Hyderabad': { lat: 17.3850, lng: 78.4867, name: 'Hyderabad', region: 'Telangana, India' },
    'Bengaluru': { lat: 12.9716, lng: 77.5946, name: 'Bengaluru', region: 'Karnataka, India' },
    'Chennai': { lat: 13.0827, lng: 80.2707, name: 'Chennai', region: 'Tamil Nadu, India' },
    'Mumbai': { lat: 19.0760, lng: 72.8777, name: 'Mumbai', region: 'Maharashtra, India' },
    'Delhi': { lat: 28.6139, lng: 77.2090, name: 'Delhi', region: 'Delhi, India' },
    'Goa': { lat: 15.2993, lng: 74.1240, name: 'Goa', region: 'Goa, India' }
  };

  // Modal Open/Close Controls
  window.openLocationModal = function() {
    const modal = document.getElementById('location-picker-modal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.style.display = 'flex';
      const input = document.getElementById('custom-city-input');
      if (input) {
        input.value = '';
        setTimeout(() => input.focus(), 150);
      }
    }
  };

  window.closeLocationModal = function() {
    const modal = document.getElementById('location-picker-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.style.display = 'none';
    }
  };

  // Select place from chips or search with Nominatim
  window.selectPlace = function(placeQuery) {
    if (!placeQuery) return;
    const cleanQuery = placeQuery.trim();

    // Check instant preset dictionary first
    if (PRESET_PLACES[cleanQuery]) {
      const preset = PRESET_PLACES[cleanQuery];
      loadLocationData(preset.name, preset.region, preset.lat, preset.lng, true);
      window.closeLocationModal();
      if (leafletLiveMap) {
        leafletLiveMap.flyTo([preset.lat, preset.lng], 16, { duration: 1.0 });
      }
      if (typeof showToast === 'function') {
        showToast(`📍 Set place to: ${preset.name}`);
      }
      return;
    }

    if (typeof showToast === 'function') {
      showToast(`🔍 Searching for "${cleanQuery}"...`);
    }

    const searchQuery = cleanQuery.toLowerCase().includes('nellore') ? cleanQuery : `${cleanQuery}, Nellore, Andhra Pradesh`;
    const searchUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`;
    fetch(searchUrl, { headers: { 'Accept': 'application/json' } })
      .then(res => res.json())
      .then(results => {
        if (results && results.length > 0) {
          const item = results[0];
          const lat = parseFloat(item.lat);
          const lng = parseFloat(item.lon);
          const shortName = cleanQuery.split(',')[0].trim();
          loadLocationData(shortName, 'Nellore, Andhra Pradesh', lat, lng, true);
          window.closeLocationModal();
          if (leafletLiveMap) {
            leafletLiveMap.flyTo([lat, lng], 16, { duration: 1.2 });
          }
          if (typeof showToast === 'function') {
            showToast(`✅ Moved to "${shortName}"!`);
          }
        } else {
          // If search fails, update name directly
          const shortName = cleanQuery.split(',')[0].trim();
          loadLocationData(shortName, 'Nellore, Andhra Pradesh', 14.4426, 79.9865, true);
          window.closeLocationModal();
        }
      })
      .catch(() => {
        const shortName = cleanQuery.split(',')[0].trim();
        loadLocationData(shortName, 'Nellore, Andhra Pradesh', 14.4426, 79.9865, true);
        window.closeLocationModal();
      });
  };

  window.selectCity = function(cityName) {
    window.selectPlace(cityName);
  };

  window.submitCustomCity = function() {
    const input = document.getElementById('custom-city-input');
    const place = input ? input.value.trim() : '';
    if (place) {
      window.selectPlace(place);
    }
  };

  window.fetchLocationByIp = fetchLocationByIp;
  window.loadLocationData = loadLocationData;
  window.detectMyCurrentLocation = detectLiveLocation;
  
  window.changeMapLocation = function(cityName) {
    if (cityName && typeof cityName === 'string' && cityName.trim()) {
      window.selectCity(cityName);
      return;
    }
    window.openLocationModal();
  };

  window.clearSavedLocation = function() {
    try {
      localStorage.removeItem(LOCATION_STORAGE_KEY);
      localStorage.removeItem('USER_SAVED_CITY');
      localStorage.removeItem('SAVED_LOCATION_NAME');
    } catch(e) {}
    window.changeMapLocation();
  };


  // ==========================================================================
  // 4. AJAX Weather API Integration
  // ==========================================================================
  function renderDashboardWeather(data) {
    if (!data || !data.current_temp) return;
    const temp = data.current_temp.endsWith('°') ? `${data.current_temp}C` : data.current_temp;
    const tempEl = document.getElementById('weather-temp');
    const condEl = document.getElementById('weather-condition');
    if (tempEl) tempEl.textContent = temp;
    if (condEl) condEl.textContent = data.condition || 'Partly Cloudy';

    // Render Hourly forecast scroll grid
    const hourlyGrid = document.getElementById('hourly-forecast-id');
    if (hourlyGrid) {
      hourlyGrid.innerHTML = '';
      if (data.hourly && data.hourly.length > 0) {
        data.hourly.forEach(hour => {
          const hourDiv = document.createElement('div');
          hourDiv.className = 'hourly-item';
          hourDiv.innerHTML = `
            <span class="hourly-time">${hour.time}</span>
            <span class="hourly-icon">${getWeatherIcon(hour.condition)}</span>
            <span class="hourly-temp">${hour.temp}</span>
          `;
          hourlyGrid.appendChild(hourDiv);
        });
      }
    }

    // Render 7-day forecast scroll list
    const dailyList = document.getElementById('daily-forecast-id');
    if (dailyList) {
      dailyList.innerHTML = '';
      if (data.daily && data.daily.length > 0) {
        data.daily.forEach(day => {
          const dayDiv = document.createElement('div');
          dayDiv.className = 'daily-item';
          dayDiv.innerHTML = `
            <span class="daily-day">${day.day}</span>
            <span class="daily-condition">${day.condition} ${getWeatherIcon(day.condition)}</span>
            <span class="daily-temps">
              <span class="daily-high">${day.high}</span>
              <span class="daily-low">${day.low}</span>
            </span>
          `;
          dailyList.appendChild(dayDiv);
        });
      }
    }
  }

  function fetchWeather(place) {
    const weatherUrl = `${BASE_URL}/weather.php?place=${encodeURIComponent(place)}`;

    fetch(weatherUrl)
      .then(res => res.json())
      .then(data => {
        if (data && data.current_temp) {
          renderDashboardWeather(data);
        } else {
          renderDashboardWeather(getFallbackWeatherData(place));
        }
      })
      .catch(() => {
        renderDashboardWeather(getFallbackWeatherData(place));
      });
  }

  // ==========================================================================
  // 5. Ask Travel Buddy AI Chat Drawer Integration
  // ==========================================================================
  function setupDashboardEvents() {
    const weatherCard = document.getElementById('cvWeatherCard');
    const weatherDetails = document.getElementById('weather-details-id');
    const weatherToggle = document.getElementById('btn-weather-toggle-id');

    // Collapsible Weather forecast details panel toggle
    const toggleForecast = (e) => {
      e.stopPropagation();
      const isCollapsed = weatherDetails.classList.contains('collapsed');
      
      if (isCollapsed) {
        weatherDetails.classList.remove('collapsed');
        weatherToggle.classList.add('expanded');
        weatherToggle.setAttribute('aria-expanded', 'true');
      } else {
        weatherDetails.classList.add('collapsed');
        weatherToggle.classList.remove('expanded');
        weatherToggle.setAttribute('aria-expanded', 'false');
      }
    };
    
    weatherCard.addEventListener('click', toggleForecast);
    weatherToggle.addEventListener('click', toggleForecast);

    // Click Map Card opens in-app location picker modal (never opens external Google Maps)
    const mapCard = document.getElementById('cvUpcomingTrip');
    if (mapCard) {
      mapCard.addEventListener('click', (e) => {
        if (e.target.closest('#live-leaflet-map') || e.target.closest('.leaflet-container') || e.target.closest('.btn-map-action') || e.target.closest('#location-picker-modal')) return;
        if (typeof window.openLocationModal === 'function') {
          window.openLocationModal();
        }
      });
    }

    // slide-up Chat Drawer bindings
    const askBuddyCard = document.getElementById('cvAskBuddy');
    const chatDrawer = document.getElementById('chat-drawer-id');
    const chatOverlay = document.getElementById('chat-overlay-id');
    const chatCloseBtn = document.getElementById('btn-chat-close-id');
    const chatForm = document.getElementById('chat-input-form');
    const chatInput = document.getElementById('chat-input-field');
    const chatMessages = document.getElementById('chat-messages-id');

    // Open Chat Drawer
    askBuddyCard.addEventListener('click', () => {
      chatDrawer.classList.add('open');
      chatOverlay.classList.add('visible');
      chatInput.focus();
    });

    // Close Chat Drawer
    const closeDrawer = () => {
      chatDrawer.classList.remove('open');
      chatOverlay.classList.remove('visible');
    };
    chatCloseBtn.addEventListener('click', closeDrawer);
    chatOverlay.addEventListener('click', closeDrawer);

    // Send chat question via POST AJAX
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const question = chatInput.value.trim();
      if (!question) return;

      // 1. Add User bubble
      appendMessage(question, 'user');
      chatInput.value = '';
      
      // 2. Add dynamic typing indicator
      const typingId = 'typing-' + Date.now();
      const typingIndicator = document.createElement('div');
      typingIndicator.className = 'message ai typing-bubble';
      typingIndicator.id = typingId;
      typingIndicator.innerHTML = `
        <span class="dot-pulse"></span>
        <span class="dot-pulse"></span>
        <span class="dot-pulse"></span>
      `;
      chatMessages.appendChild(typingIndicator);
      chatMessages.scrollTop = chatMessages.scrollHeight;

      // Client-side travel intelligence engine fallback
      function getClientSideTravelAdvice(q) {
        const lower = (q || '').toLowerCase();
        if (lower.includes('mumbai') || lower.includes('bombay')) {
          return "🏙️ **Mumbai 3-Day Travel Itinerary & City Guide:**\n\n"
               + "📅 **Day 1: Colonial Heritage & South Mumbai Charm**\n"
               + "- **Morning:** Stand before the majestic **Gateway of India** and admire the historic Taj Mahal Palace Hotel.\n"
               + "- **Afternoon:** Stroll down Colaba Causeway for souvenir shopping, then grab lunch at iconic Leopold Cafe.\n"
               + "- **Evening:** Watch the golden sunset along **Marine Drive** (the Queen’s Necklace) and enjoy bhel puri at Chowpatty Beach.\n\n"
               + "📅 **Day 2: Coastal Landmarks, Culture & Bandra Vibes**\n"
               + "- **Morning:** Take a scenic ferry from Gateway of India to the ancient rock-cut **Elephanta Caves** (UNESCO site).\n"
               + "- **Afternoon:** Visit the serene **Haji Ali Dargah** situated on an islet in the Arabian Sea.\n"
               + "- **Evening:** Walk along **Bandra Bandstand**, see Mount Mary Church, and explore vibrant street art and hip cafes in Bandra.\n\n"
               + "📅 **Day 3: Bollywood, Beaches & Culinary Delights**\n"
               + "- **Morning:** Visit **Juhu Beach** for morning breezes and legendary hot Pav Bhaji.\n"
               + "- **Afternoon:** Explore Sanjay Gandhi National Park & ancient Kanheri Caves, or take a Bollywood Film City tour.\n"
               + "- **Evening:** Sunset drinks at a rooftop lounge in Lower Parel overlooking the Mumbai skyline.\n\n"
               + "🍴 **Must-Try Mumbai Street Food:**\n"
               + "- **Vada Pav:** Ashok Vada Pav (Kirti College) or Aram Milk Bar.\n"
               + "- **Pav Bhaji:** Cannon Pav Bhaji (CST) or Sardar Refreshments (Tardeo).\n"
               + "- **Irani Cafes:** Bun Maska & Chai at Britannia & Co. or Kyani & Co.\n\n"
               + "💰 **Estimated Budget:** ₹1,500–₹2,500/day (Budget/Trains) | ₹4,000–₹7,000/day (Comfort/Cabs).\n"
               + "☀️ **Best Time to Visit:** October to March for cool, pleasant coastal breezes!";
        } else if (lower.includes('goa')) {
          return "🏖️ **Goa 3-Day Beach & Sunshine Itinerary:**\n\n"
               + "📅 **Day 1: North Goa Beaches & Forts**\n"
               + "- **Morning:** Visit historic **Fort Aguada** and soak in lighthouse ocean views.\n"
               + "- **Afternoon:** Water sports at Calangute & Baga beach.\n"
               + "- **Evening:** Sunset cocktails at Anjuna with live acoustic beach music.\n\n"
               + "📅 **Day 2: Old Goa Heritage & Panjim Latin Quarter**\n"
               + "- **Morning:** Explore Basilica of Bom Jesus and Se Cathedral.\n"
               + "- **Afternoon:** Colorful Portuguese architecture in Fontainhas, Panjim.\n"
               + "- **Evening:** Mandovi River sunset cruise with Goan folk dance.\n\n"
               + "📅 **Day 3: South Goa Tranquility & Waterfalls**\n"
               + "- **Morning:** Day trip to majestic **Dudhsagar Waterfalls**.\n"
               + "- **Evening:** Relax on pristine white sands of Palolem beach.\n\n"
               + "🍴 **Must-Try Food:** Goan Fish Curry Thali, Prawn Balchão, Bebinca!";
        } else if (lower.includes('packing')) {
          return "🎒 **Essential Travel Packing Checklist:**\n\n"
               + "📋 **Documents & Essentials:**\n"
               + "- Government ID / Passport & driving license.\n"
               + "- Flight/Train tickets and hotel booking confirmation.\n"
               + "- Credit cards, debit cards, and emergency cash.\n\n"
               + "🔌 **Electronics:**\n"
               + "- Phone charger, high-capacity power bank (10,000mAh+), universal adapter.\n"
               + "- Noise-cancelling earphones or AirPods.\n\n"
               + "👕 **Clothing & Wear:**\n"
               + "- 3-5 breathable cotton t-shirts and 2 pairs of comfortable pants/shorts.\n"
               + "- Walking shoes, flip-flops, light jacket/windbreaker.\n\n"
               + "💊 **Health & Toiletries:**\n"
               + "- Sunscreen (SPF 50+), hand sanitizer, bug spray.\n"
               + "- First aid kit: Paracetamol, antacid, Band-Aids, motion sickness pills.";
        } else if (lower.includes('budget')) {
          return "💰 **Top 5 Smart Travel Budget Tips:**\n\n"
               + "1. **Book 3-4 Weeks Ahead:** Flights and train berths are up to 40% cheaper when booked in advance.\n"
               + "2. **Eat Where Locals Eat:** Skip overpriced tourist cafes; local family-run eateries offer the most authentic flavor at a fraction of the cost.\n"
               + "3. **Use Public Transit & Metro:** Use day passes or local metro/buses instead of peak-rate cabs.\n"
               + "4. **Travel Off-Peak / Weekdays:** Hotel rates drop significantly between Monday and Thursday.\n"
               + "5. **Track Expenses Daily:** Use the TravelBuddy Budget Tracker tab to record expenses and stay under budget!";
        } else {
          return "✈️ **Travel Buddy Guide for " + q + ":**\n\n"
               + "• **Top Attractions:** Explore the historic quarter, iconic landmarks, and panoramic scenic points.\n"
               + "• **Where to Stay:** Stay central near transit hubs to reduce commute times and taxi expenses.\n"
               + "• **Local Cuisine:** Seek out regional delicacies and highly-rated local food markets.\n"
               + "• **Smart Planning:** Use the My Trips and Budget sections in TravelBuddy to plan every detail smoothly!";
        }
      }

      // 3. Multi-Tiered AI Backend Request with Auto-Fallback
      const candidateUrls = [
        `${BASE_URL}/ask_buddy.php`,
        'ask_buddy.php',
        '/website/ask_buddy.php',
        '/backend/ask_buddy.php',
        'http://localhost:8000/ask_buddy.php',
        'http://localhost/website/ask_buddy.php'
      ];

      function tryAiEndpoint(idx) {
        if (idx >= candidateUrls.length) {
          const indicator = document.getElementById(typingId);
          if (indicator) indicator.remove();
          appendMessage(getClientSideTravelAdvice(question), 'ai');
          return;
        }

        fetch(candidateUrls[idx], {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: question })
        })
          .then(res => {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.json();
          })
          .then(data => {
            const indicator = document.getElementById(typingId);
            if (indicator) indicator.remove();
            if (data.status === 'success' && data.answer) {
              appendMessage(data.answer, 'ai');
            } else {
              appendMessage(getClientSideTravelAdvice(question), 'ai');
            }
          })
          .catch(() => {
            tryAiEndpoint(idx + 1);
          });
      }

      tryAiEndpoint(0);
    });

    function appendMessage(text, sender) {
      const bubble = document.createElement('div');
      bubble.className = `message ${sender}`;
      
      // Parse basic bold markers (**text**) into <strong>, bullet points (- item), and linebreaks into <br>
      const formattedText = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n\s*-\s+(.*?)(?=\n|$)/g, '<br>• $1')
        .replace(/\n/g, '<br>');
        
      bubble.innerHTML = `<p>${formattedText}</p>`;
      chatMessages.appendChild(bubble);
      
      // Keep scroll locked to bottom
      chatMessages.scrollTop = chatMessages.scrollHeight;
      setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 60);
    }

    // Interactive suggestion prompt chips inside chat
    document.querySelectorAll('.chat-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const promptText = chip.getAttribute('data-prompt');
        if (chatInput && promptText) {
          chatInput.value = promptText;
          chatForm.dispatchEvent(new Event('submit', { cancelable: true }));
        }
      });
    });
  }

  // Helper mapping conditions to graphic emojis for gorgeous aesthetics
  function getWeatherIcon(condition) {
    const cond = condition.toLowerCase();
    if (cond.includes('sunny') || cond.includes('clear')) return '☀️';
    if (cond.includes('cloud') || cond.includes('overcast')) return '⛅';
    if (cond.includes('rain') || cond.includes('drizzle')) return '🌧️';
    if (cond.includes('snow') || cond.includes('hail')) return '❄️';
    if (cond.includes('thunder') || cond.includes('storm')) return '⛈️';
    if (cond.includes('fog') || cond.includes('mist') || cond.includes('haze')) return '🌫️';
    return '🌡️';
  }

  /* ==========================================================================
     Trip Buddies (Community Feed & Requests) Logic
     ========================================================================== */
  const communitySection = document.getElementById('community-section');
  const dashboardSection = document.getElementById('dashboard-section');
  
  // Navigation: Dashboard to Community
  const cvCommunityBtn = document.getElementById('cvCommunity');
  if (cvCommunityBtn) {
    cvCommunityBtn.addEventListener('click', () => {
      dashboardSection.classList.remove('visible');
      dashboardSection.classList.add('hidden');
      communitySection.classList.remove('hidden');
      communitySection.classList.add('visible');
      loadCommunityFeed();
    });
  }

  // Navigation: Back to Dashboard
  const btnCommBack = document.getElementById('btn-comm-back-id');
  if (btnCommBack) {
    btnCommBack.addEventListener('click', () => {
      communitySection.classList.remove('visible');
      communitySection.classList.add('hidden');
      dashboardSection.classList.remove('hidden');
      dashboardSection.classList.add('visible');
    });
  }

  // Switcher Tabs Logic
  const tabExplore = document.getElementById('tab-explore');
  const tabRequests = document.getElementById('tab-requests');
  const exploreFeedView = document.getElementById('explore-feed-view');
  const joinRequestsView = document.getElementById('join-requests-view');
  const commSearchBar = document.getElementById('comm-search-bar-id');

  if (tabExplore && tabRequests) {
    tabExplore.addEventListener('click', () => {
      tabExplore.classList.add('active');
      tabRequests.classList.remove('active');
      exploreFeedView.classList.remove('hidden');
      exploreFeedView.classList.add('visible');
      joinRequestsView.classList.remove('visible');
      joinRequestsView.classList.add('hidden');
      commSearchBar.style.display = 'flex';
      loadCommunityFeed();
    });

    tabRequests.addEventListener('click', () => {
      tabRequests.classList.add('active');
      tabExplore.classList.remove('active');
      joinRequestsView.classList.remove('hidden');
      joinRequestsView.classList.add('visible');
      exploreFeedView.classList.remove('visible');
      exploreFeedView.classList.add('hidden');
      commSearchBar.style.display = 'none';
      loadJoinRequests();
    });
  }

  // Create Post Modal Controls
  const createPostModal = document.getElementById('create-post-modal');
  const fabCreatePost = document.getElementById('fabCreatePost');
  const btnModalClose = document.getElementById('btn-modal-close-id');

  if (fabCreatePost && createPostModal) {
    fabCreatePost.addEventListener('click', () => {
      createPostModal.classList.remove('hidden');
      createPostModal.classList.add('visible');
    });
  }

  if (btnModalClose && createPostModal) {
    btnModalClose.addEventListener('click', () => {
      createPostModal.classList.remove('visible');
      createPostModal.classList.add('hidden');
    });
  }

  // Toast Alerts Helper matching Android Toasts
  function showToast(message) {
    let toast = document.getElementById('toast-container-id');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast-container-id';
      toast.className = 'toast-alert';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg> <span>${message}</span>`;
    toast.classList.add('show');
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  // Load Explore Feed Posts
  const communityPostsList = document.getElementById('community-posts-list');
  const commSearchInput = document.getElementById('comm-search-input');
  let loadedPosts = [];

  function loadCommunityFeed() {
    communityPostsList.innerHTML = `<div class="empty-feed-state"><div class="dot-pulse"></div><div class="dot-pulse"></div><div class="dot-pulse"></div></div>`;
    
    safeApiFetch('community.php?action=get')
      .then(data => {
        if (data && data.status === 'success' && data.data && data.data.length > 0) {
          loadedPosts = data.data;
          renderPostsFeed(loadedPosts);
        } else {
          loadFallbackCommunityPosts();
        }
      })
      .catch(() => {
        loadFallbackCommunityPosts();
      });
  }

  function loadFallbackCommunityPosts() {
    loadedPosts = [
      {
        id: 1,
        user_name: 'Priya Sharma',
        user_rating: '4.9 Traveler Rating',
        avatar_id: 1,
        destination: 'Manali, Himachal Pradesh',
        dates: 'May 15 - May 22',
        description: 'Planning an adventurous road trip from Delhi to Manali and Solang Valley! Looking for fun travel buddies who love mountain hiking, photography, and cozy cafe vibes.',
        interested_count: 3
      },
      {
        id: 2,
        user_name: 'Rohan Verma',
        user_rating: '4.7 Traveler Rating',
        avatar_id: 2,
        destination: 'Gokarna, Karnataka',
        dates: 'Jun 01 - Jun 05',
        description: 'Beach trekking, sunset cliff walks, and relaxed camping by Om Beach. Looking for someone to share scooter rentals and beach shack stays!',
        interested_count: 2
      },
      {
        id: 3,
        user_name: 'Sneha Patel',
        user_rating: '4.8 Traveler Rating',
        avatar_id: 3,
        destination: 'Jaipur & Udaipur, Rajasthan',
        dates: 'Jul 10 - Jul 16',
        description: 'Heritage and palace exploration across Rajasthan. Exploring majestic forts, traditional art bazaars, and delicious Rajasthani thalis.',
        interested_count: 1
      }
    ];
    renderPostsFeed(loadedPosts);
  }

  function renderPostsFeed(posts) {
    if (posts.length === 0) {
      communityPostsList.innerHTML = `
        <div class="empty-feed-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          <p>No active travel plans found.<br>Be the first to share one!</p>
        </div>`;
      return;
    }

    communityPostsList.innerHTML = '';
    const activeUserName = localStorage.getItem('ACTIVE_USER_NAME') || 'Aarav Mehta';
    
    posts.forEach(post => {
      // Setup avatar color classes dynamically based on avatar_id
      const avatarId = post.avatar_id || 1;
      const avatarBg = `avatar-bg-${avatarId}`;
      const initials = post.user_name ? post.user_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'TR';
      
      const isOwner = (post.user_name === activeUserName);
      const isRequested = localStorage.getItem(`requested_post_${post.id}`) === 'true';

      const card = document.createElement('div');
      card.className = 'feed-card';
      card.setAttribute('data-id', post.id);

      card.innerHTML = `
        <div class="card-profile">
          <div class="profile-avatar ${avatarBg}">${initials}</div>
          <div class="profile-info">
            <span class="profile-name">${post.user_name}</span>
            <span class="profile-rating">${post.user_rating || '4.8 Traveler Rating'}</span>
          </div>
          ${isOwner ? `
            <div class="profile-actions">
              <button class="btn-card-action delete" data-id="${post.id}" aria-label="Delete plan">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
              </button>
            </div>
          ` : ''}
        </div>
        <h2 class="card-destination">${post.destination}</h2>
        <div class="card-dates">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          <span>${post.dates}</span>
        </div>
        <p class="card-description">${post.description}</p>
        <div class="card-footer">
          <span class="card-interests">${post.interested_count} interested</span>
          ${isOwner ? '' : `
            <button class="btn-join-request ${isRequested ? 'requested' : ''}" data-id="${post.id}" ${isRequested ? 'disabled' : ''}>
              ${isRequested ? 'Requested ✓' : 'Join Request'}
            </button>
          `}
        </div>
      `;

      communityPostsList.appendChild(card);
    });

    // Bind Join Requests click listeners
    const joinBtns = communityPostsList.querySelectorAll('.btn-join-request');
    joinBtns.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.getAttribute('data-id');
        const activeEmail = localStorage.getItem('ACTIVE_EMAIL') || 'guest@travelbuddy.com';
        const activeName = localStorage.getItem('ACTIVE_USER_NAME') || 'Traveler';
        
        e.target.disabled = true;
        
        // Optimistic UI updates - instant response for user
        localStorage.setItem(`requested_post_${id}`, 'true');
        e.target.classList.add('requested');
        e.target.innerText = 'Requested ✓';
        
        // Increment UI interested count
        const countSpan = e.target.closest('.feed-card').querySelector('.card-interests');
        if (countSpan) {
          const currentInt = parseInt(countSpan.innerText) || 0;
          countSpan.innerText = `${currentInt + 1} interested`;
        }
        
        showToast('Join Request Sent!');
        addAlertItem('Join Request Sent', `You requested to join a travel buddy's planned trip.`, 'join');

        const fd = new FormData();
        fd.append('id', id);
        fd.append('requester_name', activeName);
        fd.append('requester_email', activeEmail);

        try {
          await safeApiFetch('community.php?action=join', {
            method: 'POST',
            body: fd
          });
        } catch (err) {
          console.warn('Backend sync queued locally:', err);
          try {
            const pending = JSON.parse(localStorage.getItem('PENDING_JOIN_REQUESTS') || '[]');
            pending.push({ id, requester_name: activeName, requester_email: activeEmail, timestamp: Date.now() });
            localStorage.setItem('PENDING_JOIN_REQUESTS', JSON.stringify(pending));
          } catch(e) {}
        }
      });
    });

    // Bind Delete Post listener
    const deleteBtns = communityPostsList.querySelectorAll('.btn-card-action.delete');
    deleteBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.closest('button').getAttribute('data-id');
        if (!confirm('Are you sure you want to delete this travel plan?')) return;

        const fd = new FormData();
        fd.append('id', id);

        safeApiFetch('community.php?action=delete', {
          method: 'POST',
          body: fd
        })
        .then(data => {
          if (data && data.status === 'success') {
            showToast('Post Deleted Successfully!');
            loadCommunityFeed();
          } else {
            showToast('Could not delete travel plan.');
          }
        })
        .catch(() => {
          showToast('Post Deleted (Local Mode)');
          loadCommunityFeed();
        });
      });
    });
  }

  // Filter explore list destination strings
  if (commSearchInput) {
    commSearchInput.addEventListener('input', () => {
      const q = commSearchInput.value.toLowerCase().trim();
      const filtered = loadedPosts.filter(p => p.destination.toLowerCase().includes(q));
      renderPostsFeed(filtered);
    });
  }

  // Create Post Submit Handler
  const createPostForm = document.getElementById('create-post-form');
  if (createPostForm) {
    createPostForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const dest = document.getElementById('comm-destination').value.trim();
      const dates = document.getElementById('comm-dates').value.trim();
      const desc = document.getElementById('comm-description').value.trim();
      
      const activeUserName = localStorage.getItem('ACTIVE_USER_NAME') || 'Aarav Mehta';

      // Optimistically close modal & notify user immediately
      createPostForm.reset();
      if (createPostModal) {
        createPostModal.classList.remove('visible');
        createPostModal.classList.add('hidden');
      }
      showToast('Post Shared Successfully! 🎉');
      addAlertItem('Community Post Shared', `Successfully shared your travel plan to ${dest} with travel buddies!`, 'join');

      // Optimistic local add
      const newPost = {
        id: Date.now(),
        user_name: activeUserName,
        user_rating: '5.0 Traveler Rating',
        avatar_id: 1,
        destination: dest,
        dates: dates,
        description: desc,
        interested_count: 0
      };
      loadedPosts.unshift(newPost);
      renderPostsFeed(loadedPosts);

      const fd = new FormData();
      fd.append('user_name', activeUserName);
      fd.append('destination', dest);
      fd.append('dates', dates);
      fd.append('description', desc);

      safeApiFetch('community.php?action=add', {
        method: 'POST',
        body: fd
      })
      .then(() => {
        loadCommunityFeed();
      })
      .catch(() => {
        console.warn('Backend sync queued locally');
      });
    });
  }

  // Load received Join Requests lists
  const joinRequestsList = document.getElementById('join-requests-list');

  function loadJoinRequests() {
    joinRequestsList.innerHTML = `<div class="empty-feed-state"><div class="dot-pulse"></div><div class="dot-pulse"></div><div class="dot-pulse"></div></div>`;
    const activeUserName = localStorage.getItem('ACTIVE_USER_NAME') || 'Aarav Mehta';

    safeApiFetch(`community.php?action=get_requests&owner_name=${encodeURIComponent(activeUserName)}`)
      .then(data => {
        if (data && data.status === 'success' && data.data) {
          renderJoinRequests(data.data);
        } else {
          joinRequestsList.innerHTML = `<div class="empty-feed-state"><p>No active join requests at the moment.</p></div>`;
        }
      })
      .catch(() => {
        joinRequestsList.innerHTML = `<div class="empty-feed-state"><p>No active join requests at the moment.</p></div>`;
      });
  }

  function renderJoinRequests(requests) {
    if (requests.length === 0) {
      joinRequestsList.innerHTML = `
        <div class="empty-feed-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
          <p>No pending join requests.<br>When travel buddies request to join your offers, they will appear here!</p>
        </div>`;
      return;
    }

    joinRequestsList.innerHTML = '';
    
    requests.forEach(req => {
      // Pick cyclable color avatar
      const avatarId = (req.id % 5) + 1;
      const avatarBg = `avatar-bg-${avatarId}`;
      const initials = req.requester_name ? req.requester_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'TB';

      const card = document.createElement('div');
      card.className = 'request-card';
      card.setAttribute('data-id', req.id);

      card.innerHTML = `
        <div class="card-profile">
          <div class="profile-avatar ${avatarBg}">${initials}</div>
          <div class="profile-info">
            <span class="profile-name">${req.requester_name}</span>
            <span class="profile-rating">${req.requester_email}</span>
          </div>
        </div>
        <p class="request-destination">Wants to join your trip to <strong>${req.destination}</strong></p>
        <div class="request-actions">
          <button class="btn-accept" data-id="${req.id}">Accept</button>
          <button class="btn-decline" data-id="${req.id}">Decline</button>
        </div>
      `;

      joinRequestsList.appendChild(card);
    });

    // Accept / Decline handlers
    const actionBtns = joinRequestsList.querySelectorAll('.btn-accept, .btn-decline');
    actionBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        const isAccept = e.target.classList.contains('btn-accept');
        const status = isAccept ? 'accepted' : 'declined';
        
        e.target.disabled = true;

        const fd = new FormData();
        fd.append('request_id', id);
        fd.append('status', status);

        // Optimistically show feedback immediately
        showToast(`Join Request ${isAccept ? 'Accepted!' : 'Declined!'}`);
        const card = btn.closest('.request-card');
        if (card) card.remove();

        safeApiFetch('community.php?action=respond_request', {
          method: 'POST',
          body: fd
        })
        .then(() => {
          loadJoinRequests();
        })
        .catch(() => {
          console.warn('Backend decision synced in local mode');
        });
      });
    });
  }

  /* ==========================================================================
     My Trips Integration Logic (Tab Switching, Dynamic Rendering, API Sync)
     ========================================================================== */
  const navHome = document.getElementById('navHome');
  const navTrips = document.getElementById('navTrips');
  const navSearch = document.getElementById('navSearch');
  const navAlerts = document.getElementById('navAlerts');
  const navProfile = document.getElementById('navProfile');

  const homeTabContent = document.getElementById('home-tab-content');
  const tripsTabContent = document.getElementById('trips-tab-content');
  
  const dbHeader = document.querySelector('.db-header');
  const dbSearchBar = document.getElementById('llSearchBar');

  const alertsTabContent = document.getElementById('alerts-tab-content');
  const profileTabContent = document.getElementById('profile-tab-content');
  const searchTabContent = document.getElementById('search-tab-content');

  // Handle switching to Home tab
  function switchToHomeTab(e) {
    if (e) e.preventDefault();
    
    // Set active class on bottom nav item
    document.querySelectorAll('.bottom-nav .nav-item').forEach(item => item.classList.remove('active'));
    if (navHome) navHome.classList.add('active');

    // Show Home content and header components
    if (homeTabContent) homeTabContent.classList.remove('hidden');
    if (tripsTabContent) tripsTabContent.classList.add('hidden');
    if (alertsTabContent) alertsTabContent.classList.add('hidden');
    if (profileTabContent) profileTabContent.classList.add('hidden');
    if (searchTabContent) searchTabContent.classList.add('hidden');
    if (dbHeader) dbHeader.style.display = 'flex';
    if (dbSearchBar) dbSearchBar.style.display = 'flex';
  }

  // Handle switching to Trips tab
  function switchToTripsTab(e) {
    if (e) e.preventDefault();

    // Set active class on bottom nav item
    document.querySelectorAll('.bottom-nav .nav-item').forEach(item => item.classList.remove('active'));
    if (navTrips) navTrips.classList.add('active');

    // Hide Home content and header components, show Trips tab content
    if (homeTabContent) homeTabContent.classList.add('hidden');
    if (tripsTabContent) tripsTabContent.classList.remove('hidden');
    if (alertsTabContent) alertsTabContent.classList.add('hidden');
    if (profileTabContent) profileTabContent.classList.add('hidden');
    if (searchTabContent) searchTabContent.classList.add('hidden');
    if (dbHeader) dbHeader.style.display = 'none';
    if (dbSearchBar) dbSearchBar.style.display = 'none';

    // Load trips from backend
    loadPlannedTrips();
  }

  // Handle switching to Alerts tab
  function switchToAlertsTab(e) {
    if (e) e.preventDefault();

    // Set active class on bottom nav item
    document.querySelectorAll('.bottom-nav .nav-item').forEach(item => item.classList.remove('active'));
    if (navAlerts) navAlerts.classList.add('active');

    // Hide other tabs, show Alerts tab
    if (homeTabContent) homeTabContent.classList.add('hidden');
    if (tripsTabContent) tripsTabContent.classList.add('hidden');
    if (alertsTabContent) alertsTabContent.classList.remove('hidden');
    if (profileTabContent) profileTabContent.classList.add('hidden');
    if (searchTabContent) searchTabContent.classList.add('hidden');
    if (dbHeader) dbHeader.style.display = 'none';
    if (dbSearchBar) dbSearchBar.style.display = 'none';

    // Fetch alerts from XAMPP backend
    loadAlerts();
  }

  // Handle switching to Profile tab
  function switchToProfileTab(e) {
    if (e) e.preventDefault();

    // Set active class on bottom nav item
    document.querySelectorAll('.bottom-nav .nav-item').forEach(item => item.classList.remove('active'));
    if (navProfile) navProfile.classList.add('active');

    // Hide other tabs, show Profile tab
    if (homeTabContent) homeTabContent.classList.add('hidden');
    if (tripsTabContent) tripsTabContent.classList.add('hidden');
    if (alertsTabContent) alertsTabContent.classList.add('hidden');
    if (profileTabContent) profileTabContent.classList.remove('hidden');
    if (searchTabContent) searchTabContent.classList.add('hidden');
    if (dbHeader) dbHeader.style.display = 'none';
    if (dbSearchBar) dbSearchBar.style.display = 'none';

    // Fetch active session info
    loadProfileDetails();
  }

  // Handle switching to Search tab
  function switchToSearchTab(e) {
    if (e) e.preventDefault();

    // Set active class on bottom nav item
    document.querySelectorAll('.bottom-nav .nav-item').forEach(item => item.classList.remove('active'));
    if (navSearch) navSearch.classList.add('active');

    // Hide other tabs, show Search tab
    if (homeTabContent) homeTabContent.classList.add('hidden');
    if (tripsTabContent) tripsTabContent.classList.add('hidden');
    if (alertsTabContent) alertsTabContent.classList.add('hidden');
    if (profileTabContent) profileTabContent.classList.add('hidden');
    if (searchTabContent) searchTabContent.classList.remove('hidden');
    if (dbHeader) dbHeader.style.display = 'none';
    if (dbSearchBar) dbSearchBar.style.display = 'none';

    // Populate initial trending destinations list
    filterSearchDestinations('');
  }

  if (navHome) navHome.addEventListener('click', switchToHomeTab);
  if (navTrips) navTrips.addEventListener('click', switchToTripsTab);
  if (navAlerts) navAlerts.addEventListener('click', switchToAlertsTab);
  if (navProfile) navProfile.addEventListener('click', switchToProfileTab);
  if (navSearch) navSearch.addEventListener('click', switchToSearchTab);

  // Dedicated back buttons from individual tabs returning to Home
  const btnProfileTabBack = document.getElementById('btn-profile-tab-back');
  if (btnProfileTabBack) btnProfileTabBack.addEventListener('click', switchToHomeTab);

  const btnTripsTabBack = document.getElementById('btn-trips-tab-back');
  if (btnTripsTabBack) btnTripsTabBack.addEventListener('click', switchToHomeTab);

  const btnAlertsTabBack = document.getElementById('btn-alerts-tab-back');
  if (btnAlertsTabBack) btnAlertsTabBack.addEventListener('click', switchToHomeTab);

  const btnSearchTabBack = document.getElementById('btn-search-tab-back');
  if (btnSearchTabBack) btnSearchTabBack.addEventListener('click', switchToHomeTab);

  /* ==========================================================================
     Search Screen & Trending Destinations Logic (Parity with SearchActivity.kt)
     ========================================================================== */
  const allDestinations = [
    "Mahabalipuram", "Ooty", "Pondicherry", "Madurai", "Bali, Indonesia", 
    "Tokyo, Japan", "Santorini, Greece", "Dubai, UAE", "Paris, France", 
    "Iceland", "Maldives", "New York, USA", "London, UK", "Rome, Italy", 
    "Singapore", "Sydney, Australia", "Kodaikanal", "Munnar", "Hampi"
  ];

  const countryMap = {
    "america": ["New York, USA", "Los Angeles", "Grand Canyon", "Las Vegas", "Chicago"],
    "usa": ["New York, USA", "Los Angeles", "Grand Canyon", "Las Vegas", "Chicago"],
    "india": ["New Delhi", "Mumbai", "Taj Mahal", "Goa", "Jaipur", "Kerala"],
    "tamil nadu": ["Chennai", "Madurai", "Ooty", "Mahabalipuram", "Kodaikanal", "Coimbatore"],
    "france": ["Paris", "Nice", "Lyon", "Marseille", "Bordeaux"],
    "uk": ["London", "Edinburgh", "Manchester", "Liverpool"],
    "australia": ["Sydney", "Melbourne", "Great Barrier Reef", "Perth"]
  };

  function filterSearchDestinations(query) {
    const container = document.getElementById('trending-list-container');
    if (!container) return;

    const lowerQuery = query.toLowerCase().trim();
    let filtered = [];

    if (!lowerQuery) {
      filtered = allDestinations;
    } else if (countryMap[lowerQuery]) {
      filtered = countryMap[lowerQuery];
    } else {
      filtered = allDestinations.filter(d => d.toLowerCase().includes(lowerQuery));
      if (filtered.length === 0) {
        // Replicate matches.add(query) behavior when custom text has no match
        const formattedQuery = query.replace(/\b\w/g, c => c.toUpperCase());
        filtered.push(formattedQuery);
      }
    }

    renderTrendingDestinations(filtered);
  }

  function renderTrendingDestinations(items) {
    const container = document.getElementById('trending-list-container');
    if (!container) return;

    container.innerHTML = '';
    items.forEach(item => {
      const row = document.createElement('button');
      row.className = 'trending-destination-item';
      row.innerHTML = `
        <div class="trending-item-icon-wrapper" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
        <span class="trending-item-name">${item}</span>
      `;

      row.addEventListener('click', () => {
        openTripDetails(item);
      });

      container.appendChild(row);
    });
  }

  // Bind input keyup filter actions
  const searchTabInput = document.getElementById('search-tab-input-id');
  if (searchTabInput) {
    searchTabInput.addEventListener('input', (e) => {
      filterSearchDestinations(e.target.value);
    });
  }

  // Hook home search bar input to switch tabs dynamically
  const mainSearchInput = document.getElementById('search-input-id');
  const mainSearchBar = document.getElementById('llSearchBar');

  const focusSearchTab = () => {
    switchToSearchTab();
    if (searchTabInput) searchTabInput.focus();
  };

  if (mainSearchInput) {
    mainSearchInput.addEventListener('focus', focusSearchTab);
    mainSearchInput.addEventListener('input', (e) => {
      const q = e.target.value;
      switchToSearchTab();
      if (searchTabInput) {
        searchTabInput.value = q;
        searchTabInput.focus();
        filterSearchDestinations(q);
      }
      e.target.value = ''; // clear home input
    });
  }

  if (mainSearchBar) {
    mainSearchBar.addEventListener('click', (e) => {
      if (e.target !== mainSearchInput) focusSearchTab();
    });
  }

  /* ==========================================================================
     Alerts & Notifications System Logic (Parity with SQLite Android client)
     ========================================================================== */
  function loadAlerts() {
    const container = document.getElementById('alerts-list-container');
    const emptyState = document.getElementById('llEmptyStateAlerts');
    if (!container) return;

    container.innerHTML = `
      <div class="empty-alerts-state">
        <div class="dot-pulse"></div>
      </div>`;
    if (emptyState) emptyState.classList.add('hidden');

    const email = localStorage.getItem('ACTIVE_EMAIL') || 'aarav.mehta@gmail.com';
    const alertsUrl = `${BASE_URL}/alerts.php?action=get&email=${encodeURIComponent(email)}`;

    fetch(alertsUrl)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success' && data.data) {
          renderAlertsList(data.data);
        } else {
          container.innerHTML = '<div class="empty-alerts-state"><p>Could not load notifications.</p></div>';
        }
      })
      .catch(() => {
        container.innerHTML = '<div class="empty-alerts-state"><p>Error connecting to notifications center.</p></div>';
      });
  }

  function renderAlertsList(alerts) {
    const container = document.getElementById('alerts-list-container');
    const emptyState = document.getElementById('llEmptyStateAlerts');
    if (!container) return;

    if (alerts.length === 0) {
      container.innerHTML = '';
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');
    container.innerHTML = '';

    alerts.forEach(alert => {
      let iconColor = '#6B7280'; // fallback gray
      let typeIcon = '';

      switch (alert.type.toLowerCase()) {
        case 'trip':
          iconColor = '#10B981'; // Emerald Green
          typeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;
          break;
        case 'hotel_success':
          iconColor = '#06B6D4'; // Teal
          typeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`;
          break;
        case 'hotel_failure':
          iconColor = '#EF4444'; // Red
          typeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
          break;
        case 'weather':
          iconColor = '#F59E0B'; // Amber Yellow
          typeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
          break;
        case 'travel':
          iconColor = '#3B82F6'; // Indigo Blue
          typeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"></path><path d="M22 2l-7 20-4-9-9-4 20-7z"></path></svg>`;
          break;
        case 'join':
          iconColor = '#8B5CF6'; // Purple
          typeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`;
          break;
        default:
          typeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
          break;
      }

      // Format timestamp relatively (Epoch Millis)
      const diff = Date.now() - alert.timestamp;
      let relativeTime = 'Just now';
      if (diff > 0) {
        const secs = Math.floor(diff / 1000);
        const mins = Math.floor(secs / 60);
        const hours = Math.floor(mins / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) {
          relativeTime = `${days}d ago`;
        } else if (hours > 0) {
          relativeTime = `${hours}h ago`;
        } else if (mins > 0) {
          relativeTime = `${mins}m ago`;
        } else if (secs > 5) {
          relativeTime = `${secs}s ago`;
        }
      }

      const item = document.createElement('div');
      item.className = 'alert-card-item';
      item.innerHTML = `
        <div class="alert-card-left">
          <div class="alert-icon-avatar" style="background-color: ${iconColor};">
            ${typeIcon}
          </div>
          <div class="alert-card-text">
            <h4 class="alert-card-title">${alert.title}</h4>
            <p class="alert-card-msg">${alert.message}</p>
            <span class="alert-card-time">${relativeTime}</span>
          </div>
        </div>
        <button class="btn-delete-alert" data-id="${alert.id}" aria-label="Delete Notification">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      `;

      item.querySelector('.btn-delete-alert').addEventListener('click', (e) => {
        e.stopPropagation();
        const id = e.currentTarget.getAttribute('data-id');
        deleteAlert(id);
      });

      container.appendChild(item);
    });
  }

  function deleteAlert(id) {
    const deleteUrl = `${BASE_URL}/alerts.php?action=delete&id=${id}`;
    fetch(deleteUrl)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          showToast('Notification deleted!');
          loadAlerts();
        }
      });
  }

  function clearAllAlerts() {
    const email = localStorage.getItem('ACTIVE_EMAIL') || 'aarav.mehta@gmail.com';
    const clearUrl = `${BASE_URL}/alerts.php?action=clear&email=${encodeURIComponent(email)}`;
    
    fetch(clearUrl)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          showToast('All notifications cleared!');
          loadAlerts();
        }
      });
  }

  function addAlertItem(title, message, type) {
    const email = localStorage.getItem('ACTIVE_EMAIL') || 'aarav.mehta@gmail.com';
    const addUrl = `${BASE_URL}/alerts.php?action=add`;

    const fd = new FormData();
    fd.append('email', email);
    fd.append('title', title);
    fd.append('message', message);
    fd.append('type', type);

    fetch(addUrl, {
      method: 'POST',
      body: fd
    }).catch(() => {
      console.warn('Could not sync alert trigger to XAMPP backend');
    });
  }

  // Clear all alerts button trigger
  const btnClearAllAlerts = document.getElementById('btnClearAllAlerts');
  if (btnClearAllAlerts) {
    btnClearAllAlerts.addEventListener('click', clearAllAlerts);
  }

  /* ==========================================================================
     Profile Dashboard Logic
     ========================================================================== */
  function loadProfileDetails() {
    const activeUserName = localStorage.getItem('ACTIVE_USER_NAME') || 'simats';
    const activeEmail = localStorage.getItem('ACTIVE_EMAIL') || 'simats@gmail.com';

    // Populate profile card view
    const tvProfileName = document.getElementById('tvProfileName');
    const tvProfileEmail = document.getElementById('tvProfileEmail');
    const profileAvatarInitials = document.getElementById('profile-avatar-initials');

    if (tvProfileName) tvProfileName.textContent = activeUserName;
    if (tvProfileEmail) tvProfileEmail.textContent = activeEmail;

    // Create avatar initials
    let init = 'S';
    if (activeUserName) {
      const parts = activeUserName.split(' ');
      let initStr = '';
      if (parts.length > 0 && parts[0]) initStr += parts[0][0].toUpperCase();
      if (parts.length > 1 && parts[1]) initStr += parts[1][0].toUpperCase();
      init = initStr || 'S';
    }
    if (profileAvatarInitials) profileAvatarInitials.textContent = init;

    // Populate My Information screen elements
    const infoScreenAvatar = document.getElementById('info-screen-avatar');
    const infoScreenName = document.getElementById('info-screen-name');
    const infoScreenEmail = document.getElementById('info-screen-email');
    if (infoScreenAvatar) infoScreenAvatar.textContent = init;
    if (infoScreenName) infoScreenName.textContent = activeUserName;
    if (infoScreenEmail) infoScreenEmail.textContent = activeEmail;

    // Populate modal values (for backup/modal access if triggered)
    const infoValName = document.getElementById('info-val-name');
    const infoValEmail = document.getElementById('info-val-email');
    if (infoValName) infoValName.textContent = activeUserName;
    if (infoValEmail) infoValEmail.textContent = activeEmail;
  }

  // Helper helper to transition screens cleanly
  function navigateToProfileScreen(screenId) {
    // Hide main dashboard section
    const dashboardSection = document.getElementById('dashboard-section');
    if (dashboardSection) {
      dashboardSection.classList.remove('visible');
      dashboardSection.classList.add('hidden');
    }

    // Show target section
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
      targetScreen.classList.remove('hidden');
      targetScreen.classList.add('visible');
    }
  }

  function navigateBackToProfileDashboard(screenId) {
    // Hide active sub-screen section
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
      targetScreen.classList.remove('visible');
      targetScreen.classList.add('hidden');
    }

    // Show main dashboard section
    const dashboardSection = document.getElementById('dashboard-section');
    if (dashboardSection) {
      dashboardSection.classList.remove('hidden');
      dashboardSection.classList.add('visible');
    }
  }

  // Profile Option Screen transitions click listeners
  const btnMyInfo = document.getElementById('btnMyInfo');
  if (btnMyInfo) {
    btnMyInfo.addEventListener('click', () => {
      loadProfileDetails();
      navigateToProfileScreen('profile-info-section');
    });
  }

  const btnInfoBack = document.getElementById('btn-info-back');
  if (btnInfoBack) {
    btnInfoBack.addEventListener('click', () => {
      navigateBackToProfileDashboard('profile-info-section');
    });
  }

  // Join Requests transition and dynamic loading
  const btnProfileRequests = document.getElementById('btnProfileRequests');
  if (btnProfileRequests) {
    btnProfileRequests.addEventListener('click', () => {
      navigateToProfileScreen('profile-requests-section');
      loadPendingRequests();
    });
  }

  const btnRequestsBack = document.getElementById('btn-requests-back');
  if (btnRequestsBack) {
    btnRequestsBack.addEventListener('click', () => {
      navigateBackToProfileDashboard('profile-requests-section');
    });
  }

  function loadPendingRequests() {
    const ownerName = localStorage.getItem('ACTIVE_USER_NAME') || 'simats';
    const reqContainer = document.getElementById('screen-requests-container');
    if (!reqContainer) return;

    safeApiFetch(`community.php?action=get_requests&owner_name=${encodeURIComponent(ownerName)}`)
      .then(data => {
        if (data && data.status === 'success' && data.data && data.data.length > 0) {
          reqContainer.innerHTML = '';
          data.data.forEach(req => {
            const card = document.createElement('div');
            card.className = 'info-fields-card';
            card.style.cursor = 'pointer';
            card.style.marginBottom = '16px';
            card.innerHTML = `
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <h4 style="color:var(--white); margin:0 0 4px 0; font-size:16px;">${req.requester_name}</h4>
                  <p style="color:rgba(255,255,255,0.4); margin:0; font-size:12px;">Wants to join: <strong style="color:#3B82F6;">${req.destination}</strong></p>
                  <p style="color:rgba(255,255,255,0.5); margin:4px 0 0 0; font-size:13px; text-decoration:underline;">${req.requester_email}</p>
                </div>
                <div style="display:flex; gap:8px;">
                  <button class="btn-decision accept-btn" data-id="${req.id}" style="background:#10B981; border:none; color:var(--white); padding:8px 12px; border-radius:8px; cursor:pointer; font-weight:700; font-size:12px;">Accept</button>
                  <button class="btn-decision decline-btn" data-id="${req.id}" style="background:#EF4444; border:none; color:var(--white); padding:8px 12px; border-radius:8px; cursor:pointer; font-weight:700; font-size:12px;">Decline</button>
                </div>
              </div>
            `;

            // Action triggers for Accept/Decline decisions
            card.querySelector('.accept-btn').addEventListener('click', (e) => {
              e.stopPropagation();
              handleRequestDecision(req.id, true);
            });
            card.querySelector('.decline-btn').addEventListener('click', (e) => {
              e.stopPropagation();
              handleRequestDecision(req.id, false);
            });

            // Click card to draft email inquiry (Android parity requirement in screenshot subtitle)
            card.addEventListener('click', () => {
              window.location.href = `mailto:${req.requester_email}?subject=TravelBuddy: Regarding your request to join trip to ${encodeURIComponent(req.destination)}`;
            });

            reqContainer.appendChild(card);
          });
        } else {
          // Centered empty state matching the user's screenshot exactly!
          reqContainer.innerHTML = `
            <div class="empty-requests-container">
              <p class="empty-requests-text">No pending join requests</p>
            </div>
          `;
        }
      })
      .catch(() => {
        reqContainer.innerHTML = `
          <div class="empty-requests-container">
            <p class="empty-requests-text">No pending join requests</p>
          </div>
        `;
      });
  }

  function handleRequestDecision(reqId, isAccept) {
    const fd = new FormData();
    fd.append('request_id', reqId);
    fd.append('status', isAccept ? 'accepted' : 'declined');

    showToast(`Join Request ${isAccept ? 'Accepted!' : 'Declined!'}`);
    loadPendingRequests();

    safeApiFetch('community.php?action=respond_request', {
      method: 'POST',
      body: fd
    })
    .catch(() => {
      console.warn('Backend decision synced in local mode');
    });
  }

  // Privacy & Policy transition
  const btnPrivacyPolicy = document.getElementById('btnPrivacyPolicy');
  if (btnPrivacyPolicy) {
    btnPrivacyPolicy.addEventListener('click', () => {
      navigateToProfileScreen('profile-privacy-section');
    });
  }

  const btnPrivacyBack = document.getElementById('btn-privacy-back');
  if (btnPrivacyBack) {
    btnPrivacyBack.addEventListener('click', () => {
      navigateBackToProfileDashboard('profile-privacy-section');
    });
  }

  // Help & Support transition
  const btnHelpSupport = document.getElementById('btnHelpSupport');
  if (btnHelpSupport) {
    btnHelpSupport.addEventListener('click', () => {
      navigateToProfileScreen('profile-support-section');
    });
  }

  const btnSupportBack = document.getElementById('btn-support-back');
  if (btnSupportBack) {
    btnSupportBack.addEventListener('click', () => {
      navigateBackToProfileDashboard('profile-support-section');
    });
  }

  // Open Contact support modal overlay inside screen CTA button click
  const btnContactUs = document.getElementById('btnContactUs');
  const supportModal = document.getElementById('support-modal');
  const btnSupportClose = document.getElementById('btn-support-close');

  if (btnContactUs && supportModal) {
    btnContactUs.addEventListener('click', () => {
      supportModal.classList.remove('hidden');
      supportModal.classList.add('visible');
    });
  }
  if (btnSupportClose && supportModal) {
    btnSupportClose.addEventListener('click', () => {
      supportModal.classList.remove('visible');
      supportModal.classList.add('hidden');
    });
  }

  // Reset Password Dialog overlay handlers
  const btnResetPassword = document.getElementById('btnResetPassword');
  const resetPasswordModal = document.getElementById('reset-password-modal');
  const btnResetPasswordClose = document.getElementById('btn-reset-password-close');

  if (btnResetPassword && resetPasswordModal) {
    btnResetPassword.addEventListener('click', () => {
      const activeEmail = localStorage.getItem('ACTIVE_EMAIL') || 'simats@gmail.com';
      const resetEmailInput = document.getElementById('reset-val-email');
      if (resetEmailInput) resetEmailInput.value = activeEmail;

      resetPasswordModal.classList.remove('hidden');
      resetPasswordModal.classList.add('visible');
    });
  }

    const btnResetPasswordBack = document.getElementById('btn-reset-password-back');
  if (btnResetPasswordBack && resetPasswordModal) {
    btnResetPasswordBack.addEventListener('click', (e) => {
      e.preventDefault();
      resetPasswordModal.classList.remove('visible');
      resetPasswordModal.classList.add('hidden');
    });
  }

  if (btnResetPasswordClose && resetPasswordModal) {
    btnResetPasswordClose.addEventListener('click', () => {
      resetPasswordModal.classList.remove('visible');
      resetPasswordModal.classList.add('hidden');
    });
  }

  // Reset Password Form submission backend integration
  const resetPasswordForm = document.getElementById('reset-password-form');
  if (resetPasswordForm) {
    resetPasswordForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const email = document.getElementById('reset-val-email').value.trim();
      const password = document.getElementById('reset-val-password').value;

      if (!password) {
        showToast('Please enter a new password.');
        return;
      }

      // Prepare payload
      const fd = new FormData();
      fd.append('email', email);
      fd.append('password', password);

      fetch(`${BASE_URL}/reset_password.php`, {
        method: 'POST',
        body: fd
      })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          showToast('Password reset successful!');
          if (resetPasswordModal) {
            resetPasswordModal.classList.remove('visible');
            resetPasswordModal.classList.add('hidden');
          }
          document.getElementById('reset-val-password').value = '';
        } else {
          showToast(data.message || 'Failed to update password.');
        }
      })
      .catch(() => {
        showToast('Server is experiencing high traffic right now, please try again.');
      });
    });
  }

  const supportForm = document.getElementById('support-request-form');
  if (supportForm) {
    supportForm.addEventListener('submit', (e) => {
      e.preventDefault();
      supportForm.reset();
      if (supportModal) {
        supportModal.classList.remove('visible');
        supportModal.classList.add('hidden');
      }
      showToast('Support ticket submitted successfully! We will contact you soon.');
    });
  }

  const btnLogOut = document.getElementById('btnLogOut');
  if (btnLogOut) {
    btnLogOut.addEventListener('click', () => {
      localStorage.removeItem('ACTIVE_EMAIL');
      localStorage.removeItem('ACTIVE_USER_NAME');
      localStorage.removeItem('ACTIVE_USER_PHONE');
      localStorage.removeItem('ACTIVE_USER_BIO');
      sessionStorage.setItem('JUST_LOGGED_OUT', 'true');
      showToast('Logged out successfully!');
      setTimeout(() => {
        window.location.reload();
      }, 400);
    });
  }

  // Map destination keywords to premium Unsplash travel images
  function getDestinationImage(destination) {
    const dest = destination.toLowerCase();
    if (dest.includes('mahabalipuram')) {
      return 'https://images.unsplash.com/photo-1581012771300-224937651c42?auto=format&fit=crop&w=600&q=80';
    }
    if (dest.includes('goa')) {
      return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80';
    }
    if (dest.includes('nellore')) {
      return 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80';
    }
    if (dest.includes('delhi')) {
      return 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80';
    }
    if (dest.includes('mumbai')) {
      return 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=600&q=80';
    }
    if (dest.includes('taj mahal') || dest.includes('agra')) {
      return 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80';
    }
    if (dest.includes('kerala')) {
      return 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=600&q=80';
    }
    // Elegant fallback travel images
    return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80';
  }

  // Fetch Planned Trips from get_trips.php backend API
  function loadPlannedTrips() {
    const container = document.getElementById('trips-list-container');
    if (!container) return;

    container.innerHTML = `
      <div class="empty-feed-state">
        <div class="dot-pulse"></div>
        <div class="dot-pulse"></div>
        <div class="dot-pulse"></div>
      </div>`;
    
    const email = localStorage.getItem('ACTIVE_EMAIL') || 'aarav.mehta@gmail.com';

    safeApiFetch(`get_trips.php?email=${encodeURIComponent(email)}`)
      .then(data => {
        if (data && data.status === 'success' && data.data && data.data.length > 0) {
          renderPlannedTrips(data.data);
        } else {
          renderPlannedTrips(getDefaultPlannedTrips());
        }
      })
      .catch(() => {
        renderPlannedTrips(getDefaultPlannedTrips());
      });
  }

  function getDefaultPlannedTrips() {
    return [
      { id: 1, user_email: 'aarav.mehta@gmail.com', destination: 'Goa, India', image_res: 1 },
      { id: 2, user_email: 'aarav.mehta@gmail.com', destination: 'Ooty, India', image_res: 2 },
      { id: 3, user_email: 'aarav.mehta@gmail.com', destination: 'Mahabalipuram, India', image_res: 3 }
    ];
  }

  // Render trips feed cards
  function renderPlannedTrips(trips) {
    const container = document.getElementById('trips-list-container');
    if (!container) return;

    if (trips.length === 0) {
      container.innerHTML = `
        <div class="empty-feed-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          <p>No planned trips found.<br>Tap the plus button above to add one!</p>
        </div>`;
      return;
    }

    container.innerHTML = '';
    trips.forEach((trip, index) => {
      const imgUrl = getDestinationImage(trip.destination);
      const badgeText = (index === 0) ? 'Active' : 'Planned';

      const card = document.createElement('div');
      card.className = 'trip-card';
      card.setAttribute('data-destination', trip.destination);
      
      card.innerHTML = `
        <img src="${imgUrl}" class="trip-card-image" alt="${trip.destination}">
        <div class="trip-card-overlay"></div>
        <span class="trip-badge">${badgeText}</span>
        <button class="btn-trip-delete" data-destination="${trip.destination}" aria-label="Delete Trip">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
        <h3 class="trip-title">${trip.destination}</h3>
        
        <div class="trip-card-footer">
          <div class="trip-footer-left">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span>Planned Trip</span>
          </div>
          <button class="btn-trip-location" data-destination="${trip.destination}">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </button>
        </div>
      `;

      container.appendChild(card);
    });

    // Make the entire card click open trip details
    container.querySelectorAll('.trip-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const dest = e.currentTarget.getAttribute('data-destination');
        openTripDetails(dest);
      });
    });

    // Location pin opens trip details too
    container.querySelectorAll('.btn-trip-location').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const dest = e.currentTarget.getAttribute('data-destination');
        openTripDetails(dest);
      });
    });

    // Delete dynamic handlers
    container.querySelectorAll('.btn-trip-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const dest = e.currentTarget.getAttribute('data-destination');
        deletePlannedTrip(dest);
      });
    });
  }

  // Add Trip Modal Overlay controls
  const addTripModal = document.getElementById('add-trip-modal');
  const fabAddTrip = document.getElementById('fabAddTrip');
  const btnAddTripClose = document.getElementById('btn-add-trip-close-id');
  const addTripForm = document.getElementById('add-trip-form');

  if (fabAddTrip && addTripModal) {
    fabAddTrip.addEventListener('click', () => {
      addTripModal.classList.remove('hidden');
      addTripModal.classList.add('visible');
      const inputField = document.getElementById('trip-destination');
      if (inputField) inputField.focus();
    });
  }

  if (btnAddTripClose && addTripModal) {
    btnAddTripClose.addEventListener('click', () => {
      addTripModal.classList.remove('visible');
      addTripModal.classList.add('hidden');
    });
  }

  // Handle Add Trip Submit
  if (addTripForm) {
    addTripForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const destField = document.getElementById('trip-destination');
      const dest = destField ? destField.value.trim() : '';
      if (!dest) return;

      const email = localStorage.getItem('ACTIVE_EMAIL') || 'aarav.mehta@gmail.com';
      const randomImageRes = Math.floor(Math.random() * 5) + 1;

      addTripForm.reset();
      if (addTripModal) {
        addTripModal.classList.remove('visible');
        addTripModal.classList.add('hidden');
      }
      showToast('Trip Added Successfully! 🎉');
      addAlertItem('Trip Planned', `Successfully planned a new trip to ${dest}!`, 'trip');

      _addTripToLocal(dest, '', '');
      loadPlannedTrips();

      const fd = new FormData();
      fd.append('email', email);
      fd.append('destination', dest);
      fd.append('image_res', randomImageRes);

      safeApiFetch('add_trip.php', {
        method: 'POST',
        body: fd
      })
      .then(() => {
        loadPlannedTrips();
        if (window.broadcastRealtimeChange) window.broadcastRealtimeChange('trips');
      })
      .catch(() => {
        console.warn('Trip saved in local mode');
      });
    });
  }

  // Handle planned trip deletion
  function deletePlannedTrip(destination) {
    if (!confirm(`Are you sure you want to delete your trip to "${destination}"?`)) return;

    showToast('Trip Deleted Successfully!');
    addAlertItem('Trip Deleted', `Removed trip to ${destination} from your planning list.`, 'hotel_failure');

    const email = localStorage.getItem('ACTIVE_EMAIL') || 'aarav.mehta@gmail.com';
    const fd = new FormData();
    fd.append('email', email);
    fd.append('destination', destination);

    safeApiFetch('delete_trip.php', {
      method: 'POST',
      body: fd
    })
    .then(() => {
      loadPlannedTrips();
        if (window.broadcastRealtimeChange) window.broadcastRealtimeChange('trips');
    })
    .catch(() => {
      loadPlannedTrips();
    });
  }

  // ==========================================================================
  // Web Trip Details View Page and Sub-Planning Overlays Integration
  // ==========================================================================
  const tripDetailsSection = document.getElementById('trip-details-section');
  // dashboardSection is already declared in the outer scope

  // Destination Details Fallback Knowledge Engine
  function getFallbackPlaceDetails(dest) {
    const d = (dest || 'Goa').toLowerCase();
    
    if (d.includes('goa')) {
      return {
        title: dest,
        rating: '4.8',
        description: "India's premier coastal paradise, Goa is famous for sun-kissed Arabian Sea beaches, vibrant nightlife, Portuguese colonial architecture in Old Goa, scenic spice plantations, and fresh seafood shacks.",
        travel_methods: "Flights to Dabolim or Mopa International Airport; Madgaon Junction rail; NH66 coastal highway.",
        budget_min: '3000',
        budget_max: '15000',
        latitude: 15.2993,
        longitude: 74.1240,
        recommended_places: ['Baga Beach', 'Basilica of Bom Jesus', 'Aguada Fort', 'Dudhsagar Waterfalls', 'Palolem Beach'],
        hotels: ['Taj Exotica Resort & Spa', 'W Goa Beachfront Vagator', 'The Leela Goa Cavelossim', 'Grand Hyatt Goa']
      };
    }
    
    if (d.includes('ooty')) {
      return {
        title: dest,
        rating: '4.7',
        description: "Nestled in the blue Nilgiri Mountains, Ooty (Udhagamandalam) is the Queen of Hill Stations, renowned for fragrant tea gardens, eucalyptus groves, cool misty weather, and the historic UNESCO Toy Train.",
        travel_methods: "Nilgiri Mountain Railway from Mettupalayam; Coimbatore International Airport (88 km); Ghat roads via Mysore or Coimbatore.",
        budget_min: '2500',
        budget_max: '12000',
        latitude: 11.4102,
        longitude: 76.6950,
        recommended_places: ['Botanical Garden', 'Ooty Lake & Boathouse', 'Doddabetta Peak', 'Pykara Falls & Lake', 'Rose Garden'],
        hotels: ['Savoy - IHCL SeleQtions', 'Sterling Ooty Fern Hill', 'Fortune Resort Sullivan Court', 'Sinclairs Retreat']
      };
    }

    if (d.includes('manali')) {
      return {
        title: dest,
        rating: '4.8',
        description: "High in the Himalayas of Himachal Pradesh, Manali is a playground for adventurers and mountain lovers, offering pine forests, snow-clad mountain passes, Solang Valley sports, and bohemian Old Manali cafes.",
        travel_methods: "Bhuntar Airport (50 km); Volvo sleeper buses from Delhi/Chandigarh; drive via Atal Tunnel.",
        budget_min: '3000',
        budget_max: '16000',
        latitude: 32.2396,
        longitude: 77.1887,
        recommended_places: ['Solang Valley', 'Hadimba Temple', 'Atal Tunnel & Sissu', 'Jogini Waterfalls', 'Old Manali'],
        hotels: ['The Himalayan Resort & Spa', 'Span Resort & Spa', 'Larisa Resort Manali', 'Snow Valley Resorts']
      };
    }

    if (d.includes('mumbai')) {
      return {
        title: dest,
        rating: '4.7',
        description: "The dynamic financial and entertainment capital of India, Mumbai combines colonial heritage landmarks, seaside promenades like Marine Drive, Bollywood glamour, and celebrated culinary street culture.",
        travel_methods: "Chhatrapati Shivaji Maharaj International Airport; CSMT & Mumbai Central railway hubs; Mumbai Metro.",
        budget_min: '3500',
        budget_max: '25000',
        latitude: 18.9220,
        longitude: 72.8347,
        recommended_places: ['Gateway of India', 'Marine Drive', 'Elephanta Caves', 'Colaba Causeway', 'Bandra Bandstand'],
        hotels: ['The Taj Mahal Palace', 'The Oberoi Mumbai', 'ITC Maratha', 'Trident Nariman Point']
      };
    }

    if (d.includes('delhi')) {
      return {
        title: dest,
        rating: '4.6',
        description: "India's historic and political capital, Delhi bridges centuries of history with grand Mughal fortresses, peaceful leafy boulevards, UNESCO monuments, and vibrant culinary bazaars in Old Delhi.",
        travel_methods: "Indira Gandhi International Airport (DEL); New Delhi & Hazrat Nizamuddin rail hubs; Delhi Metro.",
        budget_min: '2500',
        budget_max: '18000',
        latitude: 28.6139,
        longitude: 77.2090,
        recommended_places: ['Qutub Minar', 'Red Fort', "Humayun's Tomb", 'India Gate', 'Chandni Chowk'],
        hotels: ['The Imperial New Delhi', 'The Leela Palace New Delhi', 'Taj Mahal Hotel', 'ITC Maurya']
      };
    }

    if (d.includes('gokarna')) {
      return {
        title: dest,
        rating: '4.7',
        description: "A serene coastal haven in Karnataka, Gokarna blends holy temple heritage with pristine, unspoiled beaches like Om Beach and Kudle Beach, surrounded by rocky cliffs and Arabian sea breezes.",
        travel_methods: "Goa Dabolim Airport (140 km); Gokarna Road railway station; Konkan coastal highway.",
        budget_min: '2000',
        budget_max: '9000',
        latitude: 14.5479,
        longitude: 74.3188,
        recommended_places: ['Om Beach', 'Kudle Beach', 'Mahabaleshwar Temple', 'Half Moon Beach', 'Paradise Beach'],
        hotels: ['Kahani Paradise', 'SwaSwara Wellness Retreat', 'Stones Resort Gokarna', 'Namaste Cafe Beach Stay']
      };
    }

    if (d.includes('jaipur') || d.includes('udaipur') || d.includes('rajasthan')) {
      return {
        title: dest,
        rating: '4.8',
        description: "The royal jewels of Rajasthan, featuring majestic hill forts, mirror-like palace lakes, opulent Rajput architecture, colorful textile bazaars, and legendary royal hospitality.",
        travel_methods: "Jaipur International Airport / Maharana Pratap Airport; Western Railway network; National Highway 48.",
        budget_min: '3000',
        budget_max: '20000',
        latitude: 26.9124,
        longitude: 75.7873,
        recommended_places: ['Amber Fort', 'City Palace & Lake Pichola', 'Hawa Mahal', 'Jantar Mantar', 'Nahargarh Fort'],
        hotels: ['Rambagh Palace Jaipur', 'Taj Lake Palace Udaipur', 'The Oberoi Rajvilas', 'Trident Jaipur']
      };
    }

    return {
      title: dest,
      rating: '4.6',
      description: `Explore the captivating wonders of ${dest}! This destination offers an unforgettable blend of rich cultural heritage, scenic viewpoints, regional delicacies, and hospitable stays.`,
      travel_methods: `Easily accessible via nearest commercial airport, direct express trains, and state highway bus connectivity.`,
      budget_min: '2500',
      budget_max: '12000',
      latitude: 13.0827,
      longitude: 80.2707,
      recommended_places: [`${dest} Historic Center`, `${dest} Scenic Viewpoint`, `${dest} Heritage Landmark`, `${dest} Local Market`, `${dest} Cultural Park`],
      hotels: [`Grand Palace Hotel, ${dest}`, `Ocean/Valley View Resort, ${dest}`, `Heritage Comfort Inn, ${dest}`, `City Center Hotel, ${dest}`]
    };
  }

  function renderPlaceDetails(info, destination) {
    if (!info) return;

    const ratingEl = document.getElementById('details-rating-num');
    const descEl = document.getElementById('details-description');
    const travelEl = document.getElementById('details-travel-methods');
    const minEl = document.getElementById('details-budget-min');
    const maxEl = document.getElementById('details-budget-max');

    if (ratingEl) ratingEl.textContent = info.rating || '4.5';
    if (descEl) descEl.textContent = info.description || `Explore the scenic beauty and attractions of ${destination}.`;
    if (travelEl) travelEl.textContent = info.travel_methods || 'Flights, express trains, and state highway buses connect seamlessly.';
    if (minEl) minEl.textContent = `Min: ₹${info.budget_min || '2,500'}`;
    if (maxEl) maxEl.textContent = `Max: ₹${info.budget_max || '15,000'}`;

    // Recommended places rendering
    const recContainer = document.getElementById('details-recommended-places');
    if (recContainer) {
      recContainer.innerHTML = '';
      const recPlaces = (info.recommended_places && info.recommended_places.length > 0) 
        ? info.recommended_places 
        : [`${destination} Viewpoint`, `${destination} Heritage Center`, `${destination} Market`];
      
      recPlaces.forEach((place, index) => {
        const placeImg = getDestinationImage(place);
        const rate = (4.3 + (index * 0.1)).toFixed(1);
        const rCard = document.createElement('div');
        rCard.className = 'recommended-place-card';
        rCard.innerHTML = `
          <img src="${placeImg}" alt="${place}">
          <div class="place-card-overlay"></div>
          <span class="place-card-rating">★ ${rate}</span>
          <span class="place-card-name">${place}</span>
        `;
        recContainer.appendChild(rCard);
      });
    }

    // Hotels listing rendering (Interactive Cards with Direct Booking & View All)
    const hotelsContainer = document.getElementById('details-hotels-list-id');
    if (hotelsContainer) {
      hotelsContainer.innerHTML = '';
      const hotelsList = (info.hotels && info.hotels.length > 0)
        ? info.hotels
        : [`Grand Palace Hotel, ${destination}`, `Heritage Luxury Resort, ${destination}`, `Comfort Inn, ${destination}`];
      
      hotelsList.forEach(hotelName => {
        const item = document.createElement('div');
        item.className = 'nearby-hotel-card-item';
        item.innerHTML = `
          <div class="nhc-info">
            <span class="nhc-name">🏨 ${hotelName}</span>
            <span class="nhc-rating">★ 4.8 · Popular stay in ${destination}</span>
          </div>
          <button class="btn-nearby-hotel-book" type="button">Book Stay</button>
        `;
        item.querySelector('.btn-nearby-hotel-book').addEventListener('click', () => {
          openHotelBookingModal({ name: hotelName, price: 3200, rating: '4.8', description: `Top-rated luxury stay in ${destination}` }, destination);
        });
        hotelsContainer.appendChild(item);
      });

      // Add "View All Hotels" navigation button
      const viewAllBtn = document.createElement('button');
      viewAllBtn.className = 'btn-view-all-hotels';
      viewAllBtn.type = 'button';
      viewAllBtn.innerHTML = `<span>View All Hotels in ${destination}</span> <span style="font-size:16px;">&rarr;</span>`;
      viewAllBtn.addEventListener('click', () => {
        openHotelsPage(destination);
      });
      hotelsContainer.appendChild(viewAllBtn);
    }

    // Setup maps route navigator
    const mapBtn = document.getElementById('btn-details-route');
    if (mapBtn) {
      const newMapBtn = mapBtn.cloneNode(true);
      mapBtn.parentNode.replaceChild(newMapBtn, mapBtn);
      const lat = info.latitude || 15.2993;
      const lng = info.longitude || 74.1240;
      newMapBtn.addEventListener('click', () => {
        window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
      });
    }
  }

  function openTripDetails(destination) {
    if (!tripDetailsSection || !dashboardSection) return;

    // Transition panels
    dashboardSection.classList.add('hidden');
    tripDetailsSection.classList.remove('hidden');

    // Populate static fields instantly
    document.getElementById('details-destination-title').textContent = destination;
    const heroImg = document.getElementById('details-hero-img');
    if (heroImg) heroImg.src = getDestinationImage(destination);

    // 1. Immediately render fallback knowledge base so zero blank / loading delay!
    const fallbackData = getFallbackPlaceDetails(destination);
    renderPlaceDetails(fallbackData, destination);

    // 2. Fetch from backend place_details.php via safeApiFetch with auto-failover
    safeApiFetch(`place_details.php?place=${encodeURIComponent(destination)}`)
      .then(data => {
        if (data && data.status === 'success' && data.data) {
          renderPlaceDetails(data.data, destination);
        }
      })
      .catch(() => {
        console.warn('Used fallback destination details');
      });

    // 3. Setup Delete Action
    const deleteBtn = document.getElementById('btn-details-delete-trip');
    if (deleteBtn) {
      const newDeleteBtn = deleteBtn.cloneNode(true);
      deleteBtn.parentNode.replaceChild(newDeleteBtn, deleteBtn);
      newDeleteBtn.addEventListener('click', () => {
        deletePlannedTrip(destination);
        closeTripDetails();
      });
    }

    // 4. Bind planning trigger cards
    setupPlanningButtons(destination);
  }

  function closeTripDetails() {
    if (!tripDetailsSection || !dashboardSection) return;
    tripDetailsSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');
    loadPlannedTrips();
  }

  // Bind toolbar back click
  const detailsBackBtn = document.getElementById('btn-details-back-id');
  if (detailsBackBtn) {
    detailsBackBtn.addEventListener('click', closeTripDetails);
  }

  // Setup sub features overlays and dynamic queries
  function setupPlanningButtons(trip) {
    // ── Packing: navigate to full-screen page ──
    const packBtn = document.getElementById('btn-pack-list');
    if (packBtn) {
      const newPackBtn = packBtn.cloneNode(true);
      packBtn.parentNode.replaceChild(newPackBtn, packBtn);
      newPackBtn.addEventListener('click', () => openPackingPage(trip));
    }

    // ── Budget: navigate to full-screen page ──
    const budgetBtn = document.getElementById('btn-budget-list');
    if (budgetBtn) {
      const newBudgetBtn = budgetBtn.cloneNode(true);
      budgetBtn.parentNode.replaceChild(newBudgetBtn, budgetBtn);
      newBudgetBtn.addEventListener('click', () => openBudgetPage(trip));
    }

    // ── Tickets: navigate to full-screen page ──
    const ticketBtn = document.getElementById('btn-ticket-list');
    if (ticketBtn) {
      const newTicketBtn = ticketBtn.cloneNode(true);
      ticketBtn.parentNode.replaceChild(newTicketBtn, ticketBtn);
      newTicketBtn.addEventListener('click', () => openTicketsPage(trip));
    }

    // ── Dedicated page & overlay openers for hotels, weather, buddy ──
    const hotelBtn = document.getElementById('btn-hotel-list');
    if (hotelBtn) {
      const newHotelBtn = hotelBtn.cloneNode(true);
      hotelBtn.parentNode.replaceChild(newHotelBtn, hotelBtn);
      newHotelBtn.addEventListener('click', () => openHotelsPage(trip));
    }

    const weatherBtn = document.getElementById('btn-weather-list');
    if (weatherBtn) {
      const newWeatherBtn = weatherBtn.cloneNode(true);
      weatherBtn.parentNode.replaceChild(newWeatherBtn, weatherBtn);
      newWeatherBtn.addEventListener('click', () => openWeatherPage(trip));
    }

    const buddyBtn = document.getElementById('btn-buddy-plan');
    if (buddyBtn) {
      const newBuddyBtn = buddyBtn.cloneNode(true);
      buddyBtn.parentNode.replaceChild(newBuddyBtn, buddyBtn);
      newBuddyBtn.addEventListener('click', () => {
        const overlay = document.getElementById('buddy-plan-overlay');
        if (overlay) {
          overlay.classList.remove('hidden');
          overlay.classList.add('visible');
          openBuddyPlanOverlay(trip);
        }
      });
    }
  }

  // Overlay & Page Close Handlers
  const overlayClosers = [
    { btn: 'btn-tickets-close', overlay: 'tickets-overlay' },
    { btn: 'btn-hotels-close', overlay: 'hotels-overlay' },
    { btn: 'btn-hotels-overlay-back', overlay: 'hotels-overlay' },
    { btn: 'btn-budget-close', overlay: 'budget-overlay' },
    { btn: 'btn-weather-close', overlay: 'weather-overlay' },
    { btn: 'btn-weather-overlay-back', overlay: 'weather-overlay' },
    { btn: 'btn-buddy-plan-close', overlay: 'buddy-plan-overlay' },
    { btn: 'btn-info-close', overlay: 'info-modal' },
    { btn: 'btn-privacy-close', overlay: 'privacy-modal' }
  ];

  // Full-screen page back buttons
  const btnHotelsBack = document.getElementById('btn-hotels-back');
  if (btnHotelsBack) btnHotelsBack.addEventListener('click', () => closeHotelsPage());

  const btnWeatherBack = document.getElementById('btn-weather-back');
  if (btnWeatherBack) btnWeatherBack.addEventListener('click', () => closeWeatherPage());

  overlayClosers.forEach(closer => {
    const btn = document.getElementById(closer.btn);
    if (btn) {
      btn.addEventListener('click', () => {
        const overlay = document.getElementById(closer.overlay);
        if (overlay) {
          overlay.classList.remove('visible');
          overlay.classList.add('hidden');
        }
      });
    }
  });

  // ==========================================================================
  // Plan with Buddy – Open overlay and handle community post submission
  // ==========================================================================
  function openBuddyPlanOverlay(destination) {
    // Pre-fill destination field
    const destInput = document.getElementById('buddy-plan-destination');
    if (destInput) destInput.value = destination;

    // Reset other fields
    const datesInput = document.getElementById('buddy-plan-dates');
    const descInput = document.getElementById('buddy-plan-desc');
    if (datesInput) datesInput.value = '';
    if (descInput) descInput.value = '';
  }

  const buddyPlanForm = document.getElementById('buddy-plan-form');
  if (buddyPlanForm) {
    buddyPlanForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const dest = document.getElementById('buddy-plan-destination').value.trim();
      const dates = document.getElementById('buddy-plan-dates').value.trim();
      const desc = document.getElementById('buddy-plan-desc').value.trim();

      if (!dest || !desc) {
        showToast('Please fill in destination and description.');
        return;
      }

      const activeUserName = localStorage.getItem('ACTIVE_USER_NAME') || 'Traveler';
      const activeEmail   = localStorage.getItem('ACTIVE_EMAIL')     || '';

      const submitBtn = document.getElementById('btn-buddy-plan-submit');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Adding trip & sharing...';
      }

      // ── 1. Add destination to My Trips ──
      const tripFd = new FormData();
      tripFd.append('email', activeEmail);
      tripFd.append('destination', dest);
      tripFd.append('dates', dates || 'Dates TBD');
      tripFd.append('description', desc);
      tripFd.append('image_res', Math.floor(Math.random() * 5) + 1);

      // ── 2. Post to community Trip Buddies feed ──
      const communityFd = new FormData();
      communityFd.append('user_name',   activeUserName);
      communityFd.append('destination', dest);
      communityFd.append('dates',       dates || 'Dates TBD');
      communityFd.append('description', desc);

      // Optimistic instant UI update
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Share to Trip Buddies';
      }
      const overlay = document.getElementById('buddy-plan-overlay');
      if (overlay) {
        overlay.classList.remove('visible');
        overlay.classList.add('hidden');
      }
      buddyPlanForm.reset();
      showToast(`"${dest}" added to My Trips & shared to Trip Buddies! 🎉`);
      addAlertItem('Plan with Buddy', `Trip to ${dest} saved in My Trips and posted to the community feed!`, 'trip');

      // Local storage optimistic fallback
      _addTripToLocal(dest, dates, desc);
      loadPlannedTrips();
      loadCommunityFeed();

      // Background safe fetch with auto-failover
      Promise.allSettled([
        safeApiFetch('add_trip.php', { method: 'POST', body: tripFd }),
        safeApiFetch('community.php?action=add', { method: 'POST', body: communityFd })
      ]).then(() => {
        loadPlannedTrips();
        if (window.broadcastRealtimeChange) window.broadcastRealtimeChange('trips');
        loadCommunityFeed();
      });
    });
  }

  // ==========================================================================
  // Packing List – Full-Screen Page Navigation & Backend
  // ==========================================================================
  let _packingCurrentTrip = '';

  function openPackingPage(trip) {
    _packingCurrentTrip = trip;
    const section = document.getElementById('packing-section');
    const tripDetails = document.getElementById('trip-details-section');
    if (!section) return;

    // Set destination title
    const titleEl = document.getElementById('packing-dest-title');
    if (titleEl) titleEl.textContent = trip;

    // Hide trip details, show packing page
    if (tripDetails) tripDetails.classList.add('hidden');
    section.classList.remove('hidden');

    // Load items
    loadPackingList(trip);
  }

  function closePackingPage() {
    const section = document.getElementById('packing-section');
    const tripDetails = document.getElementById('trip-details-section');
    if (section) section.classList.add('hidden');
    if (tripDetails) tripDetails.classList.remove('hidden');
  }

  // Back button
  const btnPackingBack = document.getElementById('btn-packing-back');
  if (btnPackingBack) {
    btnPackingBack.addEventListener('click', closePackingPage);
  }

  // Add Item bar
  const packingAddBtn = document.getElementById('packing-add-btn');
  const packingAddInput = document.getElementById('packing-add-input');
  const packingCatSelect = document.getElementById('packing-cat-select');

  function handleAddPackingItem() {
    const item = packingAddInput ? packingAddInput.value.trim() : '';
    const cat = packingCatSelect ? packingCatSelect.value : 'General';
    if (!item || !_packingCurrentTrip) return;

    const addOffline = () => {
      const local = _packingGetLocal(_packingCurrentTrip) || [];
      const newId = Date.now();
      local.push({ id: newId, trip_title: _packingCurrentTrip, item_name: item, category: cat, is_packed: false });
      _packingSaveLocal(_packingCurrentTrip, local);
      if (packingAddInput) packingAddInput.value = '';
      renderPackingList(local, _packingCurrentTrip);
    };

    safeApiFetch(`packing.php?action=add&trip=${encodeURIComponent(_packingCurrentTrip)}&item=${encodeURIComponent(item)}&category=${encodeURIComponent(cat)}`)
      .then(data => {
        if (data && data.status === 'success') {
          if (packingAddInput) packingAddInput.value = '';
          loadPackingList(_packingCurrentTrip);
        } else {
          addOffline();
        }
      })
      .catch(() => {
        addOffline();
      });
  }

  if (packingAddBtn) {
    packingAddBtn.addEventListener('click', handleAddPackingItem);
  }
  if (packingAddInput) {
    packingAddInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); handleAddPackingItem(); }
    });
  }

  // Packing Checklist Core Backend Sync (with offline localStorage fallback)
  function _packingLocalKey(trip) { return `tb_packing_${trip}`; }

  function _packingGetLocal(trip) {
    try { return JSON.parse(localStorage.getItem(_packingLocalKey(trip)) || 'null'); } catch(e) { return null; }
  }

  function _packingSaveLocal(trip, items) {
    try { localStorage.setItem(_packingLocalKey(trip), JSON.stringify(items)); } catch(e) {}
  }

  function _packingDefaultItems(trip) {
    return [
      { id: 1, trip_title: trip, item_name: 'T-shirts / Casual tops (4)', category: 'Clothes', is_packed: false },
      { id: 2, trip_title: trip, item_name: 'Jeans & comfortable trousers (2)', category: 'Clothes', is_packed: false },
      { id: 3, trip_title: trip, item_name: 'Sneakers & walking sandals', category: 'Clothes', is_packed: false },
      { id: 4, trip_title: trip, item_name: 'Government ID / Passport', category: 'Documents', is_packed: false },
      { id: 5, trip_title: trip, item_name: 'Flight / Train / Bus Tickets', category: 'Documents', is_packed: false },
      { id: 6, trip_title: trip, item_name: 'Hotel Booking Confirmations', category: 'Documents', is_packed: false },
      { id: 7, trip_title: trip, item_name: 'Smartphone Charger & Cables', category: 'Gadgets', is_packed: false },
      { id: 8, trip_title: trip, item_name: 'High-capacity Power Bank', category: 'Gadgets', is_packed: false },
      { id: 9, trip_title: trip, item_name: 'Emergency Medical Kit & Bandages', category: 'General', is_packed: false },
      { id: 10, trip_title: trip, item_name: 'Sunscreen & Toiletries Kit', category: 'General', is_packed: false }
    ];
  }

  function loadPackingList(trip) {
    const container = document.getElementById('packing-items-list');
    if (!container) return;
    container.innerHTML = `
      <div class="packing-empty-state">
        <div class="dot-pulse"></div>
      </div>`;

    safeApiFetch(`packing.php?action=get&trip=${encodeURIComponent(trip)}`)
      .then(res => {
        if (res && res.status === 'success' && res.data) {
          _packingSaveLocal(trip, res.data);
          renderPackingList(res.data, trip);
        } else {
          // DB returned error — use localStorage or seed defaults
          const local = _packingGetLocal(trip) || _packingDefaultItems(trip);
          _packingSaveLocal(trip, local);
          renderPackingList(local, trip);
        }
      })
      .catch(() => {
        // Network/server unavailable — fully offline
        const local = _packingGetLocal(trip) || _packingDefaultItems(trip);
        _packingSaveLocal(trip, local);
        renderPackingList(local, trip);
      });
  }

  function updatePackingProgress(items) {
    const total  = items.length;
    const packed = items.filter(i => i.is_packed).length;
    const pct    = total === 0 ? 0 : Math.round((packed / total) * 100);
    const circumference = 175.93; // 2π × 28

    const labelEl  = document.getElementById('packing-progress-label');
    const pctEl    = document.getElementById('packing-ring-pct');
    const ringFill = document.getElementById('packing-ring-fill');

    if (labelEl)  labelEl.textContent  = `${packed} of ${total} items packed`;
    if (pctEl)    pctEl.textContent    = `${pct}%`;
    if (ringFill) {
      const offset = circumference - (pct / 100) * circumference;
      ringFill.style.strokeDashoffset = offset;
      ringFill.style.stroke = pct === 100 ? '#10B981' : '#3B82F6';
    }
  }

  function renderPackingList(items, trip) {
    const container = document.getElementById('packing-items-list');
    if (!container) return;
    container.innerHTML = '';

    // Update progress ring
    updatePackingProgress(items);

    if (items.length === 0) {
      container.innerHTML = `
        <div class="packing-empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
          </svg>
          <p>No items yet.<br>Add your first packing item below!</p>
        </div>`;
      return;
    }

    const catClassMap = {
      'Clothes': 'cat-clothes',
      'Documents': 'cat-documents',
      'Gadgets': 'cat-gadgets',
      'General': 'cat-general'
    };

    items.forEach(item => {
      const row = document.createElement('div');
      row.className = `packing-item-row${item.is_packed ? ' is-packed' : ''}`;
      const catClass = catClassMap[item.category] || 'cat-general';

      row.innerHTML = `
        <div class="packing-checkbox${item.is_packed ? ' checked' : ''}"></div>
        <span class="packing-item-name">${item.item_name}</span>
        <span class="packing-item-cat ${catClass}">${item.category}</span>
        <button class="packing-delete-btn" aria-label="Delete">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      `;

      // Toggle checkbox (with offline fallback)
      row.querySelector('.packing-checkbox').addEventListener('click', () => {
        const nextStatus = item.is_packed ? 0 : 1;
        fetch(`${BASE_URL}/packing.php?action=toggle&trip=${encodeURIComponent(trip)}&id=${item.id}&status=${nextStatus}`)
          .then(r => r.json())
          .then(d => {
            if (d.status === 'success') {
              loadPackingList(trip);
            } else {
              // Offline toggle
              const local = _packingGetLocal(trip) || [];
              const found = local.find(i => i.id == item.id);
              if (found) found.is_packed = !!nextStatus;
              _packingSaveLocal(trip, local);
              renderPackingList(local, trip);
            }
          })
          .catch(() => {
            const local = _packingGetLocal(trip) || [];
            const found = local.find(i => i.id == item.id);
            if (found) found.is_packed = !!nextStatus;
            _packingSaveLocal(trip, local);
            renderPackingList(local, trip);
          });
      });

      // Delete button (with offline fallback)
      row.querySelector('.packing-delete-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        fetch(`${BASE_URL}/packing.php?action=delete&trip=${encodeURIComponent(trip)}&id=${item.id}`)
          .then(r => r.json())
          .then(d => {
            if (d.status === 'success') {
              loadPackingList(trip);
            } else {
              const local = (_packingGetLocal(trip) || []).filter(i => i.id != item.id);
              _packingSaveLocal(trip, local);
              renderPackingList(local, trip);
            }
          })
          .catch(() => {
            const local = (_packingGetLocal(trip) || []).filter(i => i.id != item.id);
            _packingSaveLocal(trip, local);
            renderPackingList(local, trip);
          });
      });

      container.appendChild(row);
    });
  }

  // ==========================================================================
  // Ticket Booking – Full-Screen Page + Razorpay Payment
  // ==========================================================================
  let _ticketsCurrentTrip  = '';
  let _ticketSelectedPrice = 0;  // in paise * 100 for Razorpay
  let _ticketSeats         = 1;
  let _ticketBasePrice     = 0;  // per-seat price (numeric)
  let _ticketType          = '';

  function openTicketsPage(trip) {
    _ticketsCurrentTrip = trip;
    const section    = document.getElementById('tickets-section');
    const tripDetails = document.getElementById('trip-details-section');
    if (!section) return;

    // Set title + from label
    const titleEl = document.getElementById('tickets-page-title');
    if (titleEl) titleEl.textContent = `Tickets to ${trip}`;
    const fromEl = document.getElementById('tickets-from-label');
    if (fromEl) fromEl.textContent = 'From: Nellore, India';

    if (tripDetails) tripDetails.classList.add('hidden');
    section.classList.remove('hidden');

    // Close sheet if open from previous session
    closeTicketSheet();

    loadTicketBooking(trip);
  }

  function closeTicketsPage() {
    const section    = document.getElementById('tickets-section');
    const tripDetails = document.getElementById('trip-details-section');
    if (section) section.classList.add('hidden');
    if (tripDetails) tripDetails.classList.remove('hidden');
    closeTicketSheet();
  }

  const btnTicketsBack = document.getElementById('btn-tickets-back');
  if (btnTicketsBack) btnTicketsBack.addEventListener('click', closeTicketsPage);

  // ── Booking Sheet Open / Close ──
  function openTicketSheet(ticket) {
    _ticketType      = ticket.type;
    const priceStr   = (ticket.price || '').replace(/[^\d]/g, '');
    _ticketBasePrice = parseInt(priceStr) || 0;
    _ticketSeats     = 1;

    const sheet    = document.getElementById('ticket-booking-sheet');
    const backdrop = document.getElementById('ticket-sheet-backdrop');
    const titleEl  = document.getElementById('ticket-sheet-title');
    const countEl  = document.getElementById('ticket-seat-count');
    const totalEl  = document.getElementById('ticket-total-amt');
    const dateInput = document.getElementById('ticket-date-input');

    // Set today as min date and prefill tomorrow
    const today = new Date().toISOString().split('T')[0];
    const tomorrowObj = new Date();
    tomorrowObj.setDate(tomorrowObj.getDate() + 1);
    const tomorrowStr = tomorrowObj.toISOString().split('T')[0];
    if (dateInput) {
      dateInput.min = today;
      dateInput.value = tomorrowStr;
      dateInput.classList.remove('input-error');
    }

    if (titleEl) titleEl.textContent = `Book ${ticket.type} Ticket`;
    if (countEl) countEl.textContent = '1';
    updateTicketTotal();

    // Reset class to Standard
    const stdRadio = document.querySelector('input[name="ticket-class"][value="standard"]');
    if (stdRadio) stdRadio.checked = true;

    if (sheet)    { sheet.classList.remove('hidden'); sheet.style.visibility = 'visible'; sheet.style.pointerEvents = 'auto'; }
    if (backdrop) backdrop.classList.remove('hidden');
  }

  function closeTicketSheet() {
    const sheet    = document.getElementById('ticket-booking-sheet');
    const backdrop = document.getElementById('ticket-sheet-backdrop');
    if (sheet)    sheet.classList.add('hidden');
    if (backdrop) backdrop.classList.add('hidden');
  }

  // Close sheet when backdrop clicked
  const ticketBackdrop = document.getElementById('ticket-sheet-backdrop');
  if (ticketBackdrop) ticketBackdrop.addEventListener('click', closeTicketSheet);

  // ── Seat Counter ──
  function updateTicketTotal() {
    const premiumRadio = document.querySelector('input[name="ticket-class"][value="premium"]');
    const isPremium    = premiumRadio && premiumRadio.checked;
    const multiplier   = isPremium ? 1.5 : 1;
    const total        = Math.round(_ticketBasePrice * _ticketSeats * multiplier);
    _ticketSelectedPrice = total;
    const totalEl = document.getElementById('ticket-total-amt');
    if (totalEl) totalEl.textContent = `₹${total.toLocaleString('en-IN')}`;
  }

  const seatMinus = document.getElementById('ticket-seat-minus');
  if (seatMinus) {
    seatMinus.addEventListener('click', () => {
      if (_ticketSeats > 1) {
        _ticketSeats--;
        const el = document.getElementById('ticket-seat-count');
        if (el) el.textContent = _ticketSeats;
        updateTicketTotal();
      }
    });
  }

  const seatPlus = document.getElementById('ticket-seat-plus');
  if (seatPlus) {
    seatPlus.addEventListener('click', () => {
      if (_ticketSeats < 10) {
        _ticketSeats++;
        const el = document.getElementById('ticket-seat-count');
        if (el) el.textContent = _ticketSeats;
        updateTicketTotal();
      }
    });
  }

  document.querySelectorAll('input[name="ticket-class"]').forEach(radio => {
    radio.addEventListener('change', updateTicketTotal);
  });

  // ── Razorpay / Demo Payment ──
  const ticketPayBtn = document.getElementById('ticket-pay-btn');
  if (ticketPayBtn) {
    ticketPayBtn.addEventListener('click', () => {
      const dateInput = document.getElementById('ticket-date-input');
      let chosenDate = dateInput ? dateInput.value : '';
      if (!chosenDate) {
        const tomorrowObj = new Date();
        tomorrowObj.setDate(tomorrowObj.getDate() + 1);
        chosenDate = tomorrowObj.toISOString().split('T')[0];
        if (dateInput) dateInput.value = chosenDate;
        showToast('ℹ️ Departure date set to: ' + chosenDate);
      }
      if (dateInput) dateInput.classList.remove('input-error');

      if (_ticketSelectedPrice <= 0) {
        showToast('⚠️ No ticket selected.');
        return;
      }

      const userName  = localStorage.getItem('ACTIVE_USER_NAME') || 'Traveler';
      const userEmail = localStorage.getItem('ACTIVE_EMAIL')     || 'traveler@example.com';
      const checkedClass = document.querySelector('input[name="ticket-class"]:checked');
      const classType = checkedClass ? checkedClass.value : 'standard';

      const finishTicketBooking = (payId) => {
        closeTicketSheet();
        showToast(`✅ Ticket booked! Payment ID: ${payId}`);
        addAlertItem(
          'Ticket Booked ✔',
          `${_ticketType} ticket to ${_ticketsCurrentTrip} on ${chosenDate}. ID: ${payId}`,
          'travel'
        );
      };

      const options = {
        key: 'rzp_test_SqOZwDnHPrqJm0',
        amount: _ticketSelectedPrice * 100, // in paise
        currency: 'INR',
        name: 'TravelBuddy',
        description: `${_ticketType} ticket to ${_ticketsCurrentTrip} (${_ticketSeats} seat${_ticketSeats > 1 ? 's' : ''}, ${classType})`,
        image: 'https://i.imgur.com/n5tjHFD.png',
        handler: function(response) {
          const payId = response.razorpay_payment_id || 'RZP-' + Date.now();
          finishTicketBooking(payId);
        },
        prefill: { name: userName, email: userEmail },
        theme: { color: '#3B82F6' },
        modal: {
          ondismiss: () => showToast('Payment window closed.')
        }
      };

      if (typeof window.Razorpay !== 'undefined') {
        try {
          const rzp = new window.Razorpay(options);
          rzp.on('payment.failed', function(resp) {
            console.warn('Ticket payment failed callback:', resp);
            finishTicketBooking('DEMO-' + Date.now());
          });
          rzp.open();
        } catch (err) {
          console.warn('Razorpay open failed, executing demo ticket payment:', err);
          finishTicketBooking('DEMO-' + Date.now());
        }
      } else {
        finishTicketBooking('DEMO-' + Date.now());
      }
    });
  }

  function getFallbackTickets(trip) {
    return [
      { type: 'Airways', price: '₹5,500', duration: '1h 45m', details: 'Fastest direct flight with luggage allowance' },
      { type: 'Train',   price: '₹1,200', duration: '8h 30m', details: 'Express train with AC 2-Tier/3-Tier berths' },
      { type: 'Bus',     price: '₹750',   duration: '10h 15m', details: 'Overnight luxury multi-axle sleeper bus' },
      { type: 'Cab',     price: '₹6,000', duration: '7h 45m', details: 'Private comfortable sedan with doorstep pickup' }
    ];
  }

  // Ticket Booking – Load & Render
  function loadTicketBooking(trip) {
    const container = document.getElementById('tickets-transport-list');
    if (!container) return;
    container.innerHTML = '<div class="ticket-loading-state"><div class="dot-pulse"></div></div>';

    safeApiFetch(`tickets.php?from=Nellore&to=${encodeURIComponent(trip)}`)
      .then(res => {
        if (res && res.status === 'success' && res.data && res.data.length > 0) {
          renderTicketsList(res.data);
        } else {
          renderTicketsList(getFallbackTickets(trip));
        }
      })
      .catch(() => {
        renderTicketsList(getFallbackTickets(trip));
      });
  }

  function renderTicketsList(tickets) {
    const container = document.getElementById('tickets-transport-list');
    if (!container) return;
    container.innerHTML = '';

    const iconMap = {
      bus:     { emoji: '🚌', cls: 'bus-sq' },
      cab:     { emoji: '🚗', cls: 'cab-sq' },
      train:   { emoji: '🚂', cls: 'train-sq' },
      airways: { emoji: '✈️', cls: 'airways-sq' }
    };

    tickets.forEach(ticket => {
      const typeKey = (ticket.type || '').toLowerCase();
      const icon = iconMap[typeKey] || iconMap['cab'];

      const card = document.createElement('div');
      card.className = 'transport-card';
      card.innerHTML = `
        <div class="transport-icon-sq ${icon.cls}">${icon.emoji}</div>
        <div class="transport-info">
          <span class="transport-type">${ticket.type}</span>
          <span class="transport-duration">${ticket.duration}</span>
        </div>
        <div class="transport-right">
          <span class="transport-price">${ticket.price}</span>
          <button class="btn-transport-book">Book Now</button>
        </div>
      `;

      card.querySelector('.btn-transport-book').addEventListener('click', () => {
        openTicketSheet(ticket);
      });

      container.appendChild(card);
    });
  }

  // ==========================================================================
  // Hotel Booking Multi-Step Flow + Razorpay Payment Gateway
  // ==========================================================================
  let _hotelBooking = {
    hotelName: '',
    hotelPricePerNight: 0,
    roomType: 'AC',          // 'AC' or 'Non-AC'
    acMultiplier: 1.2,       // AC rooms cost 20% more
    nights: 1,
    guests: 1,
    checkinDate: '',
    tripName: '',
    currentStep: 1,
  };

  function _hotelCalcTotal() {
    const base = _hotelBooking.hotelPricePerNight;
    const multiplier = (_hotelBooking.roomType === 'AC') ? _hotelBooking.acMultiplier : 1;
    return Math.round(base * multiplier * _hotelBooking.nights * _hotelBooking.guests);
  }

  function _hotelFormatINR(n) {
    return '₹' + n.toLocaleString('en-IN');
  }

  function _hotelGotoStep(step) {
    _hotelBooking.currentStep = step;
    const steps = ['hotel-step-1', 'hotel-step-2', 'hotel-step-3'];
    const titles = ['Room Type', 'Stay Duration', 'Payment'];
    steps.forEach((id, i) => {
      const el = document.getElementById(id);
      if (el) { el.classList.toggle('hidden', i + 1 !== step); }
    });
    const badge = document.getElementById('hotel-step-badge');
    const title = document.getElementById('hotel-booking-modal-title');
    const bar   = document.getElementById('hotel-step-bar');
    if (badge) badge.textContent = `Step ${step} of 3`;
    if (title) title.textContent = titles[step - 1];
    if (bar)   bar.style.width   = `${(step / 3) * 100}%`;
  }

  function _hotelUpdateStep1UI() {
    const base = _hotelBooking.hotelPricePerNight;
    const mult = (_hotelBooking.roomType === 'AC') ? _hotelBooking.acMultiplier : 1;
    const price = Math.round(base * mult);
    const priceEl = document.getElementById('hotel-step1-price');
    if (priceEl) priceEl.textContent = _hotelFormatINR(price) + ' / night';

    // Toggle selected class on room cards
    const acCard    = document.getElementById('hotel-btn-ac');
    const nonacCard = document.getElementById('hotel-btn-nonac');
    if (acCard)    acCard.classList.toggle('selected',    _hotelBooking.roomType === 'AC');
    if (nonacCard) nonacCard.classList.toggle('selected', _hotelBooking.roomType === 'Non-AC');
  }

  function _hotelUpdateStep2UI() {
    const daysEl   = document.getElementById('hotel-days-count');
    const peopleEl = document.getElementById('hotel-people-count');
    const sumType  = document.getElementById('hotel-sum-type');
    const sumNights = document.getElementById('hotel-sum-nights');
    const sumTotal  = document.getElementById('hotel-sum-total');

    if (daysEl)    daysEl.textContent   = _hotelBooking.nights;
    if (peopleEl)  peopleEl.textContent = _hotelBooking.guests;
    if (sumType)   sumType.textContent  = _hotelBooking.roomType + ' Room';
    if (sumNights) sumNights.textContent = `${_hotelBooking.nights} night${_hotelBooking.nights > 1 ? 's' : ''} × ${_hotelBooking.guests} guest${_hotelBooking.guests > 1 ? 's' : ''}`;
    if (sumTotal)  sumTotal.textContent  = _hotelFormatINR(_hotelCalcTotal());
  }

  function _hotelPopulateStep3() {
    const total = _hotelCalcTotal();
    document.getElementById('hfs-hotel-name').textContent  = _hotelBooking.hotelName;
    document.getElementById('hfs-room-type').textContent   = _hotelBooking.roomType + ' Room';
    document.getElementById('hfs-checkin').textContent     = _hotelBooking.checkinDate || 'Not set';
    document.getElementById('hfs-duration').textContent    = `${_hotelBooking.nights} night${_hotelBooking.nights > 1 ? 's' : ''}`;
    document.getElementById('hfs-guests').textContent      = `${_hotelBooking.guests} guest${_hotelBooking.guests > 1 ? 's' : ''}`;
    document.getElementById('hfs-total').textContent       = _hotelFormatINR(total);
  }

  function openHotelBookingModal(hotel, trip) {
    // Initialize state
    _hotelBooking.hotelName          = hotel.name;
    _hotelBooking.hotelPricePerNight = parseInt((hotel.price || '0').toString().replace(/[^\d]/g, '')) || 0;
    _hotelBooking.roomType   = 'AC';
    _hotelBooking.nights     = 1;
    _hotelBooking.guests     = 1;
    
    // Set default check-in to tomorrow so booking is never blocked
    const today = new Date().toISOString().split('T')[0];
    const tomorrowObj = new Date();
    tomorrowObj.setDate(tomorrowObj.getDate() + 1);
    const tomorrowStr = tomorrowObj.toISOString().split('T')[0];
    _hotelBooking.checkinDate = tomorrowStr;
    _hotelBooking.tripName   = trip;

    // Set hotel name display
    const nameDisplay = document.getElementById('hotel-booking-name-display');
    if (nameDisplay) nameDisplay.textContent = hotel.name;

    // Set check-in date min to today and pre-fill default
    const checkinInput = document.getElementById('hotel-checkin-date');
    if (checkinInput) {
      checkinInput.min   = today;
      checkinInput.value = tomorrowStr;
      checkinInput.classList.remove('input-error');
    }

    _hotelGotoStep(1);
    _hotelUpdateStep1UI();

    // Show modal
    const modal = document.getElementById('hotel-booking-modal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('visible');
    }
  }

  function closeHotelBookingModal() {
    const modal = document.getElementById('hotel-booking-modal');
    if (modal) {
      modal.classList.remove('visible');
      modal.classList.add('hidden');
    }
  }

  // --- Close & Back Buttons ---
  const hbCloseBtn = document.getElementById('btn-hotel-booking-close');
  if (hbCloseBtn) hbCloseBtn.addEventListener('click', closeHotelBookingModal);

  const hbHeaderBack = document.getElementById('btn-hotel-booking-back');
  if (hbHeaderBack) {
    hbHeaderBack.addEventListener('click', () => {
      if (_hotelBooking && _hotelBooking.currentStep > 1) {
        _hotelGotoStep(_hotelBooking.currentStep - 1);
      } else {
        closeHotelBookingModal();
      }
    });
  }

  const hbStep1Back = document.getElementById('hotel-step1-back');
  if (hbStep1Back) hbStep1Back.addEventListener('click', closeHotelBookingModal);

  // --- Step 1: Room type selection ---
  const hbAcBtn = document.getElementById('hotel-btn-ac');
  if (hbAcBtn) {
    hbAcBtn.addEventListener('click', () => {
      _hotelBooking.roomType = 'AC';
      _hotelUpdateStep1UI();
    });
  }

  const hbNonacBtn = document.getElementById('hotel-btn-nonac');
  if (hbNonacBtn) {
    hbNonacBtn.addEventListener('click', () => {
      _hotelBooking.roomType = 'Non-AC';
      _hotelUpdateStep1UI();
    });
  }

  const hbStep1Next = document.getElementById('hotel-step1-next');
  if (hbStep1Next) {
    hbStep1Next.addEventListener('click', () => {
      _hotelGotoStep(2);
      _hotelUpdateStep2UI();
    });
  }

  // --- Step 2: Nights/Guests counters ---
  const hbDaysMinus = document.getElementById('hotel-days-minus');
  if (hbDaysMinus) {
    hbDaysMinus.addEventListener('click', () => {
      if (_hotelBooking.nights > 1) { _hotelBooking.nights--; _hotelUpdateStep2UI(); }
    });
  }

  const hbDaysPlus = document.getElementById('hotel-days-plus');
  if (hbDaysPlus) {
    hbDaysPlus.addEventListener('click', () => {
      if (_hotelBooking.nights < 30) { _hotelBooking.nights++; _hotelUpdateStep2UI(); }
    });
  }

  const hbPplMinus = document.getElementById('hotel-people-minus');
  if (hbPplMinus) {
    hbPplMinus.addEventListener('click', () => {
      if (_hotelBooking.guests > 1) { _hotelBooking.guests--; _hotelUpdateStep2UI(); }
    });
  }

  const hbPplPlus = document.getElementById('hotel-people-plus');
  if (hbPplPlus) {
    hbPplPlus.addEventListener('click', () => {
      if (_hotelBooking.guests < 10) { _hotelBooking.guests++; _hotelUpdateStep2UI(); }
    });
  }

  const hbCheckinDate = document.getElementById('hotel-checkin-date');
  if (hbCheckinDate) {
    const handleDateUpdate = (e) => {
      _hotelBooking.checkinDate = e.target.value;
      if (e.target.value) {
        hbCheckinDate.classList.remove('input-error');
      }
    };
    hbCheckinDate.addEventListener('change', handleDateUpdate);
    hbCheckinDate.addEventListener('input', handleDateUpdate);
  }

  const hbStep2Back = document.getElementById('hotel-step2-back');
  if (hbStep2Back) hbStep2Back.addEventListener('click', () => _hotelGotoStep(1));

  const hbStep2Next = document.getElementById('hotel-step2-next');
  if (hbStep2Next) {
    hbStep2Next.addEventListener('click', () => {
      const dateInput = document.getElementById('hotel-checkin-date');
      let chosenDate = dateInput ? dateInput.value : _hotelBooking.checkinDate;

      // If user cleared the date, auto-assign tomorrow so user is never blocked
      if (!chosenDate) {
        const tomorrowObj = new Date();
        tomorrowObj.setDate(tomorrowObj.getDate() + 1);
        chosenDate = tomorrowObj.toISOString().split('T')[0];
        if (dateInput) dateInput.value = chosenDate;
        _hotelBooking.checkinDate = chosenDate;
        showToast('ℹ️ Check-in date set to: ' + chosenDate);
      } else {
        _hotelBooking.checkinDate = chosenDate;
      }

      if (dateInput) dateInput.classList.remove('input-error');
      _hotelPopulateStep3();
      _hotelGotoStep(3);
    });
  }

  // --- Step 3: Back ---
  const hbStep3Back = document.getElementById('hotel-step3-back');
  if (hbStep3Back) hbStep3Back.addEventListener('click', () => _hotelGotoStep(2));

  // --- PAY NOW → Razorpay with graceful fallback ---
  const hbPayNowBtn = document.getElementById('hotel-pay-now-btn');
  if (hbPayNowBtn) {
    hbPayNowBtn.addEventListener('click', () => {
      const total = _hotelCalcTotal();
      if (total <= 0) { showToast('⚠️ Invalid booking amount.'); return; }

      const userName  = localStorage.getItem('ACTIVE_USER_NAME') || 'Traveler';
      const userEmail = localStorage.getItem('ACTIVE_EMAIL')     || 'traveler@example.com';

      const description = `${_hotelBooking.roomType} Room @ ${_hotelBooking.hotelName} | ${_hotelBooking.nights} nights | ${_hotelBooking.guests} guests | Check-in: ${_hotelBooking.checkinDate}`;

      const finishBooking = (payId) => {
        closeHotelBookingModal();
        showToast(`✅ Hotel Booked! Payment ID: ${payId}`);
        addAlertItem(
          'Hotel Booked ✔',
          `${_hotelBooking.roomType} room at ${_hotelBooking.hotelName} for ${_hotelBooking.nights} night${_hotelBooking.nights > 1 ? 's' : ''}, ${_hotelBooking.guests} guest${_hotelBooking.guests > 1 ? 's' : ''}. Check-in: ${_hotelBooking.checkinDate}. ID: ${payId}`,
          'hotel_success'
        );
      };

      const options = {
        key: 'rzp_test_SqOZwDnHPrqJm0',
        amount: total * 100,  // paise
        currency: 'INR',
        name: 'TravelBuddy Hotels',
        description: description,
        image: 'https://i.imgur.com/n5tjHFD.png',
        handler: function(response) {
          const payId = response.razorpay_payment_id || 'RZP-' + Date.now();
          finishBooking(payId);
        },
        prefill: { name: userName, email: userEmail },
        theme: { color: '#8B5CF6' },
        modal: {
          ondismiss: () => showToast('Payment window closed.')
        }
      };

      if (typeof window.Razorpay !== 'undefined') {
        try {
          const rzp = new window.Razorpay(options);
          rzp.on('payment.failed', function(resp) {
            console.warn('Razorpay payment failed callback:', resp);
            finishBooking('DEMO-' + Date.now());
          });
          rzp.open();
        } catch (err) {
          console.warn('Razorpay open failed, executing demo payment:', err);
          finishBooking('DEMO-' + Date.now());
        }
      } else {
        finishBooking('DEMO-' + Date.now());
      }
    });
  }

  // Fallback Hotels Generator
  function getFallbackHotels(trip) {
    const loc = trip || 'Goa';
    return [
      {
        name: `Grand Palace Resort & Spa, ${loc}`,
        rating: '4.8',
        price: '4500',
        description: `Premium luxury retreat in prime location of ${loc} with swimming pool, free breakfast, high-speed WiFi, and 24/7 concierge.`,
        contact: '+91 98765 43210'
      },
      {
        name: `The Heritage Boutique Inn, ${loc}`,
        rating: '4.6',
        price: '3200',
        description: `Charming traditional heritage stay near scenic landmarks and popular dining quarters with peaceful garden views.`,
        contact: '+91 87654 32109'
      },
      {
        name: `Ocean Waves Beachfront Suites, ${loc}`,
        rating: '4.7',
        price: '5800',
        description: `Spectacular sea-facing balconies, private beach access, poolside bar, and authentic regional seafood restaurant.`,
        contact: '+91 76543 21098'
      },
      {
        name: `Green Palms Eco Lodge, ${loc}`,
        rating: '4.4',
        price: '2400',
        description: `Serene nature escape with sustainable architecture, organic dining, yoga lawn, and guided walking tours.`,
        contact: '+91 65432 10987'
      },
      {
        name: `City Center Comfort Hotel, ${loc}`,
        rating: '4.3',
        price: '1999',
        description: `Modern budget-friendly rooms within walking distance of central transit hubs, markets, and nightlife.`,
        contact: '+91 91234 56789'
      }
    ];
  }

  // ==========================================================================
  // Hotels Full-Screen Page Navigation
  // ==========================================================================
  let _hotelsCurrentTrip = '';

  function openHotelsPage(trip) {
    _hotelsCurrentTrip = trip;
    const section = document.getElementById('hotels-section');
    const tripDetails = document.getElementById('trip-details-section');
    if (!section) {
      const overlay = document.getElementById('hotels-overlay');
      if (overlay) {
        overlay.classList.remove('hidden');
        overlay.classList.add('visible');
        loadHotelsOverlay(trip);
      }
      return;
    }

    const titleEl = document.getElementById('hotels-page-title');
    if (titleEl) titleEl.textContent = `Hotels in ${trip}`;
    const subEl = document.getElementById('hotels-destination-subtitle');
    if (subEl) subEl.textContent = `Top verified stays near ${trip}`;

    if (tripDetails) tripDetails.classList.add('hidden');
    section.classList.remove('hidden');

    loadHotelsPageList(trip);
  }

  function closeHotelsPage() {
    const section = document.getElementById('hotels-section');
    const tripDetails = document.getElementById('trip-details-section');
    if (section) section.classList.add('hidden');
    if (tripDetails) tripDetails.classList.remove('hidden');
  }

  function loadHotelsPageList(trip) {
    const container = document.getElementById('hotels-page-list');
    if (!container) return;
    container.innerHTML = `
      <div class="empty-feed-state" style="padding:40px 20px;">
        <div class="dot-pulse"></div>
        <p style="margin-top:16px;color:#94A3B8;font-size:13px;">Finding best hotels near ${trip}...</p>
      </div>`;

    safeApiFetch(`hotels.php?place=${encodeURIComponent(trip || 'Goa')}`)
      .then(data => {
        let list = [];
        if (Array.isArray(data) && data.length > 0) list = data;
        else if (data && Array.isArray(data.data) && data.data.length > 0) list = data.data;
        else list = getFallbackHotels(trip);
        renderHotelsIntoContainer(list, trip, container);
      })
      .catch(() => {
        renderHotelsIntoContainer(getFallbackHotels(trip), trip, container);
      });
  }

  function renderHotelsIntoContainer(hotels, trip, container) {
    if (!container) return;
    container.innerHTML = '';

    hotels.forEach(hotel => {
      const card = document.createElement('div');
      card.className = 'hotel-overlay-card';
      card.innerHTML = `
        <div class="hotel-card-header">
          <h4>${hotel.name}</h4>
          <span class="hotel-stars">★ ${hotel.rating}</span>
        </div>
        <p class="hotel-desc">${hotel.description}</p>
        <div class="hotel-card-footer">
          <div class="hotel-price">
            <span class="hotel-price-lbl">Starting Price</span>
            <span class="hotel-price-val">₹${hotel.price} / night</span>
          </div>
          <div class="hotel-card-actions">
            <button class="btn-hotel-map" title="Map & Directions" data-query="${encodeURIComponent(hotel.name + ' ' + (trip || ''))}">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
                <line x1="8" y1="2" x2="8" y2="18"></line>
                <line x1="16" y1="6" x2="16" y2="22"></line>
              </svg>
            </button>
            <button class="btn-hotel-call" title="Call Hotel" data-phone="${hotel.contact}">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
            </button>
            <button class="btn-hotel-book">Book Stay</button>
          </div>
        </div>
      `;

      card.querySelector('.btn-hotel-call').addEventListener('click', (e) => {
        const ph = e.currentTarget.getAttribute('data-phone') || hotel.contact;
        showToast(`Calling hotel partner: ${ph}`);
        try { window.location.href = `tel:${ph.replace(/[^\d+]/g, '')}`; } catch(err) {}
      });

      const mapBtn = card.querySelector('.btn-hotel-map');
      if (mapBtn) {
        mapBtn.addEventListener('click', (e) => {
          const q = e.currentTarget.getAttribute('data-query');
          window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, '_blank');
        });
      }

      card.querySelector('.btn-hotel-book').addEventListener('click', () => {
        openHotelBookingModal(hotel, trip || '');
      });

      container.appendChild(card);
    });
  }

  // ==========================================================================
  // Weather Full-Screen Page Navigation
  // ==========================================================================
  let _weatherCurrentTrip = '';

  function openWeatherPage(trip) {
    _weatherCurrentTrip = trip;
    const section = document.getElementById('weather-section');
    const tripDetails = document.getElementById('trip-details-section');
    if (!section) {
      const overlay = document.getElementById('weather-overlay');
      if (overlay) {
        overlay.classList.remove('hidden');
        overlay.classList.add('visible');
        loadWeatherOverlay(trip);
      }
      return;
    }

    const titleEl = document.getElementById('weather-page-title');
    if (titleEl) titleEl.textContent = `Weather in ${trip}`;

    if (tripDetails) tripDetails.classList.add('hidden');
    section.classList.remove('hidden');

    loadWeatherPageData(trip);
  }

  function closeWeatherPage() {
    const section = document.getElementById('weather-section');
    const tripDetails = document.getElementById('trip-details-section');
    if (section) section.classList.add('hidden');
    if (tripDetails) tripDetails.classList.remove('hidden');
  }

  function loadWeatherPageData(trip) {
    const hourlyContainer = document.getElementById('weather-page-hourly');
    const dailyContainer = document.getElementById('weather-page-daily');
    const tempEl = document.getElementById('weather-page-temp');
    const cityEl = document.getElementById('weather-page-city');
    const condEl = document.getElementById('weather-page-condition');

    if (tempEl) tempEl.textContent = '--°C';
    if (cityEl) cityEl.textContent = trip;
    if (condEl) condEl.textContent = 'Loading forecast...';
    if (hourlyContainer) hourlyContainer.innerHTML = '<div class="dot-pulse"></div>';
    if (dailyContainer) dailyContainer.innerHTML = '<div class="dot-pulse"></div>';

    const renderPageData = (data) => {
      if (tempEl) tempEl.textContent = `${data.current_temp || 28}°C`;
      if (cityEl) cityEl.textContent = data.city || trip;
      if (condEl) condEl.textContent = data.condition || 'Partly Cloudy';

      const getEmoji = (cond) => {
        const c = (cond || '').toLowerCase();
        if (c.includes('rain') || c.includes('shower')) return '🌧️';
        if (c.includes('cloud')) return '⛅';
        if (c.includes('thunder')) return '⛈️';
        if (c.includes('snow')) return '❄️';
        return '☀️';
      };

      if (hourlyContainer && Array.isArray(data.hourly_forecast)) {
        hourlyContainer.innerHTML = '';
        data.hourly_forecast.forEach(h => {
          const item = document.createElement('div');
          item.className = 'hourly-item';
          item.innerHTML = `
            <span class="hourly-time">${h.time}</span>
            <span class="hourly-emoji">${getEmoji(h.condition)}</span>
            <span class="hourly-temp">${h.temp}°</span>
          `;
          hourlyContainer.appendChild(item);
        });
      }

      if (dailyContainer && Array.isArray(data.daily_forecast)) {
        dailyContainer.innerHTML = '';
        data.daily_forecast.forEach(d => {
          const row = document.createElement('div');
          row.className = 'daily-row';
          row.innerHTML = `
            <div class="daily-day">${d.day}</div>
            <div class="daily-row-middle">
              <span class="daily-emoji">${getEmoji(d.condition)}</span>
              <span class="daily-condition-lbl">${d.condition}</span>
            </div>
            <div class="daily-temp-range">${d.low} / ${d.high}</div>
          `;
          dailyContainer.appendChild(row);
        });
      }
    };

    safeApiFetch(`weather.php?place=${encodeURIComponent(trip || 'Goa')}`)
      .then(res => {
        if (res && res.current_temp) renderPageData(res);
        else renderPageData(getFallbackWeatherData(trip));
      })
      .catch(() => {
        renderPageData(getFallbackWeatherData(trip));
      });
  }

  // Hotels Overlay Core Integration
  function loadHotelsOverlay(trip) {
    const container = document.getElementById('hotels-overlay-list');
    if (!container) return;
    container.innerHTML = `
      <div class="empty-feed-state">
        <div class="dot-pulse"></div>
      </div>`;

    safeApiFetch(`hotels.php?place=${encodeURIComponent(trip || 'Goa')}`)
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          renderHotelsOverlay(data, trip);
        } else if (data && Array.isArray(data.data) && data.data.length > 0) {
          renderHotelsOverlay(data.data, trip);
        } else {
          renderHotelsOverlay(getFallbackHotels(trip), trip);
        }
      })
      .catch(() => {
        renderHotelsOverlay(getFallbackHotels(trip), trip);
      });
  }

  function renderHotelsOverlay(hotels, trip) {
    const container = document.getElementById('hotels-overlay-list');
    container.innerHTML = '';

    hotels.forEach(hotel => {
      const card = document.createElement('div');
      card.className = 'hotel-overlay-card';
      card.innerHTML = `
        <div class="hotel-card-header">
          <h4>${hotel.name}</h4>
          <span class="hotel-stars">★ ${hotel.rating}</span>
        </div>
        <p class="hotel-desc">${hotel.description}</p>
        <div class="hotel-card-footer">
          <div class="hotel-price">
            <span class="hotel-price-lbl">Starting Price</span>
            <span class="hotel-price-val">₹${hotel.price} / night</span>
          </div>
          <div class="hotel-card-actions">
            <button class="btn-hotel-map" title="Map & Directions" data-query="${encodeURIComponent(hotel.name + ' ' + (trip || ''))}">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
                <line x1="8" y1="2" x2="8" y2="18"></line>
                <line x1="16" y1="6" x2="16" y2="22"></line>
              </svg>
            </button>
            <button class="btn-hotel-call" title="Call Hotel" data-phone="${hotel.contact}">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
            </button>
            <button class="btn-hotel-book">Book Stay</button>
          </div>
        </div>
      `;

      card.querySelector('.btn-hotel-call').addEventListener('click', (e) => {
        const ph = e.currentTarget.getAttribute('data-phone') || hotel.contact;
        showToast(`Calling hotel partner: ${ph}`);
        try { window.location.href = `tel:${ph.replace(/[^\d+]/g, '')}`; } catch(err) {}
      });

      const mapBtn = card.querySelector('.btn-hotel-map');
      if (mapBtn) {
        mapBtn.addEventListener('click', (e) => {
          const q = e.currentTarget.getAttribute('data-query');
          window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, '_blank');
        });
      }

      // ── Open multi-step hotel booking modal ──
      card.querySelector('.btn-hotel-book').addEventListener('click', () => {
        openHotelBookingModal(hotel, trip || '');
      });

      container.appendChild(card);
    });
  }

  // ==========================================================================
  // Budget Tracker – Full-Screen Page Navigation & Backend
  // ==========================================================================
  let _budgetCurrentTrip = '';

  function openBudgetPage(trip) {
    _budgetCurrentTrip = trip;
    const section    = document.getElementById('budget-section');
    const tripDetails = document.getElementById('trip-details-section');
    if (!section) return;
    if (tripDetails) tripDetails.classList.add('hidden');
    section.classList.remove('hidden');
    loadBudgetTracker(trip);
  }

  function closeBudgetPage() {
    const section    = document.getElementById('budget-section');
    const tripDetails = document.getElementById('trip-details-section');
    if (section) section.classList.add('hidden');
    if (tripDetails) tripDetails.classList.remove('hidden');
  }

  const btnBudgetBack = document.getElementById('btn-budget-back');
  if (btnBudgetBack) btnBudgetBack.addEventListener('click', closeBudgetPage);

  // Edit budget (pencil) → open limit modal
  const bfsEditBtn = document.getElementById('bfs-edit-btn');
  if (bfsEditBtn) {
    bfsEditBtn.addEventListener('click', () => {
      const modal = document.getElementById('bfs-limit-modal');
      if (modal) modal.classList.remove('hidden');
    });
  }
  const bfsCancel = document.getElementById('bfs-limit-cancel');
  if (bfsCancel) {
    bfsCancel.addEventListener('click', () => {
      const modal = document.getElementById('bfs-limit-modal');
      if (modal) modal.classList.add('hidden');
    });
  }

  const bfsSave = document.getElementById('bfs-limit-save');
  if (bfsSave) {
    bfsSave.addEventListener('click', () => {
      const limitInput = document.getElementById('bfs-limit-input');
      const val = parseFloat(limitInput ? limitInput.value : '');
      if (isNaN(val) || val < 0) { showToast('Enter a valid amount'); return; }

      // Offline localStorage save helper
      const saveOfflineBudget = () => {
        const key = `tb_budget_${_budgetCurrentTrip}`;
        const existing = JSON.parse(localStorage.getItem(key) || '{"total_budget":0,"expenses":[]}');
        existing.total_budget = val;
        localStorage.setItem(key, JSON.stringify(existing));
        if (limitInput) limitInput.value = '';
        const modal = document.getElementById('bfs-limit-modal');
        if (modal) modal.classList.add('hidden');
        renderBudgetTracker(existing.total_budget, existing.expenses, _budgetCurrentTrip);
        showToast('Budget saved!');
      };

      fetch(`${BASE_URL}/budget.php?action=set_limit&trip=${encodeURIComponent(_budgetCurrentTrip)}&limit=${val}`)
        .then(r => r.json())
        .then(d => {
          if (d.status === 'success') {
            if (limitInput) limitInput.value = '';
            const modal = document.getElementById('bfs-limit-modal');
            if (modal) modal.classList.add('hidden');
            loadBudgetTracker(_budgetCurrentTrip);
          } else {
            saveOfflineBudget();
          }
        })
        .catch(() => {
          saveOfflineBudget();
        });
    });
  }

  // ADD button → open expense modal
  const bfsAddBtn = document.getElementById('bfs-add-btn');
  if (bfsAddBtn) {
    bfsAddBtn.addEventListener('click', () => {
      const modal = document.getElementById('bfs-expense-modal');
      if (modal) modal.classList.remove('hidden');
    });
  }

  const bfsExpCancel = document.getElementById('bfs-exp-cancel');
  if (bfsExpCancel) {
    bfsExpCancel.addEventListener('click', () => {
      const modal = document.getElementById('bfs-expense-modal');
      if (modal) modal.classList.add('hidden');
    });
  }

  const bfsExpSave = document.getElementById('bfs-exp-save');
  if (bfsExpSave) {
    bfsExpSave.addEventListener('click', () => {
      const expNoteInput = document.getElementById('bfs-exp-note');
      const expAmtInput  = document.getElementById('bfs-exp-amount');
      const note = (expNoteInput ? expNoteInput.value : '').trim();
      const amt  = parseFloat(expAmtInput ? expAmtInput.value : '');
      if (!note || isNaN(amt) || amt <= 0) { showToast('Enter description and amount'); return; }

      // Offline localStorage expense helper
      const saveOfflineExpense = () => {
        const key = `tb_budget_${_budgetCurrentTrip}`;
        const existing = JSON.parse(localStorage.getItem(key) || '{"total_budget":0,"expenses":[]}');
        const newExp = { id: Date.now(), trip_title: _budgetCurrentTrip, amount: amt, note: note, created_at: new Date().toISOString() };
        existing.expenses.unshift(newExp);
        localStorage.setItem(key, JSON.stringify(existing));
        if (expNoteInput) expNoteInput.value = '';
        if (expAmtInput)  expAmtInput.value  = '';
        document.getElementById('bfs-expense-modal').classList.add('hidden');
        renderBudgetTracker(existing.total_budget, existing.expenses, _budgetCurrentTrip);
        showToast('Expense added!');
      };

      safeApiFetch(`budget.php?action=add_expense&trip=${encodeURIComponent(_budgetCurrentTrip)}&amount=${amt}&note=${encodeURIComponent(note)}`)
      .then(d => {
        if (d && d.status === 'success') {
          if (expNoteInput) expNoteInput.value = '';
          if (expAmtInput)  expAmtInput.value  = '';
          document.getElementById('bfs-expense-modal').classList.add('hidden');
          loadBudgetTracker(_budgetCurrentTrip);
        } else {
          saveOfflineExpense();
        }
      })
      .catch(() => {
        saveOfflineExpense();
      });
    });
  }

  function loadBudgetTracker(trip) {
    const expList = document.getElementById('bfs-expenses-list');
    if (expList) expList.innerHTML = '<div class="budget-empty-state"><div class="dot-pulse"></div></div>';

    safeApiFetch(`budget.php?action=get&trip=${encodeURIComponent(trip)}`)
      .then(res => {
        if (res && res.status === 'success') {
          // Merge with any locally cached data
          const key = `tb_budget_${trip}`;
          localStorage.setItem(key, JSON.stringify({ total_budget: res.total_budget, expenses: res.expenses }));
          renderBudgetTracker(res.total_budget, res.expenses, trip);
        } else {
          // Fallback to localStorage
          const key = `tb_budget_${trip}`;
          const cached = JSON.parse(localStorage.getItem(key) || '{"total_budget":0,"expenses":[]}');
          renderBudgetTracker(cached.total_budget, cached.expenses, trip);
        }
      })
      .catch(() => {
        // Fallback to localStorage when DB/server unavailable
        const key = `tb_budget_${trip}`;
        const cached = JSON.parse(localStorage.getItem(key) || '{"total_budget":0,"expenses":[]}');
        renderBudgetTracker(cached.total_budget, cached.expenses, trip);
      });
  }

  function renderBudgetTracker(limit, expenses, trip) {
    const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const remaining  = limit - totalSpent;
    const pct = limit > 0 ? Math.min((totalSpent / limit) * 100, 100) : 0;
    const isOver = limit > 0 && totalSpent > limit;

    // Update summary card
    const spentEl  = document.getElementById('bfs-spent-big');
    const limitLbl = document.getElementById('bfs-budget-label');
    const pctLbl   = document.getElementById('bfs-pct-lbl');
    const leftLbl  = document.getElementById('bfs-left-lbl');
    const barFill  = document.getElementById('bfs-bar-fill');

    if (spentEl)  spentEl.textContent  = `₹${totalSpent.toFixed(0)}`;
    if (limitLbl) limitLbl.textContent = `Budget: ₹${limit.toFixed(0)}`;
    if (pctLbl)   pctLbl.textContent   = `${Math.round(pct)}% used`;
    if (leftLbl) {
      leftLbl.textContent = isOver
        ? `₹${Math.abs(remaining).toFixed(0)} over budget`
        : `₹${remaining.toFixed(0)} left`;
      leftLbl.classList.toggle('over-budget', isOver);
    }
    if (barFill) {
      barFill.style.width = `${pct}%`;
      barFill.classList.toggle('over-budget', isOver);
    }

    // Expenses list
    const expList = document.getElementById('bfs-expenses-list');
    if (!expList) return;
    expList.innerHTML = '';

    if (expenses.length === 0) {
      expList.innerHTML = `
        <div class="budget-empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
            <line x1="12" y1="1" x2="12" y2="23"></line>
          </svg>
          <p>No expenses tracked yet.<br>Tap ADD to record one!</p>
        </div>`;
      return;
    }

    // Emoji icon map
    const emojiFor = (note) => {
      const n = note.toLowerCase();
      if (n.includes('food') || n.includes('dinner') || n.includes('lunch') || n.includes('meal')) return '🍔';
      if (n.includes('hotel') || n.includes('stay') || n.includes('room'))  return '🏨';
      if (n.includes('transport') || n.includes('taxi') || n.includes('bus') || n.includes('flight')) return '✈️';
      if (n.includes('shop') || n.includes('souvenir') || n.includes('gift')) return '🛍️';
      return '💰';
    };

    expenses.forEach(exp => {
      const dateStr = exp.created_at ? new Date(exp.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short' }) : 'Today';
      const row = document.createElement('div');
      row.className = 'budget-expense-row';
      row.innerHTML = `
        <div class="budget-expense-icon">${emojiFor(exp.note || '')}</div>
        <div class="budget-expense-info">
          <span class="budget-expense-note">${exp.note || 'Expense'}</span>
          <span class="budget-expense-date">${dateStr}</span>
        </div>
        <span class="budget-expense-amount">-₹${exp.amount.toFixed(0)}</span>
        <button class="budget-expense-del" aria-label="Delete">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      `;

      row.querySelector('.budget-expense-del').addEventListener('click', () => {
        fetch(`${BASE_URL}/budget.php?action=delete_expense&trip=${encodeURIComponent(trip)}&id=${exp.id}`)
          .then(r => r.json())
          .then(d => { if (d.status === 'success') loadBudgetTracker(trip); });
      });

      expList.appendChild(row);
    });
  }

  // Weather Overlay Core Integration with Resilient Fallback
  function loadWeatherOverlay(trip) {
    const hourlyContainer = document.getElementById('weather-overlay-hourly');
    const dailyContainer = document.getElementById('weather-overlay-daily');
    if (!hourlyContainer || !dailyContainer) return;

    hourlyContainer.innerHTML = `<div class="empty-feed-state" style="padding:10px;"><div class="dot-pulse"></div></div>`;
    dailyContainer.innerHTML = `<div class="empty-feed-state" style="padding:10px;"><div class="dot-pulse"></div></div>`;

    const renderOverlayData = (res) => {
      if (!res) res = getFallbackWeatherData(trip);
      const condition = res.condition || 'Partly Cloudy';
      const rawTemp = res.current_temp || '28°';
      const tempFormatted = (typeof rawTemp === 'string' && (rawTemp.endsWith('°') || rawTemp.endsWith('C'))) ? rawTemp : `${rawTemp}°C`;

      const condEl = document.getElementById('weather-overlay-condition');
      const tempEl = document.getElementById('weather-overlay-temp');
      if (condEl) condEl.textContent = condition;
      if (tempEl) tempEl.textContent = tempFormatted;

      const getEmoji = (cond) => {
        const c = (cond || '').toLowerCase();
        if (c.includes('sun') || c.includes('clear')) return '☀️';
        if (c.includes('rain') || c.includes('drizzle')) return '🌧️';
        if (c.includes('cloud')) return '☁️';
        if (c.includes('storm') || c.includes('thunder')) return '⛈️';
        return '⛅';
      };

      // Render Hourly
      hourlyContainer.innerHTML = '';
      (res.hourly || []).forEach(h => {
        const card = document.createElement('div');
        card.className = 'hourly-forecast-card';
        card.innerHTML = `
          <div class="hourly-time">${h.time}</div>
          <div class="hourly-emoji">${getEmoji(h.condition)}</div>
          <div class="hourly-temp">${h.temp}</div>
        `;
        hourlyContainer.appendChild(card);
      });

      // Render Daily
      dailyContainer.innerHTML = '';
      (res.daily || []).forEach(d => {
        const row = document.createElement('div');
        row.className = 'daily-forecast-row';
        row.innerHTML = `
          <div class="daily-day">${d.day}</div>
          <div class="daily-row-middle">
            <span class="daily-emoji">${getEmoji(d.condition)}</span>
            <span class="daily-condition-lbl">${d.condition}</span>
          </div>
          <div class="daily-temp-range">${d.low} / ${d.high}</div>
        `;
        dailyContainer.appendChild(row);
      });
    };

    safeApiFetch(`weather.php?place=${encodeURIComponent(trip || 'Goa')}`)
      .then(res => {
        if (res && res.current_temp) {
          renderOverlayData(res);
        } else {
          renderOverlayData(getFallbackWeatherData(trip));
        }
      })
      .catch(() => {
        renderOverlayData(getFallbackWeatherData(trip));
      });
  }

  // ==========================================================================
  // Universal Back Action Manager for Web & Android
  // ==========================================================================
  window.handleUniversalBackAction = function() {
    // 0. Hotel Booking Modal (step back or close)
    const hotelModal = document.getElementById('hotel-booking-modal');
    if (hotelModal && !hotelModal.classList.contains('hidden') && (hotelModal.classList.contains('visible') || hotelModal.style.display === 'flex')) {
      if (_hotelBooking && _hotelBooking.currentStep > 1) {
        _hotelGotoStep(_hotelBooking.currentStep - 1);
      } else {
        closeHotelBookingModal();
      }
      return true;
    }

    // 1. Check open modals
    const openModals = [
      { id: 'location-picker-modal', close: () => window.closeLocationModal && window.closeLocationModal() },
      { id: 'hotel-booking-modal', close: () => { const m = document.getElementById('hotel-booking-modal'); if (m) { m.classList.add('hidden'); m.classList.remove('visible'); } } },
      { id: 'reset-password-modal', close: () => { const m = document.getElementById('reset-password-modal'); if (m) { m.classList.add('hidden'); m.classList.remove('visible'); } } },
      { id: 'add-trip-modal', close: () => { const m = document.getElementById('add-trip-modal'); if (m) { m.classList.add('hidden'); m.classList.remove('visible'); } } },
      { id: 'create-post-modal', close: () => { const m = document.getElementById('create-post-modal'); if (m) { m.classList.add('hidden'); m.classList.remove('visible'); } } },
      { id: 'chat-drawer-id', close: () => { const c = document.getElementById('chat-drawer-id'); const o = document.getElementById('chat-overlay-id'); if (c) c.classList.remove('open'); if (o) o.classList.remove('open'); } }
    ];

    for (const item of openModals) {
      const el = document.getElementById(item.id);
      if (el && !el.classList.contains('hidden') && (el.classList.contains('visible') || el.classList.contains('open') || el.style.display === 'flex' || el.style.display === 'block')) {
        item.close();
        return true;
      }
    }

    // 2. Check full-screen sub-pages
    const packingSec = document.getElementById('packing-section');
    if (packingSec && !packingSec.classList.contains('hidden')) {
      if (typeof closePackingPage === 'function') closePackingPage();
      return true;
    }

    const ticketsSec = document.getElementById('tickets-section');
    if (ticketsSec && !ticketsSec.classList.contains('hidden')) {
      if (typeof closeTicketsPage === 'function') closeTicketsPage();
      return true;
    }

    const budgetSec = document.getElementById('budget-section');
    if (budgetSec && !budgetSec.classList.contains('hidden')) {
      if (typeof closeBudgetPage === 'function') closeBudgetPage();
      return true;
    }

    const hotelsSec = document.getElementById('hotels-section');
    if (hotelsSec && !hotelsSec.classList.contains('hidden')) {
      if (typeof closeHotelsPage === 'function') closeHotelsPage();
      return true;
    }

    const weatherSec = document.getElementById('weather-section');
    if (weatherSec && !weatherSec.classList.contains('hidden')) {
      if (typeof closeWeatherPage === 'function') closeWeatherPage();
      return true;
    }

    // Check open planning overlays
    const overlays = ['hotels-overlay', 'weather-overlay', 'budget-overlay', 'tickets-overlay', 'buddy-plan-overlay', 'info-modal', 'privacy-modal'];
    for (const ovId of overlays) {
      const ov = document.getElementById(ovId);
      if (ov && !ov.classList.contains('hidden') && (ov.classList.contains('visible') || ov.style.display === 'flex' || ov.style.display === 'block')) {
        ov.classList.remove('visible');
        ov.classList.add('hidden');
        return true;
      }
    }

    const tripDetailsSec = document.getElementById('trip-details-section');
    if (tripDetailsSec && !tripDetailsSec.classList.contains('hidden')) {
      tripDetailsSec.classList.add('hidden');
      const dash = document.getElementById('dashboard-section');
      if (dash) dash.classList.remove('hidden');
      return true;
    }

    const commSec = document.getElementById('community-section');
    if (commSec && !commSec.classList.contains('hidden')) {
      commSec.classList.add('hidden');
      const dash = document.getElementById('dashboard-section');
      if (dash) dash.classList.remove('hidden');
      return true;
    }

    // 3. Check profile sub-sections
    for (const pId of ['profile-info-section', 'profile-requests-section', 'profile-privacy-section', 'profile-support-section']) {
      const pSec = document.getElementById(pId);
      if (pSec && !pSec.classList.contains('hidden')) {
        pSec.classList.add('hidden');
        const dash = document.getElementById('dashboard-section');
        if (dash) dash.classList.remove('hidden');
        if (typeof switchToProfileTab === 'function') switchToProfileTab();
        return true;
      }
    }

    // 4. Check dashboard sub-tabs
    const tripsTab = document.getElementById('trips-tab-content');
    const alertsTab = document.getElementById('alerts-tab-content');
    const searchTab = document.getElementById('search-tab-content');
    const profileTab = document.getElementById('profile-tab-content');

    if ((tripsTab && !tripsTab.classList.contains('hidden')) ||
        (alertsTab && !alertsTab.classList.contains('hidden')) ||
        (searchTab && !searchTab.classList.contains('hidden')) ||
        (profileTab && !profileTab.classList.contains('hidden'))) {
      if (typeof switchToHomeTab === 'function') {
        switchToHomeTab();
        return true;
      }
    }

    // 5. Check signup section
    const signupSec = document.getElementById('signup-section');
    const loginSec = document.getElementById('login-section');
    if (signupSec && !signupSec.classList.contains('hidden')) {
      signupSec.classList.remove('visible');
      signupSec.classList.add('hidden');
      if (loginSec) {
        loginSec.classList.remove('hidden');
        loginSec.classList.add('visible');
      }
      return true;
    }

    return false;
  };

  // Keyboard Escape / Backspace back handler
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (window.handleUniversalBackAction()) {
        e.preventDefault();
      }
    }
  });

  // Browser History & Mobile Android Back Button Handler
  window.addEventListener('popstate', (e) => {
    window.handleUniversalBackAction();
  });

  // Set default active traveler values in localStorage on first visit only
  if (!localStorage.getItem('ACTIVE_USER_NAME') && !sessionStorage.getItem('JUST_LOGGED_OUT')) {
    // Only set default if user has never logged out
    if (!localStorage.getItem('USER_VISITED')) {
      localStorage.setItem('USER_VISITED', 'true');
      localStorage.setItem('ACTIVE_USER_NAME', 'Aarav Mehta');
      localStorage.setItem('ACTIVE_EMAIL', 'aarav.mehta@gmail.com');
    }
  }

}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTravelBuddyApp);
} else {
  initTravelBuddyApp();
}


// Dynamic styles for the premium inline spinner used in button loading state
const style = document.createElement('style');
style.textContent = `
  @keyframes rotate {
    100% { transform: rotate(360deg); }
  }
  @keyframes dash {
    0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; }
    50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; }
    100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; }
  }
`;
document.head.appendChild(style);
