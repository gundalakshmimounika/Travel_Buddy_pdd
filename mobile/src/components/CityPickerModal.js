import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useLocation } from '../context/LocationContext';

const POPULAR_CITIES = [
  { name: 'Nellore', badge: 'Default / Current' },
  { name: 'Tirupati', badge: 'Temple City' },
  { name: 'Vijayawada', badge: 'Krishna Hub' },
  { name: 'Visakhapatnam', badge: 'Coastal City' },
  { name: 'Hyderabad', badge: 'Heritage & Tech' },
  { name: 'Bengaluru', badge: 'Garden City' },
  { name: 'Chennai', badge: 'Gateway City' },
  { name: 'Mumbai', badge: 'Financial Capital' },
  { name: 'Delhi', badge: 'National Capital' },
  { name: 'Goa', badge: 'Beach Paradise' },
];

export const CityPickerModal = () => {
  const { pickerVisible, setPickerVisible, currentLocation, setCity } = useLocation();
  const [customCity, setCustomCity] = useState('');

  const handleSelect = (cityName) => {
    setCity(cityName);
    setPickerVisible(false);
    setCustomCity('');
  };

  const handleCustomSubmit = () => {
    if (customCity.trim()) {
      handleSelect(customCity.trim());
    }
  };

  return (
    <Modal
      visible={pickerVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setPickerVisible(false)}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="location" size={20} color={colors.primaryLight} style={{ marginRight: 8 }} />
              <Text style={styles.title}>Select Your Location</Text>
            </View>
            <TouchableOpacity onPress={() => setPickerVisible(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Choose your home city for accurate weather, directions, and transport options.
          </Text>

          {/* Custom City Input */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Type city (e.g. Hyderabad, Ooty...)"
              placeholderTextColor={colors.textMuted}
              value={customCity}
              onChangeText={setCustomCity}
              onSubmitEditing={handleCustomSubmit}
            />
            <TouchableOpacity style={styles.setButton} onPress={handleCustomSubmit}>
              <Text style={styles.setButtonText}>Set</Text>
            </TouchableOpacity>
          </View>

          {/* Popular Cities */}
          <Text style={styles.sectionHeader}>POPULAR DESTINATIONS</Text>
          <ScrollView style={styles.chipsContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.chipsGrid}>
              {POPULAR_CITIES.map((c) => {
                const isSelected = currentLocation?.city?.toLowerCase() === c.name.toLowerCase();
                return (
                  <TouchableOpacity
                    key={c.name}
                    style={[
                      styles.chip,
                      isSelected && styles.chipActive,
                    ]}
                    onPress={() => handleSelect(c.name)}
                  >
                    <Ionicons
                      name={isSelected ? 'radio-button-on' : 'location-outline'}
                      size={14}
                      color={isSelected ? colors.white : colors.primaryLight}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => handleSelect('Nellore')}
          >
            <Ionicons name="refresh" size={16} color={colors.textSecondary} style={{ marginRight: 6 }} />
            <Text style={styles.resetButtonText}>Reset to Nellore, Andhra Pradesh</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialog: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.surfaceBorderLight,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 18,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.white,
    marginRight: 8,
  },
  setButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  setButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  chipsContainer: {
    maxHeight: 200,
  },
  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 8,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryLight,
  },
  chipText: {
    fontSize: 13,
    color: colors.textLight,
    fontWeight: '500',
  },
  chipTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  resetButtonText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
