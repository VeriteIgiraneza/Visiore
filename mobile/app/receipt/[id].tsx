import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getReceiptById, updateReceipt, deleteReceipt } from '../../services/api';

export default function ReceiptDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReceipt();
  }, [id]);

  const loadReceipt = async () => {
    try {
      const response = await getReceiptById(id);
      setReceipt(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load receipt');
      console.error(error);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Receipt',
      'Are you sure you want to delete this receipt?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteReceipt(id);
              Alert.alert('Success', 'Receipt deleted');
              router.back();
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
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!receipt) {
    return (
      <View style={styles.centerContainer}>
        <Text>Receipt not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Receipt Image */}
      {receipt.imageBase64 && (
        <Image
          source={{ uri: `data:image/jpeg;base64,${receipt.imageBase64}` }}
          style={styles.receiptImage}
          resizeMode="contain"
        />
      )}

      {/* Main Info Card */}
      <View style={styles.card}>
        <Text style={styles.merchant}>{receipt.merchant}</Text>
        <Text style={styles.date}>{formatDate(receipt.date)}</Text>
        
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalAmount}>{formatCurrency(receipt.total)}</Text>
        </View>

        <View style={styles.badges}>
          <View style={styles.badge}>
            <Ionicons name="pricetag" size={16} color="#007AFF" />
            <Text style={styles.badgeText}>{receipt.category}</Text>
          </View>
          <View style={styles.badge}>
            <Ionicons name="card" size={16} color="#007AFF" />
            <Text style={styles.badgeText}>{receipt.paymentMethod}</Text>
          </View>
        </View>
      </View>

      {/* Price Breakdown */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Price Breakdown</Text>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Subtotal</Text>
          <Text style={styles.breakdownValue}>
            {formatCurrency(receipt.subtotal || receipt.total)}
          </Text>
        </View>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Tax</Text>
          <Text style={styles.breakdownValue}>{formatCurrency(receipt.tax)}</Text>
        </View>
        <View style={[styles.breakdownRow, styles.breakdownTotal]}>
          <Text style={styles.breakdownTotalLabel}>Total</Text>
          <Text style={styles.breakdownTotalValue}>
            {formatCurrency(receipt.total)}
          </Text>
        </View>
      </View>

      {/* Items List */}
      {receipt.items && receipt.items.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Items ({receipt.items.length})</Text>
          {receipt.items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                {item.quantity > 1 && (
                  <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                )}
              </View>
              <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Notes */}
      {receipt.notes && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Notes</Text>
          <Text style={styles.notes}>{receipt.notes}</Text>
        </View>
      )}

      {/* Tags */}
      {receipt.tags && receipt.tags.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tags</Text>
          <View style={styles.tags}>
            {receipt.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Delete Button */}
      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Ionicons name="trash" size={20} color="white" />
        <Text style={styles.deleteButtonText}>Delete Receipt</Text>
      </TouchableOpacity>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}
//as

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
  receiptImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#000',
  },
  card: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  merchant: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  date: {
    fontSize: 15,
    color: '#666',
    marginBottom: 20,
  },
  totalContainer: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  totalLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 5,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  badges: {
    flexDirection: 'row',
    gap: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 5,
  },
  badgeText: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '500',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  breakdownLabel: {
    fontSize: 15,
    color: '#666',
  },
  breakdownValue: {
    fontSize: 15,
    color: '#000',
    fontWeight: '500',
  },
  breakdownTotal: {
    borderBottomWidth: 0,
    paddingTop: 12,
    marginTop: 8,
  },
  breakdownTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  breakdownTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    color: '#000',
    marginBottom: 2,
  },
  itemQuantity: {
    fontSize: 13,
    color: '#666',
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  notes: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 13,
    color: '#333',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 15,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 30,
  },
});