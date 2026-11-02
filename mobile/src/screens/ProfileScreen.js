import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import { getBaseUrl, setBaseUrl } from '../api/client';

export const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { currentLocation, setPickerVisible, setCity } = useLocation();

  const [customApiUrl, setCustomApiUrl] = useState(getBaseUrl());
  const [editingApi, setEditingApi] = useState(false);

  const handleSaveApi = async () => {
    if (customApiUrl.trim()) {
      await setBaseUrl(customApiUrl.trim());
      setEditingApi(false);
      Alert.alert('Backend Updated', `API Endpoint set to: ${customApiUrl.trim()}`);
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out of TravelBuddy?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          navigation.replace('Login');
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={32} color={colors.white} />
          </View>
          <Text style={styles.userName}>{user?.name || 'Traveler'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'guest@travelbuddy.local'}</Text>
          <View style={styles.badgePill}>
            <Text style={styles.badgeText}>
              {user?.isGuest ? 'Guest Traveler' : 'Verified Member'}
            </Text>
          </View>
        </View>

        {/* Location Section */}
        <Text style={styles.sectionHeader}>LOCATION PREFERENCES</Text>
        <View style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => setPickerVisible(true)}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconWrapper, { backgroundColor: 'rgba(37, 99, 235, 0.12)' }]}>
                <Ionicons name="location" size={18} color={colors.primaryLight} />
              </View>
              <View>
                <Text style={styles.menuTitle}>Home City</Text>
                <Text style={styles.menuSubtitle}>
                  {currentLocation?.city || 'Nellore'}, {currentLocation?.state || 'Andhra Pradesh'}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Backend & Cloud Sync Configuration */}
        <Text style={styles.sectionHeader}>BACKEND & DATABASE SYNC</Text>
        <View style={styles.menuCard}>
          <View style={styles.menuRow}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconWrapper, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
                <Ionicons name="server" size={18} color={colors.accentEmerald} />
              </View>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.menuTitle}>Active API Endpoint</Text>
                <Text style={styles.menuSubtitle} numberOfLines={1}>{getBaseUrl()}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setEditingApi(!editingApi)}>
              <Text style={styles.editText}>{editingApi ? 'Close' : 'Configure'}</Text>
            </TouchableOpacity>
          </View>

          {editingApi && (
            <View style={styles.apiEditBox}>
              <TextInput
                style={styles.apiInput}
                value={customApiUrl}
                onChangeText={setCustomApiUrl}
                placeholder="http://10.0.2.2/TravelBuddy/backend/"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
              />
              <View style={styles.apiPresetRow}>
                <TouchableOpacity
                  style={styles.presetBtn}
                  onPress={() => setCustomApiUrl('http://10.0.2.2/TravelBuddy/backend/')}
                >
                  <Text style={styles.presetBtnText}>Android Emulator</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.presetBtn}
                  onPress={() => setCustomApiUrl('http://localhost/TravelBuddy/backend/')}
                >
                  <Text style={styles.presetBtnText}>Web Localhost</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.saveApiBtn} onPress={handleSaveApi}>
                <Text style={styles.saveApiBtnText}>Save API URL</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={[styles.menuRow, { borderTopWidth: 1, borderTopColor: colors.surfaceBorder }]}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconWrapper, { backgroundColor: 'rgba(59, 130, 246, 0.12)' }]}>
                <Ionicons name="cube-outline" size={18} color={colors.primaryLight} />
              </View>
              <View>
                <Text style={styles.menuTitle}>Database Engine</Text>
                <Text style={styles.menuSubtitle}>MySQL (Port 3306) • TravelBuddy DB</Text>
              </View>
            </View>
            <View style={styles.statusOnline}>
              <View style={styles.dotOnline} />
              <Text style={styles.statusOnlineText}>Synced</Text>
            </View>
          </View>
        </View>

        {/* App Info & Sign out */}
        <Text style={styles.sectionHeader}>ACCOUNT</Text>
        <View style={styles.menuCard}>
          <TouchableOpacity style={styles.menuRow} onPress={handleLogout}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconWrapper, { backgroundColor: 'rgba(239, 68, 68, 0.12)' }]}>
                <Ionicons name="log-out-outline" size={18} color={colors.statusError} />
              </View>
              <Text style={[styles.menuTitle, { color: colors.statusError }]}>Sign Out</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.footerInfo}>
          <Text style={styles.appVer}>TravelBuddy React Native Client</Text>
          <Text style={styles.appSub}>Engineered for high performance Android & Web</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.white,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 36,
  },
  userCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 26,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.white,
  },
  userEmail: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  badgePill: {
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryLight,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 6,
  },
  menuCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: 18,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  menuSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  editText: {
    fontSize: 12,
    color: colors.primaryLight,
    fontWeight: '700',
  },
  apiEditBox: {
    backgroundColor: colors.inputBg,
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
    gap: 8,
  },
  apiInput: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: colors.white,
    fontSize: 12,
    fontFamily: 'monospace',
  },
  apiPresetRow: {
    flexDirection: 'row',
    gap: 8,
  },
  presetBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  presetBtnText: {
    fontSize: 11,
    color: colors.textLight,
  },
  saveApiBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  saveApiBtnText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  statusOnline: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  dotOnline: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accentEmerald,
    marginRight: 6,
  },
  statusOnlineText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.accentEmerald,
  },
  footerInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  appVer: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  appSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.2)',
    marginTop: 2,
  },
});
