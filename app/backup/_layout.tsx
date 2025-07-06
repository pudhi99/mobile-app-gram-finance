import { Stack } from 'expo-router';

export default function BackupLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="daily" />
    </Stack>
  );
} 