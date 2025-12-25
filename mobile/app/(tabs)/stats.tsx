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
//sd
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

  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
  };

  const getCategoryIcon = (category) => {
    const icons = {
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

  const getMonthName = (month) => {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return months[month - 1];
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

  const maxCategoryAmount = Math.max(
    ...stats.categoryBreakdown.map((c) => c.total),
    1
  );

  return (
    <ScrollView style={styles.container}>
      {/* Total Spending Card */}
      <View style={styles.totalCard}>
        <Ionicons name="wallet" size={40} color="#007AFF" />
        <Text style={styles.totalLabel}>Total Spending</Text>
        <Text style={styles.totalAmount}>
          {formatCurrency(stats.totalSpending)}
        </Text>
      </View>

      {/* Category Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Spending by Category</Text>
        {stats.categoryBreakdown.length === 0 ? (
          <Text style={styles.noDataText}>No category data available</Text>
        ) : (
          stats.categoryBreakdown.map((category) => {
            const percentage = (category.total / stats.totalSpending) * 100;
            const barWidth = (category.total / maxCategoryAmount) * (width - 80);

            return (
              <View key={category._id} style={styles.categoryItem}>
                <View style={styles.categoryHeader}>
                  <View style={styles.categoryTitleContainer}>
                    <Ionicons
                      name={getCategoryIcon(category._id)}
                      size={20}
                      color="#007AFF"
                    />
                    <Text style={styles.categoryName}>{category._id}</Text>
                  </View>
                  <Text style={styles.categoryAmount}>
                    {formatCurrency(category.total)}
                  </Text>
                </View>
                <View style={styles.categoryBarContainer}>
                  <View
                    style={[styles.categoryBar, { width: barWidth }]}
                  />
                </View>
                <Text style={styles.categoryDetails}>
                  {category.count} receipt{category.count !== 1 ? 's' : ''} •{' '}
                  {percentage.toFixed(1)}%
                </Text>
              </View>
            );
          })
        )}
      </View>

      {/* Monthly Spending */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Monthly Spending</Text>
        {stats.monthlySpending.length === 0 ? (
          <Text style={styles.noDataText}>No monthly data available</Text>
        ) : (
          stats.monthlySpending.slice(0, 6).map((month) => (
            <View key={`${month._id.year}-${month._id.month}`} style={styles.monthItem}>
              <View style={styles.monthInfo}>
                <Text style={styles.monthName}>
                  {getMonthName(month._id.month)} {month._id.year}
                </Text>
                <Text style={styles.monthCount}>
                  {month.count} receipt{month.count !== 1 ? 's' : ''}
                </Text>
              </View>
              <Text style={styles.monthAmount}>
                {formatCurrency(month.total)}
              </Text>
            </View>
          ))
        )}
      </View>

      {/* Top Merchants */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Merchants</Text>
        {stats.topMerchants.length === 0 ? (
          <Text style={styles.noDataText}>No merchant data available</Text>
        ) : (
          stats.topMerchants.slice(0, 5).map((merchant, index) => (
            <View key={merchant._id} style={styles.merchantItem}>
              <View style={styles.merchantRank}>
                <Text style={styles.rankNumber}>{index + 1}</Text>
              </View>
              <View style={styles.merchantInfo}>
                <Text style={styles.merchantName}>{merchant._id}</Text>
                <Text style={styles.merchantCount}>
                  {merchant.count} visit{merchant.count !== 1 ? 's' : ''}
                </Text>
              </View>
              <Text style={styles.merchantAmount}>
                {formatCurrency(merchant.total)}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  totalCard: {
    backgroundColor: '#007AFF',
    margin: 15,
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  totalLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 10,
  },
  totalAmount: {
    fontSize: 42,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 5,
  },
  section: {
    backgroundColor: 'white',
    margin: 15,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
  },
  categoryItem: {
    marginBottom: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  categoryBarContainer: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  categoryBar: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  categoryDetails: {
    fontSize: 12,
    color: '#666',
  },
  monthItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  monthInfo: {
    flex: 1,
  },
  monthName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  monthCount: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  monthAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  merchantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  merchantRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  merchantInfo: {
    flex: 1,
  },
  merchantName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  merchantCount: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  merchantAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 15,
  },
  noDataText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
});