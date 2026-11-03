package com.simats.travelbuddy

import android.os.Bundle
import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.card.MaterialCardView
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

data class ChatMessage(val text: String, val isUser: Boolean)

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

        chatAdapter = ChatAdapter(messages)
        rvChat.adapter = chatAdapter

        // Initial Greeting
        addMessage("Hello! I'm your Travel Buddy. Ask me anything about destinations, hotels, or travel tips!", false)

        btnSend.setOnClickListener {
            val text = etMessage.text.toString().trim()
            if (text.isNotEmpty()) {
                addMessage(text, true)
                etMessage.setText("")
                askAI(text)
            }
        }
    }

    private fun addMessage(text: String, isUser: Boolean) {
        messages.add(ChatMessage(text, isUser))
        chatAdapter.notifyItemInserted(messages.size - 1)
        rvChat.scrollToPosition(messages.size - 1)
    }

    private fun askAI(question: String) {
        val request = ChatRequest(question)
        RetrofitClient.instance.askBuddy(request).enqueue(object : Callback<ChatResponse> {
            override fun onResponse(call: Call<ChatResponse>, response: Response<ChatResponse>) {
                if (response.isSuccessful) {
                    val answer = response.body()?.answer
                    if (!answer.isNullOrEmpty()) {
                        runOnUiThread { addMessage(answer, false) }
                    } else {
                        runOnUiThread { addMessage(getSmartAIResponse(question), false) }
                    }
                } else {
                    runOnUiThread { addMessage(getSmartAIResponse(question), false) }
                }
            }

            override fun onFailure(call: Call<ChatResponse>, t: Throwable) {
                runOnUiThread { addMessage(getSmartAIResponse(question), false) }
            }
        })
    }

    private fun getSmartAIResponse(question: String): String {
        val q = question.lowercase()
        return when {
            q.contains("bali") || q.contains("indonesia") -> "Bali is a tropical paradise known for its forested volcanic mountains, iconic rice paddies, beaches, and coral reefs. Best time to visit is during the dry season from April to October."
            q.contains("hotel") || q.contains("stay") || q.contains("resort") -> "For great stays, I recommend checking out beachfront resorts in Seminyak, luxury villas in Ubud, or cozy boutique hotels. You can browse them right in our Hotel Booking section!"
            q.contains("food") || q.contains("eat") || q.contains("restaurant") -> "You must try local delicacies like Nasi Goreng, Rendang, and Satay. There are amazing culinary spots ranging from local warungs to fine dining beach clubs."
            q.contains("budget") || q.contains("cost") || q.contains("money") -> "A trip can range from $30/day for budget travelers to $150+/day for luxury experiences. Use our Budget Tracker in the app to plan your expenses!"
            q.contains("flight") || q.contains("ticket") || q.contains("transport") -> "You can easily compare and book flights or transport options using our Ticket Booking feature!"
            q.contains("weather") || q.contains("climate") -> "The weather is generally warm and tropical. You can check live hourly and daily forecasts in the Weather section of Travel Buddy."
            else -> "That's a wonderful travel question! Travel Buddy recommends planning your itinerary in advance, keeping emergency contacts handy, and exploring local culture. Let me know if you need help with hotels, weather, or trip planning!"
        }
    }

    class ChatAdapter(private val items: List<ChatMessage>) : RecyclerView.Adapter<ChatAdapter.ViewHolder>() {
        class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
            val container: LinearLayout = view.findViewById(R.id.llChatContainer)
            val card: MaterialCardView = view.findViewById(R.id.cvMessage)
            val text: TextView = view.findViewById(R.id.tvMessage)
        }

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) =
            ViewHolder(LayoutInflater.from(parent.context).inflate(R.layout.item_chat, parent, false))

        override fun onBindViewHolder(holder: ViewHolder, position: Int) {
            val item = items[position]
            holder.text.text = item.text
            
            val params = holder.card.layoutParams as LinearLayout.LayoutParams
            if (item.isUser) {
                params.gravity = Gravity.END
                holder.card.setCardBackgroundColor(android.graphics.Color.parseColor("#3B82F6")) // Blue
                holder.text.setTextColor(android.graphics.Color.WHITE)
            } else {
                params.gravity = Gravity.START
                holder.card.setCardBackgroundColor(android.graphics.Color.parseColor("#2D3748")) // Dark gray
                holder.text.setTextColor(android.graphics.Color.WHITE)
            }
            holder.card.layoutParams = params
        }

        override fun getItemCount() = items.size
    }
}
