import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export const AskBuddyWidget = ({ onPress }) => {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={styles.left}>
        <View style={styles.avatar}>
          <Ionicons name="sparkles" size={20} color={colors.white} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.title}>Ask Travel Buddy AI</Text>
            <View style={styles.proBadge}>
              <Text style={styles.proBadgeText}>24/7 AI</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>
            Get instant itineraries, hidden gems, and travel tips
          </Text>
        </View>
      </View>

      <View style={styles.arrowButton}>
        <Ionicons name="arrow-forward" size={16} color={colors.white} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E1B4B', // Deep indigo
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4338CA',
    padding: 16,
    marginHorizontal: 18,
    marginBottom: 20,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.white,
    marginRight: 8,
  },
  proBadge: {
    backgroundColor: '#818CF8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  proBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12,
    color: '#C7D2FE',
    marginTop: 2,
  },
  arrowButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
