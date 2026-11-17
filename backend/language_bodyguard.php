<?php
require_once 'db_config.php';

$data = getRequestData();
$action = isset($data['action']) ? $data['action'] : (isset($_GET['action']) ? $_GET['action'] : 'get_phrases');
$lang = isset($data['lang']) ? strtolower(trim($data['lang'])) : (isset($_GET['lang']) ? strtolower(trim($_GET['lang'])) : 'tamil');

$phraseData = [
    'tamil' => [
        'language_name' => 'Tamil (தமிழ்)',
        'region' => 'Tamil Nadu, Mahabalipuram, Chennai, Ooty, Madurai',
        'categories' => [
            'Emergency & Safety' => [
                ['english' => 'Please help me!', 'local' => 'தயவுசெய்து எனக்கு உதவுங்கள்!', 'phonetic' => 'Thayavu seidhu enakku udhavungal!', 'audio' => 'thayavu_udhavu', 'badge' => 'SOS', 'alert' => true],
                ['english' => 'Where is the police station?', 'local' => 'காவல் நிலையம் எங்கே உள்ளது?', 'phonetic' => 'Kaaval nilaiyam enge ulladhu?', 'audio' => 'kaaval_nilayam', 'badge' => 'SOS', 'alert' => true],
                ['english' => 'I need a doctor / hospital', 'local' => 'எனக்கு மருத்துவர் / மருத்துவமனை வேண்டும்', 'phonetic' => 'Enakku maruthuvar / maruthuvamanai vendum', 'audio' => 'maruthuvar', 'badge' => 'Medical', 'alert' => true],
                ['english' => 'I am lost', 'local' => 'நான் வழி தவறிவிட்டேன்', 'phonetic' => 'Naan vazhi thavari-vitten', 'audio' => 'vazhi_thavari', 'badge' => 'SOS', 'alert' => true]
            ],
            'Cabs & Transport' => [
                ['english' => 'How much to go there?', 'local' => 'அங்கு செல்ல எவ்வளவு கட்டணம்?', 'phonetic' => 'Angu sella evvalavu kattanam?', 'audio' => 'evvalavu_kattanam', 'badge' => 'Transit', 'alert' => false],
                ['english' => 'Please turn on the meter', 'local' => 'தயவுசெய்து மீட்டர் போடுங்கள்', 'phonetic' => 'Thayavu seidhu meter podungal', 'audio' => 'meter_podungal', 'badge' => 'Transit', 'alert' => false],
                ['english' => 'Stop here, please', 'local' => 'தயவுசெய்து இங்கே நிறுத்துங்கள்', 'phonetic' => 'Thayavu seidhu inge niruthungal', 'audio' => 'inge_niruthungal', 'badge' => 'Transit', 'alert' => false]
            ],
            'Food & Dining' => [
                ['english' => 'Is this vegetarian?', 'local' => 'இது சைவ உணவா?', 'phonetic' => 'Idhu saiva unavaa?', 'audio' => 'saiva_unava', 'badge' => 'Dining', 'alert' => false],
                ['english' => 'Less spicy please', 'local' => 'காரம் குறைவாக போடுங்கள்', 'phonetic' => 'Kaaram kuraivaaga podungal', 'audio' => 'kaaram_kuraivaaga', 'badge' => 'Dining', 'alert' => false],
                ['english' => 'Please bring drinking water', 'local' => 'குடிநீர் கொண்டு வாருங்கள்', 'phonetic' => 'Kudineer kondu vaarungal', 'audio' => 'kudineer', 'badge' => 'Dining', 'alert' => false],
                ['english' => 'The bill please', 'local' => 'பில் கொடுங்கள்', 'phonetic' => 'Bill kodungal', 'audio' => 'bill_kodungal', 'badge' => 'Dining', 'alert' => false]
            ],
            'Bargaining & Markets' => [
                ['english' => 'What is the price?', 'local' => 'இதன் விலை என்ன?', 'phonetic' => 'Idhan vilai enna?', 'audio' => 'vilai_enna', 'badge' => 'Shopping', 'alert' => false],
                ['english' => 'Too expensive! Reduce a little', 'local' => 'ரொம்ப அதிகம்! கொஞ்சம் குறைக்கவும்', 'phonetic' => 'Romba adhigam! Konjam kuraikkavum', 'audio' => 'romba_adhigam', 'badge' => 'Shopping', 'alert' => false]
            ],
            'Greetings & Courtesy' => [
                ['english' => 'Hello / Greetings', 'local' => 'வணக்கம்', 'phonetic' => 'Vanakkam', 'audio' => 'vanakkam', 'badge' => 'Basics', 'alert' => false],
                ['english' => 'Thank you very much', 'local' => 'மிக்க நன்றி', 'phonetic' => 'Mikka Nandri', 'audio' => 'mikka_nandri', 'badge' => 'Basics', 'alert' => false],
                ['english' => 'Yes / No', 'local' => 'ஆம் / இல்லை', 'phonetic' => 'Aam / Illai', 'audio' => 'aam_illai', 'badge' => 'Basics', 'alert' => false]
            ]
        ],
        'gestures' => [
            [
                'title' => 'Namaste / Vanakkam',
                'description' => 'Fold both hands at chest level and bow head slightly. The universal respectful greeting for everyone from temple priests to taxi drivers.',
                'tag' => 'Recommended Respect',
                'type' => 'do'
            ],
            [
                'title' => 'Head Bobble / Nod Nuances',
                'description' => 'A gentle side-to-side head tilt means "Yes / Understood / I agree", not "No". If you nod vertically or tilt gently, it communicates friendliness and rapport.',
                'tag' => 'Local Nuance',
                'type' => 'do'
            ],
            [
                'title' => 'Use Right Hand for Eating & Payments',
                'description' => 'Always pass money, credit cards, gifts, or food with your right hand. Passing items with the left hand is viewed as impolite in traditional markets.',
                'tag' => 'Essential Etiquette',
                'type' => 'do'
            ],
            [
                'title' => 'Pointing Feet at Altars or Elders',
                'description' => 'Never point the soles of your feet toward temple deities, scriptures, or elderly people when sitting. Tuck your feet inward.',
                'tag' => 'Strict Taboo',
                'type' => 'dont'
            ],
            [
                'title' => 'Shoes Inside Heritage Temples',
                'description' => 'Always remove shoes and socks before entering sacred sanctums. Secure shoe-stands are located at the temple entrance.',
                'tag' => 'Mandatory Rule',
                'type' => 'dont'
            ]
        ]
    ],
    'hindi' => [
        'language_name' => 'Hindi (हिंदी)',
        'region' => 'Delhi, Jaipur, Agra, Mumbai, Himachal, Varanasi',
        'categories' => [
            'Emergency & Safety' => [
                ['english' => 'Please help me!', 'local' => 'कृपया मेरी मदद करें!', 'phonetic' => 'Kripya meri madad karein!', 'audio' => 'kripya_madad', 'badge' => 'SOS', 'alert' => true],
                ['english' => 'Where is the police station?', 'local' => 'पुलिस स्टेशन कहाँ है?', 'phonetic' => 'Police station kahan hai?', 'audio' => 'police_kahan', 'badge' => 'SOS', 'alert' => true],
                ['english' => 'I need a doctor', 'local' => 'मुझे डॉक्टर की ज़रूरत है', 'phonetic' => 'Mujhe doctor ki zaroorat hai', 'audio' => 'doctor_zaroorat', 'badge' => 'Medical', 'alert' => true]
            ],
            'Cabs & Transport' => [
                ['english' => 'How much to go there?', 'local' => 'वहाँ जाने का कितना होगा?', 'phonetic' => 'Wahan jaane ka kitna hoga?', 'audio' => 'kitna_hoga', 'badge' => 'Transit', 'alert' => false],
                ['english' => 'Please turn on the meter', 'local' => 'मीटर से चलो भाई', 'phonetic' => 'Meter se chalo bhai', 'audio' => 'meter_se_chalo', 'badge' => 'Transit', 'alert' => false],
                ['english' => 'Stop here please', 'local' => 'यहाँ रोक दीजिए', 'phonetic' => 'Yahan rok dijiye', 'audio' => 'yahan_rok', 'badge' => 'Transit', 'alert' => false]
            ],
            'Greetings & Dining' => [
                ['english' => 'Hello / Greetings', 'local' => 'नमस्ते', 'phonetic' => 'Namaste', 'audio' => 'namaste', 'badge' => 'Basics', 'alert' => false],
                ['english' => 'Thank you very much', 'local' => 'बहुत-बहुत धन्यवाद / शुक्रिया', 'phonetic' => 'Bahut bahut dhanyawaad / Shukriya', 'audio' => 'dhanyawaad', 'badge' => 'Basics', 'alert' => false],
                ['english' => 'Is this pure vegetarian?', 'local' => 'क्या यह शुद्ध शाकाहारी है?', 'phonetic' => 'Kya yeh shuddh shakahari hai?', 'audio' => 'shakahari', 'badge' => 'Dining', 'alert' => false]
            ]
        ],
        'gestures' => [
            [
                'title' => 'Namaste Greeting',
                'description' => 'Hands pressed together with a slight head bow. Great for shopkeepers, hosts, and older individuals.',
                'tag' => 'Recommended Respect',
                'type' => 'do'
            ],
            [
                'title' => 'Bargaining Politeness',
                'description' => 'Smile and address shopkeepers respectfully as "Bhaiya" (brother). Aggressive bargaining is counterproductive, warmth gets the best price!',
                'tag' => 'Cultural Hack',
                'type' => 'do'
            ],
            [
                'title' => 'Avoid Public Displays of Affection',
                'description' => 'Conservative public areas frown upon excessive hugging or kissing. Keep gestures modest in public monuments.',
                'tag' => 'Social Decorum',
                'type' => 'dont'
            ]
        ]
    ],
    'french' => [
        'language_name' => 'French (Français)',
        'region' => 'Pondicherry (French Quarter), Paris, Nice, Geneva',
        'categories' => [
            'Emergency & Safety' => [
                ['english' => 'Please help me!', 'local' => 'Aidez-moi s\'il vous plaît!', 'phonetic' => 'Eh-day mwah seel voo pleh!', 'audio' => 'aidez_moi', 'badge' => 'SOS', 'alert' => true],
                ['english' => 'Where is the hospital?', 'local' => 'Où est l\'hôpital?', 'phonetic' => 'Oo eh lo-pee-tal?', 'audio' => 'hopital', 'badge' => 'Medical', 'alert' => true]
            ],
            'Greetings & Dining' => [
                ['english' => 'Good morning / Hello', 'local' => 'Bonjour', 'phonetic' => 'Bohn-zhoor', 'audio' => 'bonjour', 'badge' => 'Basics', 'alert' => false],
                ['english' => 'Thank you very much', 'local' => 'Merci beaucoup', 'phonetic' => 'Mehr-see boh-koo', 'audio' => 'merci', 'badge' => 'Basics', 'alert' => false],
                ['english' => 'The bill please', 'local' => 'L\'addition s\'il vous plaît', 'phonetic' => 'Lah-dee-syohn seel voo pleh', 'audio' => 'addition', 'badge' => 'Dining', 'alert' => false]
            ]
        ],
        'gestures' => [
            [
                'title' => 'Always say Bonjour First',
                'description' => 'Entering any cafe or shop without saying "Bonjour" first is viewed as impolite. Always greet before asking your question!',
                'tag' => 'Essential Etiquette',
                'type' => 'do'
            ],
            [
                'title' => 'Don\'t Snap Fingers at Waiters',
                'description' => 'Never snap or yell "Garçon". Catch eye contact and raise your index finger slightly to request assistance.',
                'tag' => 'Dining Manners',
                'type' => 'dont'
            ]
        ]
    ]
];

