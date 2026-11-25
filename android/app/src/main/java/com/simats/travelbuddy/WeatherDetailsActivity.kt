package com.simats.travelbuddy
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class WeatherDetailsActivity : AppCompatActivity() {
    private lateinit var hourlyAdapter: HourlyAdapter
    private lateinit var dailyAdapter: DailyAdapter
    private val hourlyList = mutableListOf<HourlyWeather>()
    private val dailyList = mutableListOf<DailyWeather>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_weather_details)

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.rlHeader)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, 0)
            insets
        }

        val destination = intent.getStringExtra("DESTINATION") ?: "Mahabalipuram"
        findViewById<TextView>(R.id.tvWeatherHeader).text = "Weather in $destination"

        findViewById<View>(R.id.ivBack).setOnClickListener { finish() }

        setupRecyclerViews()
        fetchWeatherData(destination)
    }

    private fun setupRecyclerViews() {
        val rvHourly = findViewById<RecyclerView>(R.id.rvHourly)
        rvHourly.layoutManager = LinearLayoutManager(this, LinearLayoutManager.HORIZONTAL, false)
        hourlyAdapter = HourlyAdapter(hourlyList)
        rvHourly.adapter = hourlyAdapter

        val rvDaily = findViewById<RecyclerView>(R.id.rvDaily)
        rvDaily.layoutManager = LinearLayoutManager(this)
        dailyAdapter = DailyAdapter(dailyList)
        rvDaily.adapter = dailyAdapter
    }

    private fun fetchWeatherData(place: String) {
        RetrofitClient.instance.getWeather(place).enqueue(object : Callback<WeatherResponse> {
            override fun onResponse(call: Call<WeatherResponse>, response: Response<WeatherResponse>) {
                val body = response.body()
                if (body != null && body.hourly.isNotEmpty()) {
                    hourlyList.clear()
                    hourlyList.addAll(body.hourly)
                    
                    dailyList.clear()
                    dailyList.addAll(body.daily)
                    
                    updateUI()

                    val badWeather = body.daily.firstOrNull { day ->
                        val cond = day.condition.lowercase()
                        cond.contains("rain") || cond.contains("storm") || cond.contains("snow") || cond.contains("thunderstorm") || cond.contains("heavy")
                    }
                    if (badWeather != null) {
                        AlertHelper.showNotification(
                            this@WeatherDetailsActivity,
                            "Severe Weather Warning",
                            "Severe weather warning for $place: Expect ${badWeather.condition} on ${badWeather.day}!",
                            "weather"
                        )
                    }
                } else {
                    renderFallbackWeather()
                }
            }
            override fun onFailure(call: Call<WeatherResponse>, t: Throwable) {
                renderFallbackWeather()
            }
        })
    }

    private fun renderFallbackWeather() {
        hourlyList.clear()
        hourlyList.addAll(listOf(
            HourlyWeather("09:00", "26°C", "Sunny"),
            HourlyWeather("12:00", "30°C", "Partly Cloudy"),
            HourlyWeather("15:00", "29°C", "Breezy"),
            HourlyWeather("18:00", "27°C", "Clear Sky"),
            HourlyWeather("21:00", "25°C", "Cool")
        ))
        dailyList.clear()
        dailyList.addAll(listOf(
            DailyWeather("Today", "24°C", "29°C", "Sunny"),
            DailyWeather("Tomorrow", "23°C", "28°C", "Partly Cloudy"),
            DailyWeather("Wednesday", "22°C", "27°C", "Breezy"),
            DailyWeather("Thursday", "23°C", "28°C", "Clear"),
            DailyWeather("Friday", "24°C", "29°C", "Pleasant")
        ))
        updateUI()
    }

    private fun updateUI() {
        runOnUiThread {
            hourlyAdapter.notifyDataSetChanged()
            dailyAdapter.notifyDataSetChanged()
        }
    }

    class HourlyAdapter(private val items: List<HourlyWeather>) :
        RecyclerView.Adapter<HourlyAdapter.ViewHolder>() {
        class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
            val time: TextView = view.findViewById(R.id.tvHourlyTime)
            val temp: TextView = view.findViewById(R.id.tvHourlyTemp)
        }
        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) =
            ViewHolder(LayoutInflater.from(parent.context).inflate(R.layout.item_weather_hourly, parent, false))
        override fun onBindViewHolder(holder: ViewHolder, position: Int) {
            val item = items[position]
            holder.time.text = item.time
            holder.temp.text = item.temp
        }
        override fun getItemCount() = items.size
    }

    class DailyAdapter(private val items: List<DailyWeather>) :
        RecyclerView.Adapter<DailyAdapter.ViewHolder>() {
        class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
            val day: TextView = view.findViewById(R.id.tvDailyDay)
            val low: TextView = view.findViewById(R.id.tvDailyLow)
            val high: TextView = view.findViewById(R.id.tvDailyHigh)
        }
        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) =
            ViewHolder(LayoutInflater.from(parent.context).inflate(R.layout.item_weather_daily, parent, false))
        override fun onBindViewHolder(holder: ViewHolder, position: Int) {
            val item = items[position]
            holder.day.text = item.day
            holder.low.text = item.low
            holder.high.text = item.high
        }
        override fun getItemCount() = items.size
    }
}
