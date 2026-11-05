import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { chatApi } from '../api/endpoints';
import { useLocation } from '../context/LocationContext';

const QUICK_PROMPTS = [
  'Best places in Nellore & AP?',
  'Plan a 3-day trip to Pondicherry',
  'Train schedule from Nellore to Tirupati',
  'Budget travel tips for South India',
];

export const ChatBuddyScreen = ({ navigation }) => {
  const { currentLocation } = useLocation();
  const originCity = currentLocation?.city || 'Nellore';

  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'bot',
      text: `Hello! I'm TravelBuddy AI 🌍. I'm calibrated for your location in ${originCity}. How can I assist your journey today?`,
      options: [
        { label: "💰 Plan ₹6,000 Trip", action: "budget", param: "6000" },
        { label: "🏖️ Explore Goa", action: "place", param: "Goa" },
        { label: "🏨 Top Hotels", action: "hotels", param: "Goa" },
        { label: "ℹ️ Travel Info", action: "info", param: "General Travel Info" }
      ],
      time: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef();

    const handleOptionPress = (opt) => {
    if (!opt) return;
    const act = opt.action;
    const param = opt.param || '';

    if (act === 'budget') {
      navigation.navigate('BudgetTracker');
    } else if (act === 'hotels') {
      navigation.navigate('HotelBooking');
    } else if (act === 'tickets') {
      navigation.navigate('TicketBooking');
    } else if (act === 'packing') {
      navigation.navigate('PackingList');
    } else if (act === 'place') {
      navigation.navigate('DestinationDetails', { destination: param || 'Goa' });
    } else if (act === 'map') {
      navigation.navigate('DestinationDetails', { destination: param || 'Pondicherry' });
    } else if (act === 'weather') {
      alert(`🌤️ Weather Forecast for ${param || 'Destination'}:\n\n• Condition: Pleasant & Clear Skies\n• Temperature: 26°C - 30°C\n• Best Time to Visit: Oct to March`);
    } else if (act === 'copy_itinerary') {
      alert(`📋 ${param || 'Trip'} itinerary ready! You can paste and share it anywhere.`);
    } else if (act === 'info') {
      alert(
        "ℹ️ 24x7 Travel & Emergency Helplines:\n\n" +
        "🚨 National Emergency: 112\n" +
        "🚓 Police: 100 / 112\n" +
        "🚑 Ambulance: 108\n" +
        "📞 Tourist Helpline: 1363 (Toll Free)\n" +
        "🚆 Railway Security: 139\n\n" +
        "💡 Essential Travel Tips:\n" +
        "• Carry Govt ID (Aadhaar / Passport) everywhere.\n" +
        "• UPI payments work everywhere across India.\n" +
        "• Book train berths 2-3 weeks early for discounts!"
      );
    } else if (act === 'prompt') {
      handleSend(param);
    }
  };

  const handleSend = async (textToSend) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      time: 'Now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const res = await chatApi.askBuddy(query);
      const botResponse =
        res?.answer ||
        res?.reply ||
        res?.response ||
        res?.message ||
        `Based on your travel interest from ${originCity}, I recommend checking out scenic express trains, local coastal delicacies, and reserving verified stays.`;

      const botOptions = (Array.isArray(res?.options) && res.options.length > 0)
        ? res.options
        : [
            { label: "💰 Budget Tracker", action: "budget" },
            { label: "🏨 Hotels", action: "hotels" },
            { label: "🎫 Tickets", action: "tickets" },
            { label: "ℹ️ Travel Info", action: "info" }
          ];

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: botResponse,
          options: botOptions,
          time: 'Now',
        },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: `I'm having trouble reaching the AI server. For travel from ${originCity}, top destinations include Tirupati, Pondicherry, and Araku Valley!`,
          time: 'Now',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color={colors.white} />
        </TouchableOpacity>

        <View style={styles.topCenter}>
          <Text style={styles.headerTitle}>Travel Buddy AI</Text>
          <View style={styles.onlineBadge}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Online • Localized to {originCity}</Text>
          </View>
        </View>

        <View style={{ width: 40 }} />
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesScroll}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <View
              key={msg.id}
              style={[styles.messageBubble, isUser ? styles.userBubble : styles.botBubble]}
            >
              {!isUser && (
                <View style={styles.botAvatar}>
                  <Ionicons name="sparkles" size={14} color={colors.white} />
                </View>
              )}
              <View style={[styles.bubbleContent, isUser ? styles.userContent : styles.botContent]}>
                <Text style={[styles.bubbleText, isUser ? styles.userText : styles.botText]}>
                  {msg.text}
                </Text>
                <Text style={styles.timeText}>{msg.time}</Text>
                {!isUser && msg.options && msg.options.length > 0 && (
                  <View style={styles.optionsWrap}>
                    {msg.options.map((opt, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={[styles.optPill, opt.action === 'info' && styles.optInfoPill]}
                        onPress={() => handleOptionPress(opt)}
                      >
                        <Text style={[styles.optPillText, opt.action === 'info' && styles.optInfoPillText]}>
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>
          );
        })}

        {loading && (
          <View style={[styles.messageBubble, styles.botBubble]}>
            <View style={styles.botAvatar}>
              <Ionicons name="sparkles" size={14} color={colors.white} />
            </View>
            <View style={[styles.bubbleContent, styles.botContent, { paddingVertical: 10 }]}>
              <ActivityIndicator size="small" color={colors.primaryLight} />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Suggested Quick Prompts */}
      <View style={styles.quickPromptsBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {QUICK_PROMPTS.map((prompt, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.promptChip}
              onPress={() => handleSend(prompt)}
            >
              <Text style={styles.promptChipText}>{prompt}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Input row */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Ask anything about your trip..."
          placeholderTextColor={colors.textMuted}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={() => handleSend()}
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={() => handleSend()}
          disabled={loading || !inputText.trim()}
        >
          <Ionicons name="send" size={18} color={colors.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  topCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.white,
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accentEmerald,
    marginRight: 6,
  },
  onlineText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  messagesScroll: {
    flex: 1,
  },
  messagesContent: {
    padding: 18,
    gap: 14,
  },
  messageBubble: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    maxWidth: '85%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  botBubble: {
    alignSelf: 'flex-start',
  },
  botAvatar: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 4,
  },
  bubbleContent: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userContent: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  botContent: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userText: {
    color: colors.white,
  },
  botText: {
    color: colors.textLight,
  },
  timeText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  optionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  optPill: {
    backgroundColor: 'rgba(37, 99, 235, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.4)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 4,
    marginBottom: 4,
  },
  optPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#93C5FD',
  },
  optInfoPill: {
    backgroundColor: 'rgba(14, 165, 233, 0.18)',
    borderColor: 'rgba(56, 189, 248, 0.5)',
  },
  optInfoPillText: {
    color: '#38BDF8',
  },
  quickPromptsBar: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
  },
  promptChip: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  promptChipText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.surfaceElevated,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: colors.inputBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: colors.white,
    fontSize: 14,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
