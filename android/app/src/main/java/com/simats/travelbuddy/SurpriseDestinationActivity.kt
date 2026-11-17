package com.simats.travelbuddy

import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import android.os.CountDownTimer
import android.view.View
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import com.google.android.material.button.MaterialButton
import com.google.android.material.card.MaterialCardView
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class SurpriseDestinationActivity : AppCompatActivity() {

    private lateinit var tvCodeName: TextView
    private lateinit var tvVibeBudget: TextView
    private lateinit var tvCountdown: TextView
    private lateinit var btnRevealNow: MaterialButton
    private lateinit var cvRevealedCard: MaterialCardView
    private lateinit var tvRevealedDestination: TextView
    private lateinit var tvRevealedTagline: TextView
    private lateinit var tvRevealedDetails: TextView
    private lateinit var btnPlanTrip: MaterialButton
    private lateinit var llCluesContainer: LinearLayout

    private var countDownTimer: CountDownTimer? = null
    private var revealedDestName: String = "Mahabalipuram"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_surprise_destination)

        val mainLayout = findViewById<View>(R.id.mainLayout)
        val toolbar = findViewById<View>(R.id.rlToolbar)

        // Apply edge-to-edge window insets
        ViewCompat.setOnApplyWindowInsetsListener(mainLayout) { _, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            toolbar.setPadding(systemBars.left, systemBars.top, systemBars.right, 0)
            insets
        }

        // Prominent Back Button
        findViewById<View>(R.id.ivBack).setOnClickListener {
            finish()
        }

        tvCodeName = findViewById(R.id.tvCodeName)
        tvVibeBudget = findViewById(R.id.tvVibeBudget)
        tvCountdown = findViewById(R.id.tvCountdown)
        btnRevealNow = findViewById(R.id.btnRevealNow)
        cvRevealedCard = findViewById(R.id.cvRevealedCard)
        tvRevealedDestination = findViewById(R.id.tvRevealedDestination)
        tvRevealedTagline = findViewById(R.id.tvRevealedTagline)
        tvRevealedDetails = findViewById(R.id.tvRevealedDetails)
        btnPlanTrip = findViewById(R.id.btnPlanTrip)
        llCluesContainer = findViewById(R.id.llCluesContainer)

        btnRevealNow.setOnClickListener {
            revealMysteryDestination()
        }

        btnPlanTrip.setOnClickListener {
            val intent = Intent(this, TripPlannerActivity::class.java).apply {
                putExtra("DESTINATION", revealedDestName)
            }
            startActivity(intent)
        }

        startCountdown(2 * 86400000L + 18 * 3600000L + 42 * 60000L)
        loadMysteryData()
    }

    private fun startCountdown(millis: Long) {
        countDownTimer?.cancel()
        countDownTimer = object : CountDownTimer(millis, 1000) {
            override fun onTick(millisUntilFinished: Long) {
                val days = millisUntilFinished / 86400000
                val hours = (millisUntilFinished % 86400000) / 3600000
                val mins = (millisUntilFinished % 3600000) / 60000
                val secs = (millisUntilFinished % 60000) / 1000
                tvCountdown.text = String.format("%02dd : %02dh : %02dm : %02ds", days, hours, mins, secs)
            }

            override fun onFinish() {
                tvCountdown.text = "00d : 00h : 00m : 00s — READY!"
            }
        }.start()
    }

    private fun loadMysteryData() {
        RetrofitClient.instance.getMysteryTrip().enqueue(object : Callback<SurpriseDestinationResponse> {
            override fun onResponse(call: Call<SurpriseDestinationResponse>, response: Response<SurpriseDestinationResponse>) {
                val pkg = response.body()?.packageData
                if (pkg != null) {
                    tvCodeName.text = pkg.code_name
                    tvVibeBudget.text = "Vibe: ${pkg.vibe}  •  Tier: ${pkg.budget_tier}"
                    pkg.clues?.let { renderClues(it) }
                } else {
                    renderFallbackClues()
                }
            }

            override fun onFailure(call: Call<SurpriseDestinationResponse>, t: Throwable) {
                renderFallbackClues()
            }
        })
    }

    private fun revealMysteryDestination() {
        RetrofitClient.instance.revealMysteryTrip().enqueue(object : Callback<SurpriseDestinationResponse> {
            override fun onResponse(call: Call<SurpriseDestinationResponse>, response: Response<SurpriseDestinationResponse>) {
                showRevealedState(response.body()?.packageData?.revealed_details)
            }

            override fun onFailure(call: Call<SurpriseDestinationResponse>, t: Throwable) {
                showRevealedState(null)
            }
        })
    }

    private fun showRevealedState(details: RevealedDetails?) {
        cvRevealedCard.visibility = View.VISIBLE
        btnRevealNow.visibility = View.GONE
        tvCountdown.text = "REVEALED!"
        tvCountdown.setTextColor(Color.parseColor("#34D399"))

        val destination = details?.destination ?: "Mahabalipuram, Tamil Nadu"
        revealedDestName = "Mahabalipuram"
        tvRevealedDestination.text = destination
        tvRevealedTagline.text = details?.tagline ?: "The Monolithic Shore Wonder of South India"
        
        val detailsText = StringBuilder()
        detailsText.append("✈ Transit: ${details?.flight_duration ?: "1.5h flight + 1h East Coast scenic drive"}\n\n")
        detailsText.append("🏨 Stay: ${details?.recommended_stay ?: "Radisson Blu Resort Temple Bay"}\n\n")
        detailsText.append("💰 Estimated Budget: ${details?.budget_estimate ?: "₹9,500 per traveler"}\n\n")
        detailsText.append("📸 AI Photo Spot: ${details?.best_photospot ?: "Sunrise silhouette against the Shore Temple spires"}")
        tvRevealedDetails.text = detailsText.toString()

        Toast.makeText(this, "🎉 Destination Unlocked: $destination", Toast.LENGTH_LONG).show()

        AlertHelper.showNotification(
            this,
            "🎉 Surprise Trip Unlocked!",
            "Your secret destination is $destination! Start packing!",
            "surprise"
        )
    }

    private fun renderClues(clues: List<MysteryClue>) {
        llCluesContainer.removeAllViews()
        for (c in clues) {
            val card = MaterialCardView(this).apply {
                radius = 16 * resources.displayMetrics.density
                cardElevation = 2 * resources.displayMetrics.density
                setCardBackgroundColor(Color.parseColor("#1E293B"))
                strokeWidth = (1 * resources.displayMetrics.density).toInt()
                strokeColor = Color.parseColor("#334155")
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                ).apply {
                    bottomMargin = (12 * resources.displayMetrics.density).toInt()
                }
            }

            val content = LinearLayout(this).apply {
                orientation = LinearLayout.VERTICAL
                val p = (16 * resources.displayMetrics.density).toInt()
                setPadding(p, p, p, p)
            }

            val topRow = LinearLayout(this).apply {
                orientation = LinearLayout.HORIZONTAL
            }

            val tvTitle = TextView(this).apply {
                text = "Clue #${c.stage}: ${c.title}"
                setTextColor(Color.WHITE)
                textSize = 15f
                setTypeface(typeface, android.graphics.Typeface.BOLD)
                layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
            }

            val tvBadge = TextView(this).apply {
                text = c.badge
                setTextColor(Color.parseColor("#A78BFA"))
                textSize = 11f
                setTypeface(typeface, android.graphics.Typeface.BOLD)
                setBackgroundColor(Color.parseColor("#2E1065"))
                val padH = (8 * resources.displayMetrics.density).toInt()
                val padV = (3 * resources.displayMetrics.density).toInt()
                setPadding(padH, padV, padH, padV)
            }

            topRow.addView(tvTitle)
            topRow.addView(tvBadge)
            content.addView(topRow)

            val tvHint = TextView(this).apply {
                text = c.hint
                setTextColor(Color.parseColor("#CBD5E1"))
                textSize = 13f
                setLineSpacing(3 * resources.displayMetrics.density, 1f)
                setPadding(0, (8 * resources.displayMetrics.density).toInt(), 0, 0)
            }
            content.addView(tvHint)

            card.addView(content)
            llCluesContainer.addView(card)
        }
    }

    private fun renderFallbackClues() {
        val fallback = listOf(
            MysteryClue(1, "Climate Forecast", "Weather", "Expect pleasant 27°C with ocean breeze and high humidity. Light cotton attire is recommended.", true),
            MysteryClue(2, "Packing Essentials", "Luggage", "Pack UV sunglasses, slip-on sandals, swimwear, but make room for sacred temple decorum.", true),
            MysteryClue(3, "Culinary Hint", "Gastronomy", "Famous for fresh catch grilled fish on banana leaves, roasted filter coffee, and golden crispy dosas.", true),
            MysteryClue(4, "Historical Enigma", "Landmark", "Ancient monolithic rock-cut cave shrines and temples dating back to the 7th-century Pallava dynasty.", true)
        )
        renderClues(fallback)
    }

    override fun onDestroy() {
        super.onDestroy()
        countDownTimer?.cancel()
    }
}
