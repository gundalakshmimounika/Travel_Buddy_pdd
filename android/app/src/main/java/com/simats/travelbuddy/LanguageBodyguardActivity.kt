package com.simats.travelbuddy

import android.graphics.Color
import android.os.Bundle
import android.speech.tts.TextToSpeech
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
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
import java.util.Locale

class LanguageBodyguardActivity : AppCompatActivity(), TextToSpeech.OnInitListener {

    private lateinit var tvRegionInfo: TextView
    private lateinit var btnLangTamil: MaterialButton
    private lateinit var btnLangHindi: MaterialButton
    private lateinit var btnLangFrench: MaterialButton
    private lateinit var etInputTranslate: EditText
    private lateinit var btnTranslate: MaterialButton
    private lateinit var llTranslateResult: LinearLayout
    private lateinit var tvTranslatedLocal: TextView
    private lateinit var tvTranslatedPhonetic: TextView
    private lateinit var ivSpeakResult: ImageView
    private lateinit var llPhrasesContainer: LinearLayout
    private lateinit var llGesturesContainer: LinearLayout

    private var currentLang: String = "tamil"
    private var tts: TextToSpeech? = null
    private var isTtsReady = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_language_bodyguard)

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

        tvRegionInfo = findViewById(R.id.tvRegionInfo)
        btnLangTamil = findViewById(R.id.btnLangTamil)
        btnLangHindi = findViewById(R.id.btnLangHindi)
        btnLangFrench = findViewById(R.id.btnLangFrench)
        etInputTranslate = findViewById(R.id.etInputTranslate)
        btnTranslate = findViewById(R.id.btnTranslate)
        llTranslateResult = findViewById(R.id.llTranslateResult)
        tvTranslatedLocal = findViewById(R.id.tvTranslatedLocal)
        tvTranslatedPhonetic = findViewById(R.id.tvTranslatedPhonetic)
        ivSpeakResult = findViewById(R.id.ivSpeakResult)
        llPhrasesContainer = findViewById(R.id.llPhrasesContainer)
        llGesturesContainer = findViewById(R.id.llGesturesContainer)

        // Initialize TTS
        tts = TextToSpeech(this, this)

        // Tab click listeners
        btnLangTamil.setOnClickListener { switchLanguage("tamil") }
        btnLangHindi.setOnClickListener { switchLanguage("hindi") }
        btnLangFrench.setOnClickListener { switchLanguage("french") }

        // Translator button
        btnTranslate.setOnClickListener {
            val query = etInputTranslate.text.toString().trim()
            if (query.isNotEmpty()) {
                performQuickTranslation(query)
            } else {
                Toast.makeText(this, "Please type a phrase to translate", Toast.LENGTH_SHORT).show()
            }
        }

        // Speak custom translation result
        ivSpeakResult.setOnClickListener {
            val localText = tvTranslatedLocal.text.toString()
            val phoneticText = tvTranslatedPhonetic.text.toString()
            speakText(localText, phoneticText)
        }

        // Initial load
        switchLanguage("tamil")
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            isTtsReady = true
            updateTtsLocale()
        }
    }

    private fun updateTtsLocale() {
        if (!isTtsReady || tts == null) return
        val targetLocale = when (currentLang) {
            "tamil" -> Locale("ta", "IN")
            "hindi" -> Locale("hi", "IN")
            "french" -> Locale.FRENCH
            else -> Locale.ENGLISH
        }
        val result = tts?.setLanguage(targetLocale)
        if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
            tts?.setLanguage(Locale.ENGLISH)
        }
    }

    private fun speakText(nativeText: String, fallbackPhonetic: String) {
        if (!isTtsReady || tts == null) {
            Toast.makeText(this, "Pronounce: $fallbackPhonetic", Toast.LENGTH_SHORT).show()
            return
        }

        val speechResult = tts?.speak(nativeText, TextToSpeech.QUEUE_FLUSH, null, "phrase_utterance")
        if (speechResult == TextToSpeech.ERROR) {
            tts?.speak(fallbackPhonetic, TextToSpeech.QUEUE_FLUSH, null, "phrase_phonetic")
        }
        Toast.makeText(this, "Playing audio pronunciation...", Toast.LENGTH_SHORT).show()
    }

    private fun switchLanguage(lang: String) {
        currentLang = lang
        updateTtsLocale()

        // Highlight selected tab
        btnLangTamil.backgroundTintList = getColorStateListCompat(if (lang == "tamil") 0xFF0284C7.toInt() else 0xFF334155.toInt())
        btnLangHindi.backgroundTintList = getColorStateListCompat(if (lang == "hindi") 0xFF0284C7.toInt() else 0xFF334155.toInt())
        btnLangFrench.backgroundTintList = getColorStateListCompat(if (lang == "french") 0xFF0284C7.toInt() else 0xFF334155.toInt())

        loadPhrasesAndGestures()
    }

    private fun getColorStateListCompat(color: Int): android.content.res.ColorStateList {
        return android.content.res.ColorStateList.valueOf(color)
    }

    private fun loadPhrasesAndGestures() {
        RetrofitClient.instance.getLanguagePhrases(currentLang).enqueue(object : Callback<LanguageBodyguardResponse> {
            override fun onResponse(call: Call<LanguageBodyguardResponse>, response: Response<LanguageBodyguardResponse>) {
                val body = response.body()
                if (response.isSuccessful && body != null && body.data != null) {
                    val langData = body.data
                    tvRegionInfo.text = "${langData.language_name} • ${langData.region}"
                    renderPhrases(langData.categories)
                    renderGestures(langData.gestures)
                } else {
                    renderFallbackData()
                }
            }

            override fun onFailure(call: Call<LanguageBodyguardResponse>, t: Throwable) {
                renderFallbackData()
            }
        })
    }

    private fun renderPhrases(categories: Map<String, List<PhraseItem>>?) {
        llPhrasesContainer.removeAllViews()
        if (categories == null || categories.isEmpty()) {
            return
        }

        for ((categoryName, phrases) in categories) {
            // Category Header TextView
            val tvCat = TextView(this).apply {
                text = categoryName
                setTextColor(Color.parseColor("#38BDF8"))
                textSize = 15f
                paint.isFakeBoldText = true
                setPadding(0, 24, 0, 12)
            }
            llPhrasesContainer.addView(tvCat)

            for (phrase in phrases) {
                val card = MaterialCardView(this).apply {
                    layoutParams = LinearLayout.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        ViewGroup.LayoutParams.WRAP_CONTENT
                    ).apply {
                        setMargins(0, 0, 0, 12)
                    }
                    radius = 24f
                    cardElevation = 0f
                    strokeWidth = 2
                    strokeColor = if (phrase.alert) Color.parseColor("#EF4444") else Color.parseColor("#334155")
                    setCardBackgroundColor(Color.parseColor(if (phrase.alert) "#2A1215" else "#1E293B"))
                }

                val itemLayout = LinearLayout(this).apply {
                    orientation = LinearLayout.VERTICAL
                    setPadding(24, 20, 24, 20)
                }

                // Row with Badge and Speaker
                val headerRow = LinearLayout(this).apply {
                    orientation = LinearLayout.HORIZONTAL
                    layoutParams = LinearLayout.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        ViewGroup.LayoutParams.WRAP_CONTENT
                    )
                }

                val badge = TextView(this).apply {
                    text = phrase.badge.uppercase()
                    setTextColor(Color.WHITE)
                    textSize = 10f
                    paint.isFakeBoldText = true
                    setBackgroundColor(if (phrase.alert) Color.parseColor("#DC2626") else Color.parseColor("#0284C7"))
                    setPadding(14, 4, 14, 4)
                }
                headerRow.addView(badge)

                val spacer = View(this).apply {
                    layoutParams = LinearLayout.LayoutParams(0, 1, 1f)
                }
                headerRow.addView(spacer)

                val ivSpeak = ImageView(this).apply {
                    layoutParams = LinearLayout.LayoutParams(40, 40)
                    setImageResource(R.drawable.ic_volume_up)
                    setColorFilter(Color.parseColor("#38BDF8"))
                    setPadding(4, 4, 4, 4)
                    setOnClickListener {
                        speakText(phrase.local, phrase.phonetic)
                    }
                }
                headerRow.addView(ivSpeak)
                itemLayout.addView(headerRow)

                // English Text
                val tvEnglish = TextView(this).apply {
                    text = phrase.english
                    setTextColor(Color.WHITE)
                    textSize = 15f
                    paint.isFakeBoldText = true
                    setPadding(0, 10, 0, 4)
                }
                itemLayout.addView(tvEnglish)

                // Native Local Script
                val tvLocal = TextView(this).apply {
                    text = phrase.local
                    setTextColor(Color.parseColor("#38BDF8"))
                    textSize = 16f
                    paint.isFakeBoldText = true
                }
                itemLayout.addView(tvLocal)

                // Phonetic Pronunciation Guide
                val tvPhonetic = TextView(this).apply {
                    text = "Pronounce: \"${phrase.phonetic}\""
                    setTextColor(Color.parseColor("#CBD5E1"))
                    textSize = 12f
                    setPadding(0, 4, 0, 0)
                }
                itemLayout.addView(tvPhonetic)

                card.addView(itemLayout)
                card.setOnClickListener {
                    speakText(phrase.local, phrase.phonetic)
                }

                llPhrasesContainer.addView(card)
            }
        }
    }

    private fun renderGestures(gestures: List<GestureItem>?) {
        llGesturesContainer.removeAllViews()
        if (gestures == null || gestures.isEmpty()) return

        for (gesture in gestures) {
            val isDo = gesture.type.equals("do", ignoreCase = true)
            val card = MaterialCardView(this).apply {
                layoutParams = LinearLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.WRAP_CONTENT
                ).apply {
                    setMargins(0, 0, 0, 14)
                }
                radius = 24f
                cardElevation = 0f
                strokeWidth = 2
                strokeColor = if (isDo) Color.parseColor("#10B981") else Color.parseColor("#EF4444")
                setCardBackgroundColor(Color.parseColor(if (isDo) "#0B291B" else "#2D1515"))
            }

            val itemLayout = LinearLayout(this).apply {
                orientation = LinearLayout.VERTICAL
                setPadding(24, 20, 24, 20)
            }

            // Tag badge row
            val tagRow = LinearLayout(this).apply {
                orientation = LinearLayout.HORIZONTAL
            }

            val typeBadge = TextView(this).apply {
                text = if (isDo) "✓ DO" else "✗ DON'T"
                setTextColor(Color.WHITE)
                textSize = 11f
                paint.isFakeBoldText = true
                setBackgroundColor(if (isDo) Color.parseColor("#059669") else Color.parseColor("#DC2626"))
                setPadding(16, 4, 16, 4)
            }
            tagRow.addView(typeBadge)

            val tagLabel = TextView(this).apply {
                text = "  ${gesture.tag}"
                setTextColor(if (isDo) Color.parseColor("#6EE7B7") else Color.parseColor("#FCA5A5"))
                textSize = 12f
                paint.isFakeBoldText = true
            }
            tagRow.addView(tagLabel)
            itemLayout.addView(tagRow)

            // Title
            val tvTitle = TextView(this).apply {
                text = gesture.title
                setTextColor(Color.WHITE)
                textSize = 15f
                paint.isFakeBoldText = true
                setPadding(0, 10, 0, 4)
            }
            itemLayout.addView(tvTitle)

            // Description
            val tvDesc = TextView(this).apply {
                text = gesture.description
                setTextColor(Color.parseColor("#E2E8F0"))
                textSize = 13f
                setLineSpacing(4f, 1.1f)
            }
            itemLayout.addView(tvDesc)

            card.addView(itemLayout)
            llGesturesContainer.addView(card)
        }
    }

    private fun performQuickTranslation(text: String) {
        val lower = text.lowercase(Locale.ROOT)
        var translatedNative = ""
        var translatedPhonetic = ""

        when (currentLang) {
            "tamil" -> {
                when {
                    "help" in lower -> {
                        translatedNative = "தயவுசெய்து எனக்கு உதவுங்கள்!"
                        translatedPhonetic = "Thayavu seidhu enakku udhavungal!"
                    }
                    "water" in lower -> {
                        translatedNative = "குடிநீர் வேண்டும்"
                        translatedPhonetic = "Kudineer vendum"
                    }
                    "how much" in lower || "price" in lower || "cost" in lower -> {
                        translatedNative = "இதன் விலை என்ன?"
                        translatedPhonetic = "Idhan vilai enna?"
                    }
                    "where" in lower && "beach" in lower -> {
                        translatedNative = "கடற்கரை எங்கே உள்ளது?"
                        translatedPhonetic = "Kadarkarai enge ulladhu?"
                    }
                    "food" in lower || "eat" in lower -> {
                        translatedNative = "நல்ல சாப்பாடு எங்கே கிடைக்கும்?"
                        translatedPhonetic = "Nalla saappaadu enge kidaikkum?"
                    }
                    "thank" in lower -> {
                        translatedNative = "மிக்க நன்றி"
                        translatedPhonetic = "Mikka Nandri"
                    }
                    else -> {
                        translatedNative = "இது எப்படி செல்வது? ($text)"
                        translatedPhonetic = "Idhu eppadi selvathu? (Pertaining to: $text)"
                    }
                }
            }
            "hindi" -> {
                when {
                    "help" in lower -> {
                        translatedNative = "कृपया मेरी मदद करें!"
                        translatedPhonetic = "Kripya meri madad karein!"
                    }
                    "water" in lower -> {
                        translatedNative = "पीने का पानी चाहिए"
                        translatedPhonetic = "Peene ka paani chahiye"
                    }
                    "how much" in lower || "price" in lower || "cost" in lower -> {
                        translatedNative = "यह कितने का है?"
                        translatedPhonetic = "Yeh kitne ka hai?"
                    }
                    "where" in lower -> {
                        translatedNative = "यह रास्ता कहाँ जाता है?"
                        translatedPhonetic = "Yeh raasta kahan jaata hai?"
                    }
                    "thank" in lower -> {
                        translatedNative = "बहुत-बहुत धन्यवाद"
                        translatedPhonetic = "Bahut bahut dhanyawaad"
                    }
                    else -> {
                        translatedNative = "मुझे यह जानकारी चाहिए ($text)"
                        translatedPhonetic = "Mujhe yeh jaankari chahiye: $text"
                    }
                }
            }
            "french" -> {
                when {
                    "help" in lower -> {
                        translatedNative = "Aidez-moi s'il vous plaît!"
                        translatedPhonetic = "Ay-day mwah seel voo play!"
                    }
                    "water" in lower -> {
                        translatedNative = "De l'eau s'il vous plaît"
                        translatedPhonetic = "Duh loh seel voo play"
                    }
                    "how much" in lower || "cost" in lower -> {
                        translatedNative = "Combien ça coûte?"
                        translatedPhonetic = "Kohm-byan sah koot?"
                    }
                    "thank" in lower -> {
                        translatedNative = "Merci beaucoup!"
                        translatedPhonetic = "Mair-see boh-koo!"
                    }
                    else -> {
                        translatedNative = "Où se trouve $text s'il vous plaît?"
                        translatedPhonetic = "Oo suh troov $text seel voo play?"
                    }
                }
            }
        }

        tvTranslatedLocal.text = translatedNative
        tvTranslatedPhonetic.text = "Pronounce: \"$translatedPhonetic\""
        llTranslateResult.visibility = View.VISIBLE
        speakText(translatedNative, translatedPhonetic)
    }

    private fun renderFallbackData() {
        val sampleCategories = mapOf(
            "Emergency & Safety" to listOf(
                PhraseItem("Please help me!", "தயவுசெய்து எனக்கு உதவுங்கள்!", "Thayavu seidhu enakku udhavungal!", "thayavu_udhavu", "SOS", true),
                PhraseItem("I need a doctor", "எனக்கு மருத்துவர் வேண்டும்", "Enakku maruthuvar vendum", "maruthuvar", "Medical", true)
            ),
            "Essential Transit" to listOf(
                PhraseItem("How much to go there?", "அங்கு செல்ல எவ்வளவு கட்டணம்?", "Angu sella evvalavu kattanam?", "evvalavu_kattanam", "Transit", false),
                PhraseItem("Stop here please", "தயவுசெய்து இங்கே நிறுத்துங்கள்", "Thayavu seidhu inge niruthungal", "inge_niruthungal", "Transit", false)
            )
        )
        val sampleGestures = listOf(
            GestureItem("Namaste / Vanakkam Greeting", "Fold both hands at chest level and bow head gently. Universal respectful greeting.", "Respect", "do"),
            GestureItem("Pointing Feet at Altars", "Never point soles of feet at deities or elders. Tuck feet inward.", "Taboo", "dont")
        )
        renderPhrases(sampleCategories)
        renderGestures(sampleGestures)
    }

    override fun onDestroy() {
        tts?.stop()
        tts?.shutdown()
        super.onDestroy()
    }
}
