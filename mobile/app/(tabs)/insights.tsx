import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function InsightsScreen() {
  const [search, setSearch] = useState('');

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Price Intelligence</Text>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput 
            placeholder="Search product (e.g. Milk)" 
            style={styles.input}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Frequent Purchases Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Most Frequently Bought</Text>
        <View style={styles.itemRow}>
          <Text style={styles.itemName}>1. Avocado</Text>
          <Text style={styles.itemCount}>14 times</Text>
        </View>
        <View style={styles.itemRow}>
          <Text style={styles.itemName}>2. Eggs (Large)</Text>
          <Text style={styles.itemCount}>9 times</Text>
        </View>
      </View>

      {/* Price Trend Placeholder */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Price Trend: {search || 'Select Item'}</Text>
        <View style={styles.chartPlaceholder}>
          <Text style={styles.placeholderText}>Line Chart Visualization Here</Text>
          <Text style={styles.trendText}>📈 Trending +4% this month</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { padding: 20, backgroundColor: 'white', borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 15 },
  searchBar: { flexDirection: 'row', backgroundColor: '#F0F0F0', padding: 12, borderRadius: 10, alignItems: 'center', gap: 10 },
  input: { flex: 1, fontSize: 16 },
  card: { backgroundColor: 'white', margin: 15, padding: 20, borderRadius: 12, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  itemName: { fontSize: 15, color: '#333' },
  itemCount: { fontSize: 14, fontWeight: 'bold', color: '#007AFF' },
  chartPlaceholder: { height: 150, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA', borderRadius: 10 },
  placeholderText: { color: '#999', fontSize: 14 },
  trendText: { marginTop: 10, color: '#FF3B30', fontWeight: 'bold' }
});