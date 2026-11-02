import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { packingApi } from '../api/endpoints';

const CATEGORIES = ['Clothing', 'Documents', 'Electronics', 'Toiletries', 'Essentials'];

export const PackingListScreen = ({ route, navigation }) => {
  const { tripName = 'Pondicherry Trip' } = route.params || {};

  const [items, setItems] = useState([
    { id: 1, item: 'Aadhar Card / Govt ID', category: 'Documents', status: 1 },
    { id: 2, item: 'Flight / Train Tickets', category: 'Documents', status: 1 },
    { id: 3, item: 'Comfortable Cotton Shirts', category: 'Clothing', status: 0 },
    { id: 4, item: 'Swimwear & Beach Towel', category: 'Clothing', status: 0 },
    { id: 5, item: 'Phone Charger & Power Bank', category: 'Electronics', status: 1 },
    { id: 6, item: 'Sunscreen SPF 50+', category: 'Toiletries', status: 0 },
  ]);

  const [activeCategory, setActiveCategory] = useState('All');
  const [newItemText, setNewItemText] = useState('');
  const [newItemCat, setNewItemCat] = useState('Clothing');
  const [loading, setLoading] = useState(false);

  const completedCount = items.filter((i) => i.status === 1).length;
  const totalCount = items.length;

  useEffect(() => {
    fetchPacking();
  }, [tripName]);

  const fetchPacking = async () => {
    setLoading(true);
    try {
      const res = await packingApi.getItems(tripName);
      if (res && res.status === 'success' && Array.isArray(res.items)) {
        setItems(res.items);
      }
    } catch (e) {
      console.warn('Packing fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (item) => {
    const updatedStatus = item.status === 1 ? 0 : 1;
    setItems(
      items.map((i) => (i.id === item.id ? { ...i, status: updatedStatus } : i))
    );
    try {
      await packingApi.toggleItem(tripName, item.id, updatedStatus);
    } catch (e) {}
  };

  const handleAddItem = async () => {
    if (!newItemText.trim()) return;
    const newItem = {
      id: Date.now(),
      item: newItemText.trim(),
      category: newItemCat,
      status: 0,
    };
    setItems([...items, newItem]);
    setNewItemText('');
    try {
      await packingApi.addItem(tripName, newItem.item, newItem.category);
    } catch (e) {}
  };

  const handleDelete = async (id) => {
    setItems(items.filter((i) => i.id !== id));
    try {
      await packingApi.deleteItem(tripName, id);
    } catch (e) {}
  };

  const filteredItems =
    activeCategory === 'All'
      ? items
      : items.filter((i) => i.category.toLowerCase() === activeCategory.toLowerCase());

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Packing List</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Progress Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryTextCol}>
            <Text style={styles.summaryTitle}>Packing Progress</Text>
            <Text style={styles.summaryCount}>
              {completedCount} of {totalCount} items packed
            </Text>
          </View>
          <View style={styles.percentageCircle}>
            <Text style={styles.percentageText}>
              {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
            </Text>
          </View>
        </View>

        {/* Add Item Bar */}
        <View style={styles.addBar}>
          <TextInput
            style={styles.addInput}
            placeholder="Add packing item..."
            placeholderTextColor={colors.textMuted}
            value={newItemText}
            onChangeText={setNewItemText}
            onSubmitEditing={handleAddItem}
          />
          <TouchableOpacity style={styles.addBtn} onPress={handleAddItem}>
            <Ionicons name="add" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Category Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
          {['All', ...CATEGORIES].map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.filterChip, activeCategory === cat && styles.filterChipActive]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[styles.filterText, activeCategory === cat && styles.filterTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Items List */}
        {filteredItems.map((item) => {
          const isDone = item.status === 1;
          return (
            <View key={item.id} style={styles.itemRow}>
              <TouchableOpacity
                style={styles.itemLeft}
                onPress={() => handleToggle(item)}
              >
                <View style={[styles.checkbox, isDone && styles.checkboxDone]}>
                  {isDone && <Ionicons name="checkmark" size={14} color={colors.white} />}
                </View>
                <View>
                  <Text style={[styles.itemText, isDone && styles.itemTextDone]}>
                    {item.item}
                  </Text>
                  <Text style={styles.itemCat}>{item.category}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => handleDelete(item.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="trash-outline" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          );
        })}
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
  summaryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.surfaceBorderLight,
    padding: 18,
    marginBottom: 16,
  },
  summaryTextCol: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.white,
  },
  summaryCount: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  percentageCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primaryLight,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.white,
  },
  addBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  addInput: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.white,
    fontSize: 14,
  },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersScroll: {
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: colors.surfaceElevated,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryLight,
  },
  filterText: {
    fontSize: 12,
    color: colors.textLight,
  },
  filterTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  itemRow: {
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
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: colors.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxDone: {
    backgroundColor: colors.accentEmerald,
    borderColor: colors.accentEmerald,
  },
  itemText: {
    fontSize: 14,
    color: colors.white,
    fontWeight: '500',
  },
  itemTextDone: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  itemCat: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
});
