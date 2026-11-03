package com.simats.travelbuddy

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.location.Geocoder
import android.os.Bundle
import android.view.View
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
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.MapView
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.MarkerOptions
import com.google.android.gms.tasks.CancellationTokenSource
import java.util.Locale

@Suppress("DEPRECATION")
class MainActivity : AppCompatActivity() {

    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private lateinit var tvLocationName: TextView
    private lateinit var tvLocationStatus: TextView
    private lateinit var tvWeatherLocation: TextView
    private lateinit var mapView: MapView
    private var googleMap: GoogleMap? = null

    private var currentLat: Double? = 40.7128
    private var currentLng: Double? = -74.0060

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_main)

        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)
        tvLocationName = findViewById(R.id.tvUpcomingTitle)
        tvLocationStatus = findViewById(R.id.tvUpcomingDates)
        tvWeatherLocation = findViewById(R.id.tvWeatherLocation)
        mapView = findViewById(R.id.mapView)

        mapView.onCreate(savedInstanceState)
        mapView.getMapAsync { map ->
            googleMap = map
            googleMap?.uiSettings?.isZoomControlsEnabled = false
            googleMap?.uiSettings?.isMyLocationButtonEnabled = true
            if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED ||
                ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
                googleMap?.isMyLocationEnabled = true
            }
            currentLat?.let { lat ->
                currentLng?.let { lng ->
                    updateMapLocation(lat, lng)
                }
            }
        }

        mapView.setOnTouchListener { v, _ ->
            v.parent.requestDisallowInterceptTouchEvent(true)
            v.performClick()
            false
        }

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.scrollView)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, 0)
            insets
        }

        setupNavigation()
        fetchCurrentLocation()
        
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.TIRAMISU) {
            if (ActivityCompat.checkSelfPermission(this, android.Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(this, arrayOf(android.Manifest.permission.POST_NOTIFICATIONS), 101)
            }
        }
    }

    private fun fetchCurrentLocation() {
        val requestPermissionLauncher = registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { permissions ->
            if (permissions[Manifest.permission.ACCESS_FINE_LOCATION] == true || permissions[Manifest.permission.ACCESS_COARSE_LOCATION] == true) {
                getCurrentLocation()
            } else {
                handleLocation(40.7128, -74.0060, "New York", "United States")
            }
        }

        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED &&
            ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            requestPermissionLauncher.launch(arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION))
        } else {
            getCurrentLocation()
        }
    }

    private fun getCurrentLocation() {
        try {
            if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED ||
                ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED) {

                fusedLocationClient.lastLocation.addOnSuccessListener { location ->
                    if (location != null) {
                        handleLocation(location.latitude, location.longitude)
                    } else {
                        handleLocation(40.7128, -74.0060, "New York", "United States")
                    }
                }.addOnFailureListener {
                    handleLocation(40.7128, -74.0060, "New York", "United States")
                }

                fusedLocationClient.getCurrentLocation(Priority.PRIORITY_HIGH_ACCURACY, CancellationTokenSource().token)
                    .addOnSuccessListener { location ->
                        if (location != null) {
                            handleLocation(location.latitude, location.longitude)
                        }
                    }
            } else {
                handleLocation(40.7128, -74.0060, "New York", "United States")
            }
        } catch (e: SecurityException) {
            e.printStackTrace()
            handleLocation(40.7128, -74.0060, "New York", "United States")
        }
    }

    private fun handleLocation(lat: Double, lng: Double, defaultCity: String? = null, defaultCountry: String? = null) {
        currentLat = lat
        currentLng = lng

        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED ||
            ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            googleMap?.isMyLocationEnabled = true
        }

        updateMapLocation(lat, lng)

        if (defaultCity != null) {
            runOnUiThread {
                tvLocationName.text = defaultCity
                tvLocationStatus.text = "Current: ${defaultCountry ?: "United States"}"
                tvWeatherLocation.text = "Weather in $defaultCity"
            }
            return
        }

        try {
            val geocoder = Geocoder(this, Locale.getDefault())
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.TIRAMISU) {
                geocoder.getFromLocation(lat, lng, 1) { addresses ->
                    if (addresses.isNotEmpty()) {
                        val address = addresses[0]
                        val city = address.locality ?: address.subAdminArea ?: address.adminArea ?: "New York"
                        val country = address.countryName ?: "United States"
                        runOnUiThread {
                            tvLocationName.text = city
                            tvLocationStatus.text = if (country.isNotEmpty()) "Current: $country" else "Current Location"
                            tvWeatherLocation.text = "Weather in $city"
                        }
                    } else {
                        runOnUiThread {
                            tvLocationName.text = "New York"
                            tvLocationStatus.text = "Current: United States"
                            tvWeatherLocation.text = "Weather in New York"
                        }
                    }
                }
            } else {
                @Suppress("DEPRECATION")
                val addresses = geocoder.getFromLocation(lat, lng, 1)
                if (addresses != null && addresses.isNotEmpty()) {
                    val address = addresses[0]
                    val city = address.locality ?: address.subAdminArea ?: address.adminArea ?: "New York"
                    val country = address.countryName ?: "United States"
                    runOnUiThread {
                        tvLocationName.text = city
                        tvLocationStatus.text = if (country.isNotEmpty()) "Current: $country" else "Current Location"
                        tvWeatherLocation.text = "Weather in $city"
                    }
                } else {
                    runOnUiThread {
                        tvLocationName.text = "New York"
                        tvLocationStatus.text = "Current: United States"
                        tvWeatherLocation.text = "Weather in New York"
                    }
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
            runOnUiThread {
                tvLocationName.text = "New York"
                tvLocationStatus.text = "Current: United States"
                tvWeatherLocation.text = "Weather in New York"
            }
        }
    }

    private fun updateMapLocation(lat: Double, lng: Double) {
        val latLng = LatLng(lat, lng)
        googleMap?.clear()
        googleMap?.addMarker(MarkerOptions().position(latLng).title("Current Location"))
        googleMap?.animateCamera(CameraUpdateFactory.newLatLngZoom(latLng, 15f))
    }

    private fun setupNavigation() {
        findViewById<View>(R.id.llSearchBar).setOnClickListener {
            startActivity(Intent(this, SearchActivity::class.java))
        }
        findViewById<View>(R.id.cvUpcomingTrip).setOnClickListener {
            if (currentLat != null && currentLng != null) {
                val gmmIntentUri = android.net.Uri.parse("geo:$currentLat,$currentLng?z=15")
                val mapIntent = Intent(Intent.ACTION_VIEW, gmmIntentUri)
                startActivity(mapIntent)
            } else {
                startActivity(Intent(this, TripDetailsActivity::class.java))
            }
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

    override fun onResume() {
        super.onResume()
        mapView.onResume()
    }

    override fun onPause() {
        super.onPause()
        mapView.onPause()
    }

    override fun onDestroy() {
        super.onDestroy()
        mapView.onDestroy()
    }

    override fun onLowMemory() {
        super.onLowMemory()
        mapView.onLowMemory()
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        mapView.onSaveInstanceState(outState)
    }
}
