import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export const DestinationCard = ({ destination, onPress }) => {
  const { title, tag, rating, price, bestTime, icon = 'trail-sign' } = destination;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={styles.imagePlaceholder}>
        <Ionicons name={icon} size={36} color={colors.primaryLight} />
        <View style={styles.tagBadge}>
          <Text style={styles.tagText}>{tag || 'Popular'}</Text>
        </View>
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={12} color="#FBBF24" style={{ marginRight: 3 }} />
          <Text style={styles.ratingText}>{rating || '4.8'}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={styles.bestTime} numberOfLines={1}>Best: {bestTime || 'Oct - Mar'}</Text>
        
        <View style={styles.footer}>
          <View>
            <Text style={styles.priceLabel}>Estimated</Text>
            <Text style={styles.priceValue}>{price || '₹3,500'}</Text>
          </View>
          <View style={styles.viewBtn}>
            <Text style={styles.viewBtnText}>View</Text>
            <Ionicons name="chevron-forward" size={12} color={colors.primaryLight} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 200,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    overflow: 'hidden',
    marginRight: 14,
  },
  imagePlaceholder: {
    height: 120,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  tagBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(37, 99, 235, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
    textTransform: 'uppercase',
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.white,
  },
  body: {
    padding: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 2,
  },
  bestTime: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
    paddingTop: 8,
  },
  priceLabel: {
    fontSize: 10,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.accentEmerald,
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryLight,
    marginRight: 2,
  },
});
