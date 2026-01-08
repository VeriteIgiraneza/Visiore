import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function VehicleScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.headerCard}>
        <Text style={styles.statsTitle}>Monthly Fuel Spend</Text>
        <Text style={styles.statsAmount}>$0.00</Text>
      </View>
      
      <View style={styles.listSection}>
        <Text style={styles.sectionTitle}>Fuel History</Text>
        {/* We will map your gas receipts here later */}
        <View style={styles.emptyState}>
          <Ionicons name="car-outline" size={50} color="#ccc" />
          <Text style={{color: '#ccc'}}>No gas receipts yet</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20 },
  headerCard: { backgroundColor: '#007AFF', padding: 20, borderRadius: 15, marginBottom: 20 },
  statsTitle: { color: '#fff', opacity: 0.8, fontSize: 14 },
  statsAmount: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  listSection: { flex: 1 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});