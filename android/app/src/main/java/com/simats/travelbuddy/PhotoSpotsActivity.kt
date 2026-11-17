package com.simats.travelbuddy

import android.content.Intent
import android.content.res.ColorStateList
import android.graphics.Color
import android.net.Uri
import android.os.Bundle
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
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

class PhotoSpotsActivity : AppCompatActivity() {

    private lateinit var btnChipAll: MaterialButton
    private lateinit var btnChipMahabali: MaterialButton
    private lateinit var btnChipPondy: MaterialButton
    private lateinit var btnChipOoty: MaterialButton
    private lateinit var tvResultsCount: TextView
    private lateinit var llSpotsContainer: LinearLayout

    private var selectedDestination: String = "All"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_photo_spots)

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

        btnChipAll = findViewById(R.id.btnChipAll)
        btnChipMahabali = findViewById(R.id.btnChipMahabali)
        btnChipPondy = findViewById(R.id.btnChipPondy)
        btnChipOoty = findViewById(R.id.btnChipOoty)
        tvResultsCount = findViewById(R.id.tvResultsCount)
        llSpotsContainer = findViewById(R.id.llSpotsContainer)

        btnChipAll.setOnClickListener { selectFilter("All") }
        btnChipMahabali.setOnClickListener { selectFilter("Mahabalipuram") }
        btnChipPondy.setOnClickListener { selectFilter("Pondicherry") }
        btnChipOoty.setOnClickListener { selectFilter("Ooty") }

        loadPhotoSpots()
    }

    private fun selectFilter(dest: String) {
        selectedDestination = dest
        val activeBg = Color.parseColor("#F59E0B")
        val inactiveBg = Color.parseColor("#1E293B")
        val activeText = Color.BLACK
        val inactiveText = Color.parseColor("#E2E8F0")

        fun updateChip(btn: MaterialButton, isSelected: Boolean) {
            btn.backgroundTintList = ColorStateList.valueOf(if (isSelected) activeBg else inactiveBg)
            btn.setTextColor(if (isSelected) activeText else inactiveText)
        }

        updateChip(btnChipAll, dest == "All")
        updateChip(btnChipMahabali, dest == "Mahabalipuram")
        updateChip(btnChipPondy, dest == "Pondicherry")
        updateChip(btnChipOoty, dest == "Ooty")

        loadPhotoSpots()
    }

    private fun loadPhotoSpots() {
        RetrofitClient.instance.getPhotoSpots(selectedDestination).enqueue(object : Callback<PhotoSpotsResponse> {
            override fun onResponse(call: Call<PhotoSpotsResponse>, response: Response<PhotoSpotsResponse>) {
                val body = response.body()
                if (response.isSuccessful && body != null && body.spots != null) {
                    tvResultsCount.text = "Featured Spots (${body.spots.size} locations)"
                    renderSpots(body.spots)
                } else {
                    renderFallbackSpots()
                }
            }

            override fun onFailure(call: Call<PhotoSpotsResponse>, t: Throwable) {
                renderFallbackSpots()
            }
        })
    }

    private fun renderSpots(spots: List<PhotoSpot>) {
        llSpotsContainer.removeAllViews()

        for (spot in spots) {
            val card = MaterialCardView(this).apply {
                layoutParams = LinearLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.WRAP_CONTENT
                ).apply {
                    setMargins(0, 0, 0, 20)
                }
                radius = 24f
                cardElevation = 2f
                strokeWidth = 1
                strokeColor = Color.parseColor("#334155")
                setCardBackgroundColor(Color.parseColor("#1E293B"))
            }

            val cardContent = LinearLayout(this).apply {
                orientation = LinearLayout.VERTICAL
            }

            // Image Preview
            val ivImage = ImageView(this).apply {
                layoutParams = LinearLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    420
                )
                scaleType = ImageView.ScaleType.CENTER_CROP
                val imgRes = when {
                    "mahabali" in spot.image.lowercase() -> R.drawable.img_mahabali
                    "pondy" in spot.image.lowercase() -> R.drawable.img_pondy
                    "ooty" in spot.image.lowercase() -> R.drawable.img_ooty
                    "madurai" in spot.image.lowercase() -> R.drawable.img_madurai
                    else -> R.drawable.img_santorini
                }
                setImageResource(imgRes)
            }
            cardContent.addView(ivImage)

            // Details Container
            val detailsLayout = LinearLayout(this).apply {
                orientation = LinearLayout.VERTICAL
                setPadding(24, 20, 24, 24)
            }

            // Badges row: Destination & Lighting
            val badgesRow = LinearLayout(this).apply {
                orientation = LinearLayout.HORIZONTAL
            }

            val destBadge = TextView(this).apply {
                text = spot.destination.uppercase()
                setTextColor(Color.WHITE)
                textSize = 10f
                paint.isFakeBoldText = true
                setBackgroundColor(Color.parseColor("#0284C7"))
                setPadding(14, 4, 14, 4)
            }
            badgesRow.addView(destBadge)

            val crowdBadge = TextView(this).apply {
                text = "  ${spot.crowd_level}"
                setTextColor(Color.parseColor("#FBBF24"))
                textSize = 11f
                paint.isFakeBoldText = true
            }
            badgesRow.addView(crowdBadge)
            detailsLayout.addView(badgesRow)

            // Spot Title
            val tvTitle = TextView(this).apply {
                text = spot.title
                setTextColor(Color.WHITE)
                textSize = 17f
                paint.isFakeBoldText = true
                setPadding(0, 10, 0, 4)
            }
            detailsLayout.addView(tvTitle)

            // Best Time & Lighting
            val tvTime = TextView(this).apply {
                text = "⏰ Best Time: ${spot.best_time}\n☀️ Lighting: ${spot.lighting}"
                setTextColor(Color.parseColor("#38BDF8"))
                textSize = 12f
                setLineSpacing(4f, 1.1f)
            }
            detailsLayout.addView(tvTime)

            // Optimal Composition & Angle
            val tvAngle = TextView(this).apply {
                text = "📐 AI Framing Angle:\n${spot.optimal_angle}"
                setTextColor(Color.parseColor("#E2E8F0"))
                textSize = 13f
                setPadding(0, 10, 0, 0)
                setLineSpacing(4f, 1.1f)
            }
            detailsLayout.addView(tvAngle)

            // Camera Settings Card
            val settingsCard = LinearLayout(this).apply {
                orientation = LinearLayout.VERTICAL
                setBackgroundColor(Color.parseColor("#0F172A"))
                setPadding(16, 12, 16, 12)
                layoutParams = LinearLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.WRAP_CONTENT
                ).apply {
                    setMargins(0, 12, 0, 12)
                }
            }

            val tvSettings = TextView(this).apply {
                text = "⚙️ Pro Camera Settings: ${spot.camera_settings}"
                setTextColor(Color.parseColor("#F59E0B"))
                textSize = 12f
                paint.isFakeBoldText = true
            }
            settingsCard.addView(tvSettings)

            val tvTip = TextView(this).apply {
                text = "💡 AI Pro Tip: ${spot.ai_tip}"
                setTextColor(Color.parseColor("#CBD5E1"))
                textSize = 12f
                setPadding(0, 4, 0, 0)
            }
            settingsCard.addView(tvTip)
            detailsLayout.addView(settingsCard)

            // Action Row: Coordinates & Navigate Button
            val actionRow = LinearLayout(this).apply {
                orientation = LinearLayout.HORIZONTAL
                layoutParams = LinearLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.WRAP_CONTENT
                )
            }

            val tvCoords = TextView(this).apply {
                text = "📍 ${spot.coordinates}"
                setTextColor(Color.parseColor("#94A3B8"))
                textSize = 11f
                layoutParams = LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f)
            }
            actionRow.addView(tvCoords)

            val btnMaps = MaterialButton(this).apply {
                text = "Directions"
                textSize = 12f
                backgroundTintList = ColorStateList.valueOf(Color.parseColor("#2563EB"))
                setTextColor(Color.WHITE)
                cornerRadius = 16
                setOnClickListener {
                    openGoogleMaps(spot.coordinates, spot.title)
                }
            }
            actionRow.addView(btnMaps)
            detailsLayout.addView(actionRow)

            cardContent.addView(detailsLayout)
            card.addView(cardContent)
            llSpotsContainer.addView(card)
        }
    }

    private fun openGoogleMaps(coordinates: String, title: String) {
        val clean = coordinates.replace("°", "").replace("N", "").replace("E", "").replace(" ", "")
        val uri = Uri.parse("https://www.google.com/maps/search/?api=1&query=${Uri.encode(clean)}")
        val intent = Intent(Intent.ACTION_VIEW, uri)
        try {
            startActivity(intent)
        } catch (e: Exception) {
            Toast.makeText(this, "Coordinates: $coordinates ($title)", Toast.LENGTH_LONG).show()
        }
    }

    private fun renderFallbackSpots() {
        val fallback = listOf(
            PhotoSpot(
                1, "Shore Temple Sunrise Arch", "Mahabalipuram", "assets/img_mahabali.png",
                "6:00 AM - 6:45 AM (Golden Hour)", "Warm Low Golden Light with Ocean Fog",
                "Low at Sunrise", "12.6167° N, 80.1983° E",
                "Low-angle wide shot (16-24mm) with the 7th-century granite spire framed against pink skies.",
                "f/8.0, 1/320s, ISO 100", "Squat near the tidal pool on eastern edge for mirror water reflections!"
            ),
            PhotoSpot(
                2, "French Quarter Pastel Bougainvillea Villa", "Pondicherry", "assets/img_pondy.png",
                "7:00 AM - 8:30 AM (Soft Morning Light)", "Gentle directional sunlight",
                "Very Quiet", "11.9338° N, 79.8359° E",
                "Eye-level horizontal composition capturing mustard yellow colonial wall and vibrant bougainvillea flowers.",
                "f/4.0, 1/400s, ISO 100", "Wear white or linen attire for high aesthetic contrast!"
            )
        )
        tvResultsCount.text = "Featured Spots (${fallback.size} locations)"
        renderSpots(fallback)
    }
}
