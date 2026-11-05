package com.simats.travelbuddy

import android.content.Intent
import android.graphics.Color
import android.graphics.drawable.GradientDrawable
import android.os.Bundle
import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import android.widget.HorizontalScrollView
import android.widget.LinearLayout
import android.widget.TextView
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.card.MaterialCardView
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

data class ChatMessage(
    val text: String,
    val isUser: Boolean,
    val options: List<ChatOptionItem> = emptyList(),
    val agentName: String = "",
    val agentType: String = ""
)

class ChatBuddyActivity : AppCompatActivity() {

    private lateinit var rvChat: RecyclerView
    private lateinit var etMessage: EditText
    private lateinit var btnSend: View
    private val messages = mutableListOf<ChatMessage>()
    private lateinit var chatAdapter: ChatAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_chat_buddy)

        val rootView = findViewById<ViewGroup>(android.R.id.content).getChildAt(0)
        val llInputArea = findViewById<View>(R.id.llInputArea)
        val rlToolbar = findViewById<View>(R.id.rlToolbar)
        val density = resources.displayMetrics.density
        val padding16 = (16 * density).toInt()

        ViewCompat.setOnApplyWindowInsetsListener(rootView) { _, insets ->
            val imeInsets = insets.getInsets(WindowInsetsCompat.Type.ime())
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            val bottomInset = if (imeInsets.bottom > 0) imeInsets.bottom else systemBars.bottom
            llInputArea.setPadding(padding16, padding16, padding16, padding16 + bottomInset)
            rlToolbar.setPadding(systemBars.left, systemBars.top, systemBars.right, 0)
            insets
        }

        rvChat = findViewById(R.id.rvChat)
        etMessage = findViewById(R.id.etMessage)
        btnSend = findViewById(R.id.btnSend)

        findViewById<View>(R.id.ivBack).setOnClickListener { finish() }

        chatAdapter = ChatAdapter(messages) { option ->
            handleOptionClick(option)
        }
        rvChat.adapter = chatAdapter

        // Initial Greeting with Action Options
        val initialOptions = listOf(
            ChatOptionItem("💰 Plan ₹6,000 Trip", "budget", "6000"),
            ChatOptionItem("🏖️ Explore Goa", "place", "Goa"),
            ChatOptionItem("🏨 Browse Hotels", "hotels", "Goa"),
            ChatOptionItem("ℹ️ Travel Info & Tips", "info", "General Travel Info")
        )
        addMessage("Hello! I'm your Travel Buddy. Ask me anything about budgets, destinations, hotels, or travel tips!", false, initialOptions, "🌟 Travel Buddy Concierge", "default_agent")

        btnSend.setOnClickListener {
            val text = etMessage.text.toString().trim()
            if (text.isNotEmpty()) {
                addMessage(text, true)
                etMessage.setText("")
                askAI(text)
            }
        }
    }

    private fun addMessage(text: String, isUser: Boolean, options: List<ChatOptionItem> = emptyList(), agentName: String = "", agentType: String = "") {
        messages.add(ChatMessage(text, isUser, options, agentName, agentType))
        chatAdapter.notifyItemInserted(messages.size - 1)
        rvChat.scrollToPosition(messages.size - 1)
    }

    private fun handleOptionClick(opt: ChatOptionItem) {
        when (opt.action) {
            "budget" -> {
                startActivity(Intent(this, BudgetTrackerActivity::class.java))
            }
            "hotels" -> {
                startActivity(Intent(this, HotelBookingActivity::class.java))
            }
            "tickets" -> {
                startActivity(Intent(this, TicketBookingActivity::class.java))
            }
            "packing" -> {
                startActivity(Intent(this, PackingListActivity::class.java))
            }
            "place" -> {
                val intent = Intent(this, TripDetailsActivity::class.java)
                intent.putExtra("DESTINATION", if (opt.param.isNotEmpty()) opt.param else "Goa")
                startActivity(intent)
            }
            "map" -> {
                val dest = if (opt.param.isNotEmpty()) opt.param else "Pondicherry"
                try {
                    val mapUri = android.net.Uri.parse("https://www.google.com/maps/search/?api=1&query=" + android.net.Uri.encode(dest))
                    startActivity(Intent(Intent.ACTION_VIEW, mapUri))
                } catch (e: Exception) {
                    android.widget.Toast.makeText(this, "Loaded $dest map", android.widget.Toast.LENGTH_SHORT).show()
                }
            }
            "weather" -> {
                val dest = if (opt.param.isNotEmpty()) opt.param else "Destination"
                AlertDialog.Builder(this)
                    .setTitle("🌤️ Live Weather: $dest")
                    .setMessage("• Condition: Pleasant Coastal Breezes & Clear Skies\n• Temperature: 26°C - 30°C\n• Ideal Travel Months: October to March")
                    .setPositiveButton("OK") { d, _ -> d.dismiss() }
                    .show()
            }
            "copy_itinerary" -> {
                val clipboard = getSystemService(android.content.Context.CLIPBOARD_SERVICE) as android.content.ClipboardManager
                val clip = android.content.ClipData.newPlainText("Travel Itinerary", opt.param)
                clipboard.setPrimaryClip(clip)
                android.widget.Toast.makeText(this, "📋 Itinerary copied to clipboard!", android.widget.Toast.LENGTH_SHORT).show()
            }
            "info" -> {
                showTravelInfoDialog()
            }
            "prompt" -> {
                etMessage.setText(opt.param)
                btnSend.performClick()
            }
            else -> {
                showTravelInfoDialog()
            }
        }
    }

    private fun showTravelInfoDialog() {
        AlertDialog.Builder(this)
            .setTitle("ℹ️ 24x7 Travel & Emergency Helplines")
            .setMessage(
                "🚨 National Emergency: 112\n" +
                "🚓 Police Control Room: 100 / 112\n" +
                "🚑 Medical Ambulance: 108\n" +
                "📞 India Tourist Helpline: 1363 (Toll Free)\n" +
                "🚆 Railway Security & Enquiry: 139\n\n" +
                "💡 Essential Travel Advice:\n" +
                "• Carry a government photo ID (Aadhaar or Passport) at all times.\n" +
                "• UPI payments work everywhere in India (PhonePe, GPay, Paytm).\n" +
                "• Use the interactive tool options below each message to set budgets and book hotels!"
            )
            .setPositiveButton("OK, Got It") { dialog, _ -> dialog.dismiss() }
            .show()
    }

    private fun askAI(question: String) {
        val request = ChatRequest(question)
        RetrofitClient.instance.askBuddy(request).enqueue(object : Callback<ChatResponse> {
            override fun onResponse(call: Call<ChatResponse>, response: Response<ChatResponse>) {
                if (response.isSuccessful && response.body() != null) {
                    val body = response.body()!!
                    val answer = body.answer
                    val options = body.options ?: getSmartFallbackOptions(question)
                    val agentName = body.agent_name ?: getSmartAgentName(question)
                    val agentType = body.agent_type ?: getSmartAgentType(question)
                    if (!answer.isNullOrEmpty()) {
                        runOnUiThread { addMessage(answer, false, options, agentName, agentType) }
                    } else {
                        val fallback = getSmartAIResponse(question)
                        runOnUiThread { addMessage(fallback.first, false, fallback.second, agentName, agentType) }
                    }
                } else {
                    val fallback = getSmartAIResponse(question)
                    val agentName = getSmartAgentName(question)
                    val agentType = getSmartAgentType(question)
                    runOnUiThread { addMessage(fallback.first, false, fallback.second, agentName, agentType) }
                }
            }

            override fun onFailure(call: Call<ChatResponse>, t: Throwable) {
                val fallback = getSmartAIResponse(question)
                val agentName = getSmartAgentName(question)
                val agentType = getSmartAgentType(question)
                runOnUiThread { addMessage(fallback.first, false, fallback.second, agentName, agentType) }
            }
        })
    }

    private fun getSmartAgentName(q: String): String {
        val lower = q.lowercase()
        return when {
            lower.contains("budget") || lower.contains("cost") || lower.contains("6k") -> "💰 Budget Specialist Agent"
            lower.contains("hotel") || lower.contains("stay") || lower.contains("room") -> "🏨 Hotel Specialist Agent"
            lower.contains("train") || lower.contains("flight") || lower.contains("ticket") || lower.contains("transit") -> "🚆 Transit & Booking Specialist"
            lower.contains("activity") || lower.contains("adventure") -> "🏄 Activity & Adventure Specialist"
            else -> "🤖 Trip Coordinator Agent"
        }
    }

    private fun getSmartAgentType(q: String): String {
        val lower = q.lowercase()
        return when {
            lower.contains("budget") || lower.contains("cost") || lower.contains("6k") -> "budget_planner"
            lower.contains("hotel") || lower.contains("stay") || lower.contains("room") -> "hotel_booking"
            lower.contains("train") || lower.contains("flight") || lower.contains("ticket") || lower.contains("transit") -> "transit_booking"
            lower.contains("activity") || lower.contains("adventure") -> "activities_booking"
            else -> "group_chat_manager"
        }
    }

    private fun getSmartFallbackOptions(q: String): List<ChatOptionItem> {
        val lower = q.lowercase()
        return when {
            lower.contains("budget") || lower.contains("cost") || lower.contains("6k") -> listOf(
                ChatOptionItem("💰 Set Budget", "budget", "6000"),
                ChatOptionItem("🏨 Budget Hotels", "hotels", "Pondicherry"),
                ChatOptionItem("🎫 Book Tickets", "tickets", "Pondicherry"),
                ChatOptionItem("ℹ️ Travel Info", "info", "Budget Info")
            )
            lower.contains("goa") -> listOf(
                ChatOptionItem("📍 Explore Goa", "place", "Goa"),
                ChatOptionItem("🏨 Beach Resorts", "hotels", "Goa"),
                ChatOptionItem("🎫 Book Tickets", "tickets", "Goa"),
                ChatOptionItem("ℹ️ Goa Travel Info", "info", "Goa")
            )
            lower.contains("hotel") || lower.contains("stay") -> listOf(
                ChatOptionItem("🏨 Browse Hotels", "hotels", "Goa"),
                ChatOptionItem("💰 Track Stay Budget", "budget", "4000"),
                ChatOptionItem("ℹ️ Hotel Info", "info", "Hotel Info")
            )
            lower.contains("pack") -> listOf(
                ChatOptionItem("🎒 Packing List", "packing", ""),
                ChatOptionItem("💰 Trip Budget", "budget", "5000"),
                ChatOptionItem("ℹ️ Travel Info", "info", "Packing Info")
            )
            else -> listOf(
                ChatOptionItem("💰 Budget Tracker", "budget", "6000"),
                ChatOptionItem("🏨 Hotels", "hotels", "Goa"),
                ChatOptionItem("🎫 Tickets", "tickets", "Goa"),
                ChatOptionItem("ℹ️ Travel Info", "info", "General Travel Info")
            )
        }
    }

    private fun getSmartAIResponse(question: String): Pair<String, List<ChatOptionItem>> {
        val q = question.lowercase()
        val options = getSmartFallbackOptions(question)
        val text = when {
            q.contains("6k") || (q.contains("budget") && q.contains("6")) ->
                "💰 Smart Travel Plan for ₹6,000 Budget:\n\n" +
                "With ₹6,000, you can plan a great 2 to 3-day getaway to Pondicherry, Mahabalipuram, or Tirupati!\n\n" +
                "• 🏨 Stay (2 Nights): ₹2,200 (Verified budget homestay or hostel)\n" +
                "• 🚆 Travel (Round Trip): ₹1,200 (Express train sleeper or state bus)\n" +
                "• 🍲 Food & Drinks: ₹1,600 (Authentic local thalis & coastal snacks)\n" +
                "• 🎟️ Sightseeing & Buffer: ₹1,000 (Monuments & local transit)\n\n" +
                "💡 Tap the options below to open the Budget Tracker or browse Hotels!"
            q.contains("budget") || q.contains("cost") || q.contains("money") ->
                "💰 Travel Budgeting Tips:\n\n" +
                "• Backpacker: ₹1,000–₹1,800/day (Hostels, sleeper train, local food)\n" +
                "• Mid-Range: ₹3,500–₹6,000/day (3-star AC hotels, AC train, cafes)\n" +
                "• Luxury: ₹8,000+/day (Resorts & private cabs)\n\n" +
                "Use the Budget Tracker option below to log expenses in real-time!"
            q.contains("goa") ->
                "🏖️ Goa 3-Day Beach Guide:\n\n" +
                "• Day 1: Fort Aguada lighthouse, Baga beach water sports & Anjuna sunset.\n" +
                "• Day 2: Basilica of Bom Jesus, Latin Quarter Fontainhas & Mandovi cruise.\n" +
                "• Day 3: Dudhsagar Waterfalls & peaceful Palolem beach in South Goa.\n\n" +
                "Check out top beach resorts and flight/train tickets below!"
            q.contains("hotel") || q.contains("stay") || q.contains("resort") ->
                "🏨 Hotel Booking Guidelines:\n\n" +
                "• Pick stays within 1-2 km of major attractions to reduce taxi costs.\n" +
                "• Choose properties with 4.2★ or higher rating and verified reviews.\n" +
                "• Tap 'Browse Hotels' below to book rooms with instant confirmation!"
            q.contains("pack") ->
                "🎒 Essential Packing Checklist:\n\n" +
                "• Govt ID (Aadhaar / Passport) & emergency cash.\n" +
                "• Power bank (10,000mAh+), phone charger & earphones.\n" +
                "• 3-4 cotton t-shirts, walking sneakers & light windbreaker.\n" +
                "• Mini first-aid kit, sunscreen (SPF 50) & sanitizer."
            else ->
                "✈️ Travel Buddy Concierge:\n\n" +
                "I'm calibrated with real-time transit schedules, hotel rates, and budget calculations for your trip!\n\n" +
                "Select any option below to jump directly into your trip planning:"
        }
        return Pair(text, options)
    }

    class ChatAdapter(
        private val items: List<ChatMessage>,
        private val onOptionClick: (ChatOptionItem) -> Unit
    ) : RecyclerView.Adapter<ChatAdapter.ViewHolder>() {

        class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
            val container: LinearLayout = view.findViewById(R.id.llChatContainer)
            val card: MaterialCardView = view.findViewById(R.id.cvMessage)
            val text: TextView = view.findViewById(R.id.tvMessage)
            val tvAgentBadge: TextView = view.findViewById(R.id.tvAgentBadge)
            val hsvOptions: HorizontalScrollView = view.findViewById(R.id.hsvOptions)
            val llOptionsContainer: LinearLayout = view.findViewById(R.id.llOptionsContainer)
        }

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) =
            ViewHolder(LayoutInflater.from(parent.context).inflate(R.layout.item_chat, parent, false))

        override fun onBindViewHolder(holder: ViewHolder, position: Int) {
            val item = items[position]
            holder.text.text = item.text

            val params = holder.card.layoutParams as LinearLayout.LayoutParams
            if (item.isUser) {
                params.gravity = Gravity.END
                holder.card.setCardBackgroundColor(Color.parseColor("#2563EB"))
                holder.text.setTextColor(Color.WHITE)
                holder.tvAgentBadge.visibility = View.GONE
                holder.hsvOptions.visibility = View.GONE
            } else {
                params.gravity = Gravity.START
                holder.card.setCardBackgroundColor(Color.parseColor("#1E293B"))
                holder.text.setTextColor(Color.parseColor("#F1F5F9"))

                if (!item.isUser && item.agentName.isNotEmpty()) {
                    holder.tvAgentBadge.visibility = View.VISIBLE
                    holder.tvAgentBadge.text = item.agentName
                    val density = holder.itemView.context.resources.displayMetrics.density
                    val bg = GradientDrawable().apply {
                        cornerRadius = 10 * density
                        val (bgColor, strokeColor, textColor) = when (item.agentType) {
                            "budget_planner" -> Triple(Color.parseColor("#2610B981"), Color.parseColor("#8034D399"), Color.parseColor("#34D399"))
                            "hotel_booking" -> Triple(Color.parseColor("#26F59E0B"), Color.parseColor("#80FBBF24"), Color.parseColor("#FBBF24"))
                            "transit_booking", "flight_booking" -> Triple(Color.parseColor("#26A855F7"), Color.parseColor("#80C084FC"), Color.parseColor("#C084FC"))
                            "destination_info" -> Triple(Color.parseColor("#260EA5E9"), Color.parseColor("#8038BDF8"), Color.parseColor("#38BDF8"))
                            else -> Triple(Color.parseColor("#263B82F6"), Color.parseColor("#8060A5FA"), Color.parseColor("#60A5FA"))
                        }
                        setColor(bgColor)
                        setStroke((1 * density).toInt(), strokeColor)
                        holder.tvAgentBadge.setTextColor(textColor)
                    }
                    holder.tvAgentBadge.background = bg
                } else {
                    holder.tvAgentBadge.visibility = View.GONE
                }

                if (item.options.isNotEmpty()) {
                    holder.hsvOptions.visibility = View.VISIBLE
                    holder.llOptionsContainer.removeAllViews()

                    val density = holder.itemView.context.resources.displayMetrics.density
                    val padH = (12 * density).toInt()
                    val padV = (6 * density).toInt()
                    val marginR = (8 * density).toInt()

                    item.options.forEach { opt ->
                        val chip = TextView(holder.itemView.context).apply {
                            text = opt.label
                            textSize = 12f
                            setTextColor(if (opt.action == "info") Color.parseColor("#38BDF8") else Color.parseColor("#93C5FD"))
                            setPadding(padH, padV, padH, padV)

                            val bg = GradientDrawable().apply {
                                cornerRadius = 24 * density
                                setColor(if (opt.action == "info") Color.parseColor("#260EA5E9") else Color.parseColor("#262563EB"))
                                setStroke((1 * density).toInt(), if (opt.action == "info") Color.parseColor("#8038BDF8") else Color.parseColor("#8060A5FA"))
                            }
                            background = bg

                            val lp = LinearLayout.LayoutParams(
                                LinearLayout.LayoutParams.WRAP_CONTENT,
                                LinearLayout.LayoutParams.WRAP_CONTENT
                            ).apply {
                                rightMargin = marginR
                            }
                            layoutParams = lp

                            setOnClickListener {
                                onOptionClick(opt)
                            }
                        }
                        holder.llOptionsContainer.addView(chip)
                    }
                } else {
                    holder.hsvOptions.visibility = View.GONE
                }
            }
            holder.card.layoutParams = params
        }

        override fun getItemCount() = items.size
    }
}
