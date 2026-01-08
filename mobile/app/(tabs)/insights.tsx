import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from "react-native-chart-kit";
import api from '../../services/api';

const { width } = Dimensions.get('window');

export default function InsightsScreen() {
  const [search, setSearch] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async (text: string) => {
    setSearch(text);
    if (text.length < 2) {
      setHistory([]);
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/receipts/item-history?itemName=${text}`);
      if (response.data.success) {
        setHistory(response.data.data);
      }
    } catch (error) {
      console.error('❌ Insight Search Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLowestPrice = () => {
    if (history.length === 0) return 0;
    return Math.min(...history.map(item => item.price));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Price Intelligence</Text>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            placeholder="Search product (e.g. Milk, Eggs)"
            style={styles.input}
            value={search}
            onChangeText={fetchHistory}
            autoCapitalize="none"
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loaderText}>Analyzing price trends...</Text>
        </View>
      ) : (
        <View style={styles.content}>
          {history.length > 0 ? (
            <>
              {/* Purchase Summary */}
              <View style={styles.summaryCard}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Times Bought</Text>
                  <Text style={styles.statValue}>{history.length}</Text>
                </View>
                <View style={[styles.statBox, { borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.3)' }]}>
                  <Text style={styles.statLabel}>Best Price</Text>
                  <Text style={styles.statValue}>${getLowestPrice().toFixed(2)}</Text>
                </View>
              </View>

              {/* Price Trend Chart */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Price Trend</Text>
                {history.length > 1 ? (
                  <LineChart
                    data={{
                      labels: history.map(item => new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
                      datasets: [{ data: history.map(item => item.price) }]
                    }}
                    width={width - 60}
                    height={200}
                    chartConfig={{
                      backgroundColor: "#fff",
                      backgroundGradientFrom: "#fff",
                      backgroundGradientTo: "#fff",
                      decimalPlaces: 2,
                      color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                      propsForDots: { r: "5", strokeWidth: "2", stroke: "#007AFF" }
                    }}
                    bezier
                    style={{ marginVertical: 8, borderRadius: 16 }}
                  />
                ) : (
                  <View style={styles.chartPlaceholder}>
                    <Text style={styles.placeholderText}>Need at least 2 purchases to show a trend</Text>
                  </View>
                )}
              </View>

              {/* Detailed History List */}
              <View style={[styles.card, { marginTop: 15 }]}>
                <Text style={styles.cardTitle}>History Details</Text>
                {history.map((item, index) => (
                  <View key={index} style={styles.itemRow}>
                    <View style={styles.itemMain}>
                      <Text style={styles.merchantName}>{item.merchant}</Text>
                      <Text style={styles.itemDate}>{new Date(item.date).toLocaleDateString()}</Text>
                    </View>
                    <View style={styles.priceContainer}>
                      <Text style={styles.priceText}>${item.price.toFixed(2)}</Text>
                      {item.price === getLowestPrice() && (
                        <View style={styles.bestPriceBadge}>
                          <Text style={styles.bestPriceText}>BEST</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="analytics-outline" size={80} color="#DDD" />
              <Text style={styles.emptyText}>
                {search.length > 1 
                  ? `No history found for "${search}"` 
                  : "Search for an item to see its price history and trends"}
              </Text>
            </View>
          )}
        </View>
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { padding: 20, backgroundColor: 'white', borderBottomLeftRadius: 24, borderBottomRightRadius: 24, elevation: 3 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 15 },
  searchBar: { flexDirection: 'row', backgroundColor: '#F2F2F7', padding: 12, borderRadius: 12, alignItems: 'center', gap: 10 },
  input: { flex: 1, fontSize: 16, color: '#000' },
  content: { padding: 15 },
  summaryCard: { flexDirection: 'row', backgroundColor: '#007AFF', borderRadius: 16, padding: 20, marginBottom: 15 },
  statBox: { flex: 1, alignItems: 'center' },
  statLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '600' },
  statValue: { color: 'white', fontSize: 24, fontWeight: 'bold', marginTop: 4 },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 20, elevation: 2 },
  cardTitle: { fontSize: 17, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 10 },
  chartPlaceholder: { height: 100, justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: '#8E8E93', textAlign: 'center' },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F2F2F7' },
  itemMain: { flex: 1 },
  merchantName: { fontSize: 15, fontWeight: '600' },
  itemDate: { fontSize: 13, color: '#8E8E93' },
  priceContainer: { alignItems: 'flex-end' },
  priceText: { fontSize: 16, fontWeight: 'bold', color: '#007AFF' },
  bestPriceBadge: { backgroundColor: '#34C759', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
  bestPriceText: { color: 'white', fontSize: 9, fontWeight: 'bold' },
  loaderContainer: { marginTop: 100, alignItems: 'center' },
  loaderText: { marginTop: 10, color: '#8E8E93' },
  emptyContainer: { marginTop: 80, alignItems: 'center', paddingHorizontal: 40 },
  emptyText: { textAlign: 'center', color: '#8E8E93', fontSize: 15, marginTop: 15 },
});