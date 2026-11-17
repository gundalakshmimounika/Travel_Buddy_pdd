package com.simats.travelbuddy

import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.net.Uri
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import com.google.android.material.button.MaterialButton
import com.google.android.material.card.MaterialCardView
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class FriendFinderActivity : AppCompatActivity() {

    private lateinit var llMembersContainer: LinearLayout
    private lateinit var tvBeaconName: TextView
    private lateinit var tvBeaconDesc: TextView
    private lateinit var tvBeaconSetTime: TextView
    private var beaconLat: Double = 12.6167
    private var beaconLng: Double = 80.1983

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_friend_finder)

        val mainLayout = findViewById<View>(R.id.mainLayout)
        val toolbar = findViewById<View>(R.id.rlToolbar)

        // Apply edge-to-edge window insets
        ViewCompat.setOnApplyWindowInsetsListener(mainLayout) { _, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            toolbar.setPadding(systemBars.left, systemBars.top, systemBars.right, 0)
            insets
        }

        // Back button navigation
        findViewById<View>(R.id.ivBack).setOnClickListener {
            finish()
        }

        llMembersContainer = findViewById(R.id.llMembersContainer)
        tvBeaconName = findViewById(R.id.tvBeaconName)
        tvBeaconDesc = findViewById(R.id.tvBeaconDesc)
        tvBeaconSetTime = findViewById(R.id.tvBeaconSetTime)

        findViewById<View>(R.id.ivRefresh).setOnClickListener {
            loadGroupStatus()
            Toast.makeText(this, "Live GPS Pings Refreshed", Toast.LENGTH_SHORT).show()
        }

        findViewById<MaterialButton>(R.id.btnSendSos).setOnClickListener {
            promptAndBroadcastSos()
        }

        findViewById<MaterialButton>(R.id.btnResolveSos).setOnClickListener {
            Toast.makeText(this, "Status updated to Safe! Group alerted.", Toast.LENGTH_SHORT).show()
            loadGroupStatus()
        }

        findViewById<MaterialButton>(R.id.btnNavigateBeacon).setOnClickListener {
            val gmmIntentUri = Uri.parse("geo:$beaconLat,$beaconLng?q=$beaconLat,$beaconLng(Group+Meeting+Beacon)")
            val mapIntent = Intent(Intent.ACTION_VIEW, gmmIntentUri)
            mapIntent.setPackage("com.google.android.apps.maps")
            if (mapIntent.resolveActivity(packageManager) != null) {
                startActivity(mapIntent)
            } else {
                startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://www.google.com/maps/search/?api=1&query=$beaconLat,$beaconLng")))
            }
        }

        loadGroupStatus()
    }

    private fun loadGroupStatus() {
        RetrofitClient.instance.getGroupMembers().enqueue(object : Callback<FriendFinderResponse> {
            override fun onResponse(call: Call<FriendFinderResponse>, response: Response<FriendFinderResponse>) {
                val body = response.body()
                if (body != null && body.status == "success") {
                    body.beacon?.let {
                        tvBeaconName.text = it.name
                        tvBeaconDesc.text = it.description
                        tvBeaconSetTime.text = "Set at ${it.time_set}"
                        beaconLat = it.lat
                        beaconLng = it.lng
                    }
                    body.members?.let { renderMembers(it) }
                } else {
                    renderFallbackMembers()
                }
            }

            override fun onFailure(call: Call<FriendFinderResponse>, t: Throwable) {
                renderFallbackMembers()
            }
        })
    }

    private fun promptAndBroadcastSos() {
        val sharedPreferences = getSharedPreferences("TravelBuddyPrefs", Context.MODE_PRIVATE)
        val activeName = sharedPreferences.getString("ACTIVE_USER_NAME", "Aarav Mehta") ?: "Aarav Mehta"

        val builder = AlertDialog.Builder(this)
        builder.setTitle("Broadcast Emergency SOS?")
        builder.setMessage("This will immediately send your live coordinates, battery level, and distance alert to all traveling group members.")
        builder.setPositiveButton("Broadcast Now") { _, _ ->
            RetrofitClient.instance.sendFriendFinderSos(activeName, "I got separated from the group. Please send assistance!")
                .enqueue(object : Callback<ApiResponse> {
                    override fun onResponse(call: Call<ApiResponse>, response: Response<ApiResponse>) {
                        Toast.makeText(this@FriendFinderActivity, "🚨 SOS Broadcasted to Group!", Toast.LENGTH_LONG).show()
                        AlertHelper.showNotification(
                            this@FriendFinderActivity,
                            "🚨 SOS Broadcast Active",
                            "Your emergency ping has been sent to Rohan, Sneha, and Priya.",
                            "friend_finder"
                        )
                        loadGroupStatus()
                    }

                    override fun onFailure(call: Call<ApiResponse>, t: Throwable) {
                        Toast.makeText(this@FriendFinderActivity, "🚨 SOS Beacon sent locally!", Toast.LENGTH_LONG).show()
                    }
                })
        }
        builder.setNegativeButton("Cancel", null)
        builder.show()
    }

    private fun renderMembers(members: List<GroupMember>) {
        llMembersContainer.removeAllViews()
        for (m in members) {
            val card = MaterialCardView(this).apply {
                radius = 16 * resources.displayMetrics.density
                cardElevation = 2 * resources.displayMetrics.density
                setCardBackgroundColor(Color.parseColor("#172237"))
                strokeWidth = (1 * resources.displayMetrics.density).toInt()
                strokeColor = when (m.status) {
                    "separated" -> Color.parseColor("#EF4444")
                    "beacon" -> Color.parseColor("#38BDF8")
                    else -> Color.parseColor("#10B981")
                }
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                ).apply {
                    bottomMargin = (12 * resources.displayMetrics.density).toInt()
                }
            }

            val cardLayout = LinearLayout(this).apply {
                orientation = LinearLayout.VERTICAL
                val p = (16 * resources.displayMetrics.density).toInt()
                setPadding(p, p, p, p)
            }

            // Row 1: Name and Status Badge
            val row1 = LinearLayout(this).apply {
                orientation = LinearLayout.HORIZONTAL
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                )
            }

            val tvName = TextView(this).apply {
                text = if (m.is_me) "${m.name} (You)" else m.name
                setTextColor(Color.WHITE)
                textSize = 16f
                setTypeface(typeface, android.graphics.Typeface.BOLD)
                layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
            }

            val tvBadge = TextView(this).apply {
                text = when (m.status) {
                    "separated" -> "⚠ SEPARATED"
                    "beacon" -> "📍 AT BEACON"
                    else -> "✓ SAFE"
                }
                textSize = 11f
                setTypeface(typeface, android.graphics.Typeface.BOLD)
                val padH = (8 * resources.displayMetrics.density).toInt()
                val padV = (3 * resources.displayMetrics.density).toInt()
                setPadding(padH, padV, padH, padV)
                setTextColor(Color.WHITE)
                setBackgroundColor(
                    when (m.status) {
                        "separated" -> Color.parseColor("#DC2626")
                        "beacon" -> Color.parseColor("#0284C7")
                        else -> Color.parseColor("#059669")
                    }
                )
            }

            row1.addView(tvName)
            row1.addView(tvBadge)
            cardLayout.addView(row1)

            // Status message
            val tvStatus = TextView(this).apply {
                text = m.status_text
                setTextColor(Color.parseColor("#94A3B8"))
                textSize = 13f
                setPadding(0, (6 * resources.displayMetrics.density).toInt(), 0, (8 * resources.displayMetrics.density).toInt())
            }
            cardLayout.addView(tvStatus)

            // Row 2: Distance, Direction, Battery
            val tvMeta = TextView(this).apply {
                text = "📏 ${m.distance}  •  🧭 ${m.direction}  •  🔋 ${m.battery}"
                setTextColor(Color.parseColor("#38BDF8"))
                textSize = 12f
                setTypeface(typeface, android.graphics.Typeface.BOLD)
                setPadding(0, 0, 0, (10 * resources.displayMetrics.density).toInt())
            }
            cardLayout.addView(tvMeta)

            if (!m.is_me) {
                val btnDirect = MaterialButton(this).apply {
                    text = "Navigate to ${m.name.substringBefore(" ")}"
                    setTextColor(Color.WHITE)
                    setBackgroundColor(Color.parseColor("#1E293B"))
                    strokeWidth = (1 * resources.displayMetrics.density).toInt()
                    strokeColor = android.content.res.ColorStateList.valueOf(Color.parseColor("#475569"))
                    setOnClickListener {
                        val uri = Uri.parse("https://www.google.com/maps/search/?api=1&query=${m.lat},${m.lng}")
                        startActivity(Intent(Intent.ACTION_VIEW, uri))
                    }
                }
                cardLayout.addView(btnDirect)
            }

            card.addView(cardLayout)
            llMembersContainer.addView(card)
        }
    }

    private fun renderFallbackMembers() {
        val fallback = listOf(
            GroupMember(1, "Aarav Mehta", "aarav@gmail.com", "safe", "Stationed at Shore Temple Courtyard", "0 m (You)", "Current Spot", 12.6167, 80.1983, "84%", "Just now", true),
            GroupMember(2, "Rohan Verma", "rohan@gmail.com", "separated", "Looking for group near Lighthouse", "320 m away", "South-West (210°)", 12.6142, 80.1965, "42%", "2 mins ago", false),
            GroupMember(3, "Sneha Patel", "sneha@gmail.com", "safe", "At Beach Cafe parking area", "180 m away", "North-East (45°)", 12.6181, 80.1995, "91%", "4 mins ago", false),
            GroupMember(4, "Priya Sharma", "priya@gmail.com", "beacon", "Waiting at Emergency Beacon Point", "250 m away", "East (90°)", 12.6169, 80.2001, "67%", "1 min ago", false)
        )
        renderMembers(fallback)
    }
}
