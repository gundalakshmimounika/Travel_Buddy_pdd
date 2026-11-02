import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

export const Header = ({ onSearchPress, onAlertsPress }) => {
  const { user } = useAuth();
  const displayName = user?.name ? user.name.split(' ')[0] : 'Traveler';

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={styles.logoBadge}>
          <Ionicons name="airplane" size={18} color={colors.white} />
        </View>
        <View>
          <Text style={styles.greeting}>Hello, {displayName} 👋</Text>
          <Text style={styles.tagline}>Plan smarter. Travel easier.</Text>
        </View>
      </View>

      <View style={styles.right}>
        {onSearchPress && (
          <TouchableOpacity style={styles.iconButton} onPress={onSearchPress}>
            <Ionicons name="search" size={20} color={colors.textLight} />
          </TouchableOpacity>
        )}
        {onAlertsPress && (
          <TouchableOpacity style={styles.iconButton} onPress={onAlertsPress}>
            <Ionicons name="notifications-outline" size={20} color={colors.textLight} />
            <View style={styles.badgeDot} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 12,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  greeting: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.white,
  },
  tagline: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  right: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badgeDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accentAmber,
    borderWidth: 1.5,
    borderColor: colors.surfaceElevated,
  },
});
