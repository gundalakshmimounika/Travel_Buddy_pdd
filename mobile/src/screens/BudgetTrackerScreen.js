import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { budgetApi } from '../api/endpoints';

const EXPENSE_CATEGORIES = ['Transport', 'Stay', 'Food', 'Activities', 'Shopping', 'Other'];

export const BudgetTrackerScreen = ({ route, navigation }) => {
  const { tripName = 'Pondicherry Trip' } = route.params || {};

  const [budgetLimit, setBudgetLimit] = useState(20000);
  const [expenses, setExpenses] = useState([
    { id: 1, category: 'Stay', amount: 5500, description: 'Hotel Advance', date: 'Today' },
    { id: 2, category: 'Transport', amount: 1800, description: 'Express Train Tickets', date: 'Yesterday' },
    { id: 3, category: 'Food', amount: 950, description: 'French Quarter Cafe', date: 'Yesterday' },
  ]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [newCategory, setNewCategory] = useState('Food');
  const [newAmount, setNewAmount] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const totalSpent = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const remaining = Math.max(0, budgetLimit - totalSpent);
  const percentage = Math.min(100, Math.round((totalSpent / (budgetLimit || 1)) * 100));

  useEffect(() => {
    fetchBudget();
  }, [tripName]);

  const fetchBudget = async () => {
    setLoading(true);
    try {
      const res = await budgetApi.getBudget(tripName);
      if (res && res.status === 'success') {
        if (res.limit) setBudgetLimit(Number(res.limit));
        if (Array.isArray(res.expenses)) setExpenses(res.expenses);
      }
    } catch (e) {
      console.warn('Budget fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async () => {
    const amt = parseFloat(newAmount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid expense amount.');
      return;
    }

    const newExp = {
      id: Date.now(),
      category: newCategory,
      amount: amt,
      description: newDesc.trim() || newCategory,
      date: 'Just now',
    };

    setExpenses([newExp, ...expenses]);
    setNewAmount('');
    setNewDesc('');

    try {
      await budgetApi.addExpense(tripName, newCategory, amt, newDesc.trim());
    } catch (e) {
      // Local addition remains
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Budget • {tripName}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Overview Card */}
        <View style={styles.overviewCard}>
          <Text style={styles.overviewLabel}>TOTAL SPENT</Text>
          <Text style={styles.spentAmount}>₹{totalSpent.toLocaleString()}</Text>

          {/* Progress Bar */}
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${percentage}%` },
                percentage > 85 ? { backgroundColor: colors.accentRose } : null,
              ]}
            />
          </View>

          <View style={styles.limitRow}>
            <View>
              <Text style={styles.limitLabel}>Budget Limit</Text>
              <Text style={styles.limitValue}>₹{budgetLimit.toLocaleString()}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.limitLabel}>Remaining</Text>
              <Text style={[styles.limitValue, { color: colors.accentEmerald }]}>
                ₹{remaining.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Add Expense Form */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Add New Expense</Text>

          {/* Category Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catChipsScroll}>
            {EXPENSE_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.catChip, newCategory === cat && styles.catChipActive]}
                onPress={() => setNewCategory(cat)}
              >
                <Text style={[styles.catChipText, newCategory === cat && styles.catChipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { width: 110 }]}
              placeholder="₹ Amount"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={newAmount}
              onChangeText={setNewAmount}
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Description (e.g. Dinner)"
              placeholderTextColor={colors.textMuted}
              value={newDesc}
              onChangeText={setNewDesc}
            />
          </View>

          <TouchableOpacity style={styles.addBtn} onPress={handleAddExpense}>
            <Ionicons name="add" size={18} color={colors.white} style={{ marginRight: 6 }} />
            <Text style={styles.addBtnText}>Record Expense</Text>
          </TouchableOpacity>
        </View>

        {/* Expense History */}
        <Text style={styles.sectionHeader}>EXPENSE BREAKDOWN</Text>
        {expenses.map((exp) => (
          <View key={exp.id} style={styles.expenseItem}>
            <View style={styles.expLeft}>
              <View style={styles.expIconWrapper}>
                <Ionicons name="receipt-outline" size={18} color={colors.primaryLight} />
              </View>
              <View>
                <Text style={styles.expTitle}>{exp.description || exp.category}</Text>
                <Text style={styles.expMeta}>{exp.category} • {exp.date}</Text>
              </View>
            </View>
            <Text style={styles.expAmount}>₹{Number(exp.amount).toLocaleString()}</Text>
          </View>
        ))}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
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
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.white,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 36,
  },
  overviewCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.surfaceBorderLight,
    padding: 20,
    marginBottom: 20,
  },
  overviewLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.8,
  },
  spentAmount: {
    fontSize: 34,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: -1,
    marginVertical: 6,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primaryLight,
    borderRadius: 4,
  },
  limitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  limitLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  limitValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
    marginTop: 2,
  },
  formCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 18,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 12,
  },
  catChipsScroll: {
    marginBottom: 12,
  },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  catChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryLight,
  },
  catChipText: {
    fontSize: 12,
    color: colors.textLight,
  },
  catChipTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  input: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.white,
    fontSize: 13,
  },
  addBtn: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 14,
    marginBottom: 10,
  },
  expLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  expIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  expTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  expMeta: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  expAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
});
