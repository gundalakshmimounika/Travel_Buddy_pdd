import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const ACTIONS = [
  {
    id: 'planner',
    title: 'Trip Planner',
    subtitle: 'Build routes',
    icon: 'compass',
    iconColor: '#3B82F6',
    bgColor: 'rgba(59, 130, 246, 0.12)',
    screen: 'TripPlanner',
  },
  {
    id: 'budget',
    title: 'Budget',
    subtitle: 'Expense tracker',
    icon: 'wallet',
    iconColor: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.12)',
    screen: 'BudgetTracker',
  },
  {
    id: 'hotels',
    title: 'Hotels',
    subtitle: 'Stay & resorts',
    icon: 'bed',
    iconColor: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.12)',
    screen: 'HotelBooking',
  },
  {
    id: 'packing',
    title: 'Packing',
    subtitle: 'Smart checklist',
    icon: 'bag-check',
    iconColor: '#8B5CF6',
    bgColor: 'rgba(139, 92, 246, 0.12)',
    screen: 'PackingList',
  },
];

export const QuickActions = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>EXPLORE SERVICES</Text>
      <View style={styles.grid}>
        {ACTIONS.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => navigation.navigate(item.screen)}
          >
            <View style={[styles.iconWrapper, { backgroundColor: item.bgColor }]}>
              <Ionicons name={item.icon} size={22} color={item.iconColor} />
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 18,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 16,
    alignItems: 'flex-start',
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
});
