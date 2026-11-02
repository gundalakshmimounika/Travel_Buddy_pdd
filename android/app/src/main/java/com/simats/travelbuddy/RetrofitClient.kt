package com.simats.travelbuddy

import com.google.gson.GsonBuilder
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object RetrofitClient {
    /**
     * Unified Backend URLs:
     * - Android Emulator pointing to PC localhost: "http://10.0.2.2/TravelBuddy/backend/"
     * - Local PHP Built-in Server: "http://10.0.2.2:8000/"
     * - Physical Device on Wi-Fi: "http://<YOUR_PC_LAN_IP>/TravelBuddy/backend/"
     */
    const val DEFAULT_BASE_URL = "http://10.0.2.2/TravelBuddy/backend/"

    @Volatile
    private var customBaseUrl: String? = null

    @Volatile
    private var apiService: ApiService? = null

    fun setBaseUrl(url: String) {
        val formattedUrl = if (url.endsWith("/")) url else "$url/"
        customBaseUrl = formattedUrl
        apiService = buildApiService(formattedUrl)
    }

    fun getBaseUrl(): String {
        return customBaseUrl ?: DEFAULT_BASE_URL
    }

    val instance: ApiService
        get() {
            return apiService ?: synchronized(this) {
                apiService ?: buildApiService(getBaseUrl()).also { apiService = it }
            }
        }

    private fun buildApiService(baseUrl: String): ApiService {
        val gson = GsonBuilder()
            .setLenient()
            .create()

        val okHttpClient = OkHttpClient.Builder()
            .connectTimeout(60, TimeUnit.SECONDS)
            .readTimeout(60, TimeUnit.SECONDS)
            .writeTimeout(60, TimeUnit.SECONDS)
            .build()

        val retrofit = Retrofit.Builder()
            .baseUrl(baseUrl)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create(gson))
            .build()

        return retrofit.create(ApiService::class.java)
    }
}
