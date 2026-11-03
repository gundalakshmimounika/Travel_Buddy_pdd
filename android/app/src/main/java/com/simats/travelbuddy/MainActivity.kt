package com.simats.travelbuddy

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.location.Geocoder
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.view.View
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.ImageView
import android.widget.TextView
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.google.android.gms.tasks.CancellationTokenSource
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL
import java.util.Locale
import kotlin.concurrent.thread

@Suppress("DEPRECATION")
class MainActivity : AppCompatActivity() {

    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private lateinit var tvLocationName: TextView
    private lateinit var tvLocationStatus: TextView
    private lateinit var tvWeatherLocation: TextView
    private lateinit var tvWeatherTemp: TextView
    private lateinit var tvWeatherCondition: TextView
    private lateinit var webViewMap: WebView

    // Default to Nellore, Andhra Pradesh coordinates
    private var currentLat: Double = 14.4426
    private var currentLng: Double = 79.9865
    private var currentCity: String = "Nellore"
    private var currentRegion: String = "Andhra Pradesh, India"
    private var isMapLoaded = false

    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        if (permissions[Manifest.permission.ACCESS_FINE_LOCATION] == true ||
            permissions[Manifest.permission.ACCESS_COARSE_LOCATION] == true
        ) {
            getCurrentLocation()
        } else {
            // Permission denied: Use IP-based geolocation coordinates
            fetchLocationByIp()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_main)

        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)
        tvLocationName = findViewById(R.id.tvUpcomingTitle)
        tvLocationStatus = findViewById(R.id.tvUpcomingDates)
        tvWeatherLocation = findViewById(R.id.tvWeatherLocation)
        tvWeatherTemp = findViewById(R.id.tvWeatherTemp)
        tvWeatherCondition = findViewById(R.id.tvWeatherCondition)
        webViewMap = findViewById(R.id.webViewMap)

        setupMapWebView()

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.scrollView)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, 0)
            insets
        }

        setupNavigation()

        // Fetch accurate location via IP address immediately, then cross-reference with GPS
        fetchLocationByIp()
        checkLocationPermissionAndFetch()

        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.TIRAMISU) {
            if (ActivityCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.POST_NOTIFICATIONS), 101)
            }
        }
    }

    private fun setupMapWebView() {
        webViewMap.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            setSupportZoom(true)
            builtInZoomControls = true
            displayZoomControls = false
            mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            loadWithOverviewMode = true
            useWideViewPort = true
            cacheMode = WebSettings.LOAD_DEFAULT
            userAgentString = "Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36"
        }
        webViewMap.setOnTouchListener { v, _ ->
            v.parent.requestDisallowInterceptTouchEvent(true)
            false
        }
        webViewMap.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                return false // Keep inside WebView
            }
        }
        loadGoogleMap(currentLat, currentLng)
    }

    /**
     * Loads Google Maps embed with exact latitude and longitude coordinates
     */
    private fun loadGoogleMap(lat: Double, lng: Double) {
        currentLat = lat
        currentLng = lng
        val gmapUrl = "https://maps.google.com/maps?q=$lat,$lng&t=&z=15&ie=UTF8&iwloc=&output=embed"
        val mapHtml = """
            <!DOCTYPE html>
            <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    html, body { width: 100%; height: 100%; background: #0f172a; overflow: hidden; }
                    iframe { width: 100%; height: 100%; border: 0; display: block; }
                </style>
            </head>
            <body>
                <iframe 
                    id="gmap" 
                    src="$gmapUrl" 
                    frameborder="0" 
                    allowfullscreen>
                </iframe>
            </body>
            </html>
        """.trimIndent()

        runOnUiThread {
            webViewMap.loadDataWithBaseURL("https://maps.google.com", mapHtml, "text/html", "UTF-8", null)
            isMapLoaded = true
        }
    }

    /**
     * Accurately resolves location coordinates using device public IP address.
     * Eliminates false Mountain View emulator mock locations.
     */
    private fun fetchLocationByIp(onSuccess: ((Double, Double, String, String) -> Unit)? = null) {
        thread {
            var resolvedLat = 14.4426
            var resolvedLng = 79.9865
            var resolvedCity = "Nellore"
            var resolvedRegion = "Andhra Pradesh, India"
            var success = false

            // Primary IP Geolocation endpoint (ip-api.com)
            try {
                val url = URL("http://ip-api.com/json")
                val conn = url.openConnection() as HttpURLConnection
                conn.connectTimeout = 4000
                conn.readTimeout = 4000
                conn.setRequestProperty("User-Agent", "TravelBuddyApp/1.0")

                if (conn.responseCode == 200) {
                    val reader = BufferedReader(InputStreamReader(conn.inputStream))
                    val response = reader.readText()
                    reader.close()

                    val json = JSONObject(response)
                    if (json.optString("status") == "success") {
                        resolvedLat = json.optDouble("lat", 14.4426)
                        resolvedLng = json.optDouble("lon", 79.9865)
                        resolvedCity = json.optString("city", "Nellore")
                        val regName = json.optString("regionName", "Andhra Pradesh")
                        val country = json.optString("country", "India")
                        resolvedRegion = if (regName.isNotEmpty()) "$regName, $country" else country
                        success = true
                        Log.d("TravelBuddy", "IP Geolocation resolved: $resolvedCity ($resolvedLat, $resolvedLng)")
                    }
                }
            } catch (e: Exception) {
                Log.w("TravelBuddy", "Primary IP Geolocation failed: ${e.message}")
            }

            // Secondary IP Geolocation fallback (ipapi.co)
            if (!success) {
                try {
                    val url = URL("https://ipapi.co/json/")
                    val conn = url.openConnection() as HttpURLConnection
                    conn.connectTimeout = 4000
                    conn.readTimeout = 4000
                    conn.setRequestProperty("User-Agent", "Mozilla/5.0")

                    if (conn.responseCode == 200) {
                        val reader = BufferedReader(InputStreamReader(conn.inputStream))
                        val response = reader.readText()
                        reader.close()

                        val json = JSONObject(response)
                        resolvedLat = json.optDouble("latitude", 14.4426)
                        resolvedLng = json.optDouble("longitude", 79.9865)
                        resolvedCity = json.optString("city", "Nellore")
                        val reg = json.optString("region", "Andhra Pradesh")
                        val country = json.optString("country_name", "India")
                        resolvedRegion = if (reg.isNotEmpty()) "$reg, $country" else country
                        success = true
                    }
                } catch (e: Exception) {
                    Log.w("TravelBuddy", "Secondary IP Geolocation failed: ${e.message}")
                }
            }

            runOnUiThread {
                handleLocation(resolvedLat, resolvedLng, resolvedCity, resolvedRegion)
                onSuccess?.invoke(resolvedLat, resolvedLng, resolvedCity, resolvedRegion)
            }
        }
    }

    private fun checkLocationPermissionAndFetch() {
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED &&
            ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED
        ) {
            requestPermissionLauncher.launch(
                arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION)
            )
        } else {
            getCurrentLocation()
        }
    }

    private fun getCurrentLocation() {
        try {
            if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED ||
                ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED
            ) {
                fusedLocationClient.lastLocation.addOnSuccessListener { location ->
                    if (location != null) {
                        // Check if Android Emulator mock GPS default (Mountain View, CA: 37.4220, -122.0841)
                        val isEmulatorMock = (Math.abs(location.latitude - 37.422) < 0.05 && Math.abs(location.longitude - (-122.084)) < 0.05)
                        if (isEmulatorMock) {
                            Log.d("TravelBuddy", "Mock emulator Mountain View GPS ignored. Using IP coordinates.")
                            fetchLocationByIp()
                        } else {
                            handleGpsLocation(location.latitude, location.longitude)
                        }
                    } else {
                        fetchLocationByIp()
                    }
                }.addOnFailureListener {
                    fetchLocationByIp()
                }

                fusedLocationClient.getCurrentLocation(Priority.PRIORITY_HIGH_ACCURACY, CancellationTokenSource().token)
                    .addOnSuccessListener { location ->
                        if (location != null) {
                            val isEmulatorMock = (Math.abs(location.latitude - 37.422) < 0.05 && Math.abs(location.longitude - (-122.084)) < 0.05)
                            if (!isEmulatorMock) {
                                handleGpsLocation(location.latitude, location.longitude)
                            }
                        }
                    }
            } else {
                fetchLocationByIp()
            }
        } catch (e: SecurityException) {
            e.printStackTrace()
            fetchLocationByIp()
        }
    }

    private fun handleGpsLocation(lat: Double, lng: Double) {
        try {
            val geocoder = Geocoder(this, Locale.getDefault())
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.TIRAMISU) {
                geocoder.getFromLocation(lat, lng, 1) { addresses ->
                    if (addresses.isNotEmpty()) {
                        val address = addresses[0]
                        val city = address.locality ?: address.subAdminArea ?: address.adminArea ?: "Nellore"
                        val country = address.countryName ?: "India"
                        val state = address.adminArea ?: ""
                        val region = if (state.isNotEmpty()) "$state, $country" else country
                        runOnUiThread {
                            handleLocation(lat, lng, city, region)
                        }
                    } else {
                        fetchLocationByIp()
                    }
                }
            } else {
                @Suppress("DEPRECATION")
                val addresses = geocoder.getFromLocation(lat, lng, 1)
                if (addresses != null && addresses.isNotEmpty()) {
                    val address = addresses[0]
                    val city = address.locality ?: address.subAdminArea ?: address.adminArea ?: "Nellore"
                    val country = address.countryName ?: "India"
                    val state = address.adminArea ?: ""
                    val region = if (state.isNotEmpty()) "$state, $country" else country
                    handleLocation(lat, lng, city, region)
                } else {
                    fetchLocationByIp()
                }
            }
        } catch (e: Exception) {
            fetchLocationByIp()
        }
    }

    private fun handleLocation(lat: Double, lng: Double, city: String, region: String) {
        currentLat = lat
        currentLng = lng
        currentCity = city
        currentRegion = region

        runOnUiThread {
            tvLocationName.text = city
            tvLocationStatus.text = "Current: $region"
            tvWeatherLocation.text = "Weather in $city"
            loadGoogleMap(lat, lng)
            fetchWeatherForCity(city)
        }
    }

    private fun fetchWeatherForCity(city: String) {
        thread {
            try {
                // Fetch live weather from Open-Meteo or backend
                val cleanCity = if (city.contains(",")) city.split(",")[0].trim() else city
                val weatherUrl = "https://api.open-meteo.com/v1/forecast?latitude=$currentLat&longitude=$currentLng&current_weather=true"
                val conn = URL(weatherUrl).openConnection() as HttpURLConnection
                conn.connectTimeout = 3000
                conn.readTimeout = 3000
                if (conn.responseCode == 200) {
                    val text = conn.inputStream.bufferedReader().readText()
                    val json = JSONObject(text)
                    val cw = json.optJSONObject("current_weather")
                    if (cw != null) {
                        val temp = Math.round(cw.optDouble("temperature", 28.0))
                        val code = cw.optInt("weathercode", 1)
                        val condition = when (code) {
                            0 -> "Sunny"
                            1, 2, 3 -> "Partly Cloudy"
                            45, 48 -> "Foggy"
                            51, 53, 55, 61, 63, 65 -> "Rainy"
                            80, 81, 82 -> "Showers"
                            95, 96, 99 -> "Thunderstorm"
                            else -> "Clear Sky"
                        }
                        runOnUiThread {
                            tvWeatherTemp.text = "${temp}°C"
                            tvWeatherCondition.text = condition
                        }
                    }
                }
            } catch (e: Exception) {
                // Keep default weather
            }
        }
    }

    private fun setupNavigation() {
        findViewById<View>(R.id.llSearchBar).setOnClickListener {
            startActivity(Intent(this, SearchActivity::class.java))
        }

        // Refresh location coordinates by IP when GPS crosshair button is tapped
        findViewById<View>(R.id.btnDetectGps).setOnClickListener {
            fetchLocationByIp()
        }

        findViewById<View>(R.id.navTrips).setOnClickListener {
            startActivity(Intent(this, MyTripsActivity::class.java))
        }
        findViewById<View>(R.id.cvAskBuddy).setOnClickListener {
            startActivity(Intent(this, ChatBuddyActivity::class.java))
        }
        findViewById<View>(R.id.navSearch).setOnClickListener {
            startActivity(Intent(this, SearchActivity::class.java))
        }
        findViewById<View>(R.id.navAlerts).setOnClickListener {
            startActivity(Intent(this, AlertsActivity::class.java))
        }
        findViewById<View>(R.id.cvCommunity).setOnClickListener {
            startActivity(Intent(this, CommunityActivity::class.java))
        }
        findViewById<View>(R.id.navProfile).setOnClickListener {
            startActivity(Intent(this, ProfileActivity::class.java))
        }
    }
}
