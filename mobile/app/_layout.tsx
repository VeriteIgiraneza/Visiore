import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack>
        <Stack.Screen 
          name="(tabs)" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="receipt/[id]" 
          options={{ 
            title: 'Receipt Details',
            headerBackTitle: 'Back'
          }} 
        />
      </Stack>
    </SafeAreaProvider>
  );
}
// mobile/app/_layout.tsx