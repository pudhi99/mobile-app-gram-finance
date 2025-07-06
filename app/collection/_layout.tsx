import { Stack } from 'expo-router';

export default function CollectionLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="new" />
      <Stack.Screen name="history" />
      <Stack.Screen name="schedule" />
      <Stack.Screen name="select-loan" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
} 