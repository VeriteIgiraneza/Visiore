import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#E5E5E5',
          // Removed manual height to let Safe Area handle the home bar
        },
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      {/* 1. Scan Tab (The Index) */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Scan',
          tabBarLabel: 'Scan',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'camera' : 'camera-outline'} size={24} color={color} />
          ),
        }}
      />

      {/* 2. Receipts Tab (The List) */}
      <Tabs.Screen
        name="receipts"
        options={{
          title: 'My Receipts',
          tabBarLabel: 'History',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'receipt' : 'receipt-outline'} size={24} color={color} />
          ),
        }}
      />

      {/* 3. Stats Tab (Analytics) */}
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Spending Stats',
          tabBarLabel: 'Stats',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'stats-chart' : 'stats-chart-outline'} size={24} color={color} />
          ),
        }}
      />

      {/* 4. Insights Tab (New: Price Tracker) */}
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Price Insights',
          tabBarLabel: 'Insights',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'analytics' : 'analytics-outline'} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}