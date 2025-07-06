import { Stack } from 'expo-router';

export default function LoanLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="new" />
      <Stack.Screen name="payment-history" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
} 