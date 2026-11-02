import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { authApi } from '../api/endpoints';

export const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const handleReset = async () => {
    if (!email.trim() || !newPassword) {
      setStatusMsg({ type: 'error', text: 'Please enter your email and new password' });
      return;
    }
    if (newPassword.length < 6) {
      setStatusMsg({ type: 'error', text: 'New password must be at least 6 characters' });
      return;
    }

    setLoading(true);
    setStatusMsg({ type: '', text: '' });

    try {
      const res = await authApi.resetPassword(email.trim(), newPassword);
      if (res && res.status === 'success') {
        setStatusMsg({ type: 'success', text: 'Password reset successfully! You can now sign in.' });
        setTimeout(() => navigation.navigate('Login'), 1800);
      } else {
        setStatusMsg({ type: 'error', text: res?.message || 'Password reset failed' });
      }
    } catch (e) {
      setStatusMsg({ type: 'error', text: 'Network error connecting to API' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={20} color={colors.white} />
      </TouchableOpacity>

      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Ionicons name="key" size={28} color={colors.primaryLight} />
        </View>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>Enter your registered email and set a new password</Text>
      </View>

      {!!statusMsg.text && (
        <View
          style={[
            styles.msgBox,
            statusMsg.type === 'success' ? styles.msgBoxSuccess : styles.msgBoxError,
          ]}
        >
          <Ionicons
            name={statusMsg.type === 'success' ? 'checkmark-circle' : 'alert-circle'}
            size={18}
            color={statusMsg.type === 'success' ? colors.statusSuccess : colors.statusError}
            style={{ marginRight: 8 }}
          />
          <Text
            style={[
              styles.msgText,
              statusMsg.type === 'success' ? styles.msgTextSuccess : styles.msgTextError,
            ]}
          >
            {statusMsg.text}
          </Text>
        </View>
      )}

      <View style={styles.form}>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Registered Email</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={18} color={colors.textMuted} style={{ marginRight: 10 }} />
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>New Password</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} style={{ marginRight: 10 }} />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={colors.textMuted}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleReset}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={styles.submitBtnText}>Update Password</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.white,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  msgBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 18,
  },
  msgBoxSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  msgBoxError: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  msgText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  msgTextSuccess: {
    color: colors.statusSuccess,
  },
  msgTextError: {
    color: colors.statusError,
  },
  form: {
    gap: 16,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textLight,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
  },
  input: {
    flex: 1,
    color: colors.white,
    fontSize: 14,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
});