$activeData = isset($phraseData[$lang]) ? $phraseData[$lang] : $phraseData['tamil'];

if ($action === 'get_phrases') {
    echo json_encode([
        'status' => 'success',
        'selected_language' => $lang,
        'data' => $activeData,
        'available_languages' => [
            ['code' => 'tamil', 'name' => 'Tamil (Mahabalipuram / Chennai / Pondy)'],
            ['code' => 'hindi', 'name' => 'Hindi (Delhi / Jaipur / North India)'],
            ['code' => 'french', 'name' => 'French (Pondicherry French Quarter / Paris)']
        ]
    ]);
    exit;
}

if ($action === 'translate') {
    $text = isset($data['text']) ? trim($data['text']) : '';
    if (empty($text)) {
        echo json_encode(['status' => 'error', 'message' => 'Please provide text to translate']);
        exit;
    }

    // AI Language Bodyguard smart translation engine
    $cleanText = strtolower($text);
    $translated = "தயவுசெய்து எனக்கு உதவுங்கள்";
    $phonetic = "Thayavu seidhu enakku udhavungal";
    $bodyguardTip = "Show this card directly to the local or tap the speaker icon to play the audio loudly!";

    if (strpos($cleanText, 'water') !== false) {
        $translated = "எனக்கு குடிநீர் வேண்டும்";
        $phonetic = "Enakku kudineer vendum";
        $bodyguardTip = "Always ask for sealed packaged mineral water bottles in roadside dhabas.";
    } elseif (strpos($cleanText, 'price') !== false || strpos($cleanText, 'cost') !== false || strpos($cleanText, 'how much') !== false) {
        $translated = "இதன் விலை என்ன? கொஞ்சம் குறைத்து கொடுங்கள்";
        $phonetic = "Idhan vilai enna? Konjam kuraithu kodungal";
        $bodyguardTip = "Offer 30% below the quoted souvenir stall price with a smile!";
    } elseif (strpos($cleanText, 'toilet') !== false || strpos($cleanText, 'washroom') !== false || strpos($cleanText, 'restroom') !== false) {
        $translated = "கழிப்பறை எங்கே உள்ளது?";
        $phonetic = "Kazhipparai enge ulladhu?";
        $bodyguardTip = "Look for blue tourism board facility signs or nearby cafes.";
    } elseif (strpos($cleanText, 'hotel') !== false || strpos($cleanText, 'room') !== false) {
        $translated = "அருகிலுள்ள நல்ல விடுதி எங்கே?";
        $phonetic = "Arugilulla nalla viduthi enge?";
        $bodyguardTip = "Check room AC and hot water before handing over cash.";
    } elseif (strpos($cleanText, 'food') !== false || strpos($cleanText, 'eat') !== false) {
        $translated = "நல்ல உணவகம் எங்கே இருக்கிறது?";
        $phonetic = "Nalla unavagam enge irukkiradhu?";
        $bodyguardTip = "Eat where local families are dining for the freshest preparations!";
    }

    echo json_encode([
        'status' => 'success',
        'original' => $text,
        'translated' => $translated,
        'phonetic' => $phonetic,
        'language' => $activeData['language_name'],
        'bodyguard_tip' => $bodyguardTip
    ]);
    exit;
}

echo json_encode(['status' => 'error', 'message' => 'Invalid action']);
