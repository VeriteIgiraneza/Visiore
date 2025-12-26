import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getStats } from '../../services/api';

const { width } = Dimensions.get('window');

export default function StatsScreen() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${(amount || 0).toFixed(2)}`;
  };

  const getCategoryIcon = (category: string) => {
    const icons: any = {
      Groceries: 'cart',
      Dining: 'restaurant',
      Transportation: 'car',
      Shopping: 'bag',
      Healthcare: 'medical',
      Entertainment: 'film',
      Utilities: 'bulb',
      Other: 'ellipsis-horizontal',
    };
    return icons[category] || 'receipt';
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="stats-chart-outline" size={80} color="#CCC" />
        <Text style={styles.emptyText}>No data available</Text>
      </View>
    );
  }

  // Calculate Year-to-Date Tax (Sum of all monthly tax fields)
  const totalTaxYTD = stats.monthlySpending?.reduce((sum: number, m: any) => sum + (m.totalTax || 0), 0) || 0;

  return (
    <ScrollView style={styles.container}>
      {/* 1. Overview Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Spending</Text>
          <Text style={styles.totalAmount}>{formatCurrency(stats.totalSpending)}</Text>
        </View>
        <View style={[styles.totalCard, { backgroundColor: '#FF9500' }]}>
          <Text style={styles.totalLabel}>Total Tax YTD</Text>
          <Text style={styles.totalAmount}>{formatCurrency(totalTaxYTD)}</Text>
        </View>
      </View>

      {/* 2. Spending by Time of Day (New) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Spending Habits by Time</Text>
        <View style={styles.timeGrid}>
          {['Morning', 'Afternoon', 'Evening', 'Night'].map((time) => (
            <View key={time} style={styles.timeBox}>
              <Text style={styles.timeLabel}>{time}</Text>
              <Text style={styles.timeValue}>{formatCurrency(stats.timeOfDayBreakdown?.[time.toLowerCase()] || 0)}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 3. Category Breakdown with Percentage Bars */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Spending by Category</Text>
        {stats.categoryBreakdown.map((category: any) => {
          const percentage = (category.total / stats.totalSpending) * 100;
          return (
            <View key={category._id} style={styles.categoryItem}>
              <View style={styles.categoryHeader}>
                <View style={styles.categoryTitleContainer}>
                  <Ionicons name={getCategoryIcon(category._id)} size={20} color="#007AFF" />
                  <Text style={styles.categoryName}>{category._id}</Text>
                </View>
                <Text style={styles.categoryAmount}>{formatCurrency(category.total)}</Text>
              </View>
              <View style={styles.categoryBarContainer}>
                <View style={[styles.categoryBar, { width: `${percentage}%` }]} />
              </View>
            </View>
          );
        })}
      </View>

      {/* 4. Monthly Tax & Spend List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Monthly Tax Breakdown</Text>
        {stats.monthlySpending.map((month: any) => (
          <View key={`${month._id.year}-${month._id.month}`} style={styles.monthItem}>
            <View>
              <Text style={styles.monthName}>{month._id.month}/{month._id.year}</Text>
              <Text style={styles.monthSub}>Tax: {formatCurrency(month.totalTax)}</Text>
            </View>
            <Text style={styles.monthAmount}>{formatCurrency(month.total)}</Text>
          </View>
        ))}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  summaryContainer: { flexDirection: 'row', padding: 10, gap: 10 },
  totalCard: { 
    flex: 1, 
    backgroundColor: '#007AFF', 
    padding: 20, 
    borderRadius: 16, 
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5
  },
  totalLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase' },
  totalAmount: { fontSize: 22, fontWeight: 'bold', color: 'white', marginTop: 4 },
  section: { backgroundColor: 'white', margin: 15, padding: 20, borderRadius: 12, elevation: 2 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  timeBox: { width: '47%', backgroundColor: '#F8F9FA', padding: 15, borderRadius: 10 },
  timeLabel: { fontSize: 12, color: '#666' },
  timeValue: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  categoryItem: { marginBottom: 15 },
  categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  categoryTitleContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  categoryName: { fontSize: 14, fontWeight: '600' },
  categoryAmount: { fontSize: 14, fontWeight: 'bold', color: '#007AFF' },
  categoryBarContainer: { height: 6, backgroundColor: '#EEE', borderRadius: 3 },
  categoryBar: { height: '100%', backgroundColor: '#007AFF', borderRadius: 3 },
  monthItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  monthName: { fontSize: 15, fontWeight: '600' },
  monthSub: { fontSize: 12, color: '#FF9500' },
  monthAmount: { fontSize: 16, fontWeight: 'bold' },
  emptyText: { marginTop: 15, color: '#999' }
});