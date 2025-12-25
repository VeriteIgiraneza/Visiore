import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getReceipts, deleteReceipt } from '../../services/api';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';

export default function ReceiptsScreen() {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const loadReceipts = async () => {
    try {
      const response = await getReceipts();
      setReceipts(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load receipts');
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadReceipts();
  }, []);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadReceipts();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadReceipts();
  };

  const handleDelete = (id, merchant) => {
    Alert.alert(
      'Delete Receipt',
      `Are you sure you want to delete the receipt from ${merchant}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteReceipt(id);
              setReceipts(receipts.filter((r) => r._id !== id));
              Alert.alert('Success', 'Receipt deleted');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete receipt');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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

  const renderReceipt = ({ item }) => (
    <TouchableOpacity
      style={styles.receiptCard}
      onPress={() => router.push(`/receipt/${item._id}`)}
    >
      <View style={styles.receiptHeader}>
        <View style={styles.receiptIconContainer}>
          <Ionicons name={getCategoryIcon(item.category)} size={24} color="#007AFF" />
        </View>
        <View style={styles.receiptInfo}>
          <Text style={styles.merchant} numberOfLines={1}>
            {item.merchant}
          </Text>
          <Text style={styles.date}>{formatDate(item.date)}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        </View>
        <View style={styles.receiptAmount}>
          <Text style={styles.amount}>{formatCurrency(item.total)}</Text>
          <TouchableOpacity
            onPress={() => handleDelete(item._id, item.merchant)}
            style={styles.deleteButton}
          >
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="receipt-outline" size={80} color="#CCC" />
      <Text style={styles.emptyText}>No receipts yet</Text>
      <Text style={styles.emptySubtext}>Start by scanning your first receipt</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{receipts.length}</Text>
          <Text style={styles.summaryLabel}>Total Receipts</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>
            {formatCurrency(receipts.reduce((sum, r) => sum + r.total, 0))}
          </Text>
          <Text style={styles.summaryLabel}>Total Spent</Text>
        </View>
      </View>

      <FlatList
        data={receipts}
        renderItem={renderReceipt}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
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
  summaryCard: {
    backgroundColor: 'white',
    flexDirection: 'row',
    padding: 20,
    margin: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 15,
  },
  listContent: {
    padding: 15,
    paddingTop: 0,
  },
  receiptCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  receiptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  receiptIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  receiptInfo: {
    flex: 1,
  },
  merchant: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  receiptAmount: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  deleteButton: {
    padding: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
});
//d