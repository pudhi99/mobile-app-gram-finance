import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/contexts/ThemeContext';
import { router } from 'expo-router';
import { apiService } from '@/lib/api';
import { format } from 'date-fns';

export default function DailyBackupScreen() {
  const { theme } = useThemeContext();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [backupStatus, setBackupStatus] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const generateDailyBackup = async () => {
    setIsGenerating(true);
    try {
      const response = await apiService.generateDailyBackup(selectedDate);
      
      if (response.success) {
        Alert.alert(
          'Success',
          `Daily backup generated successfully!\n\nDate: ${response.data.date}\nTotal Collected: ₹${response.data.totalCollected.toLocaleString('en-IN')}\nTotal Payments: ${response.data.totalPayments}`,
          [
            {
              text: 'View Details',
              onPress: () => {
                // Show detailed summary
                showBackupDetails(response.data);
              },
            },
            {
              text: 'OK',
              style: 'default',
            },
          ]
        );
        
        // Check backup status after generation
        checkBackupStatus();
      } else {
        Alert.alert('Error', response.error || 'Failed to generate daily backup');
      }
    } catch (error) {
      console.error('Error generating backup:', error);
      Alert.alert('Error', 'Failed to generate daily backup. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const checkBackupStatus = async () => {
    setIsChecking(true);
    try {
      const response = await apiService.checkBackupStatus(selectedDate);
      
      if (response.success) {
        setBackupStatus(response.data);
      } else {
        Alert.alert('Error', response.error || 'Failed to check backup status');
      }
    } catch (error) {
      console.error('Error checking backup status:', error);
      Alert.alert('Error', 'Failed to check backup status. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  const showBackupDetails = (data: any) => {
    const details = `
📊 Daily Collection Summary

📅 Date: ${data.date}
💰 Total Collected: ₹${data.totalCollected.toLocaleString('en-IN')}
📝 Total Payments: ${data.totalPayments}
📋 Outstanding: ₹${data.totalOutstanding.toLocaleString('en-IN')}

👥 Collectors:
${data.collectors.map((c: any) => `• ${c.name}: ${c.collections} payments (₹${c.amount.toLocaleString('en-IN')})`).join('\n')}

💳 Payment Details:
${data.payments.map((p: any) => `• ${p.loanNumber} - ${p.borrowerName}: ₹${p.amount.toLocaleString('en-IN')} (${p.collectorName})`).join('\n')}
    `;
    
    Alert.alert('Daily Backup Details', details, [
      { text: 'OK', style: 'default' },
    ]);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'EEEE, MMMM d, yyyy');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Daily Backup</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Date Selection */}
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Select Date
          </Text>
          <Text style={[styles.dateText, { color: theme.textSecondary }]}>
            {formatDate(selectedDate)}
          </Text>
          <Text style={[styles.dateSubtext, { color: theme.textMuted }]}>
            This will generate a backup of all collections for this date
          </Text>
        </View>

        {/* Backup Actions */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: theme.primary },
              isGenerating && styles.disabledButton,
            ]}
            onPress={generateDailyBackup}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="cloud-upload" size={24} color="#FFFFFF" />
            )}
            <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>
              {isGenerating ? 'Generating Backup...' : 'Generate Daily Backup'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: theme.background, borderColor: theme.border },
            ]}
            onPress={checkBackupStatus}
            disabled={isChecking}
          >
            {isChecking ? (
              <ActivityIndicator size="small" color={theme.text} />
            ) : (
              <Ionicons name="refresh" size={24} color={theme.text} />
            )}
            <Text style={[styles.actionButtonText, { color: theme.text }]}>
              {isChecking ? 'Checking...' : 'Check Backup Status'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Backup Status */}
        {backupStatus && (
          <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Backup Status
            </Text>
            
            <View style={styles.statusRow}>
              <Text style={[styles.statusLabel, { color: theme.textSecondary }]}>Date:</Text>
              <Text style={[styles.statusValue, { color: theme.text }]}>
                {formatDate(backupStatus.date)}
              </Text>
            </View>
            
            <View style={styles.statusRow}>
              <Text style={[styles.statusLabel, { color: theme.textSecondary }]}>Status:</Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: backupStatus.exists ? theme.success + '20' : theme.warning + '20' }
              ]}>
                <Ionicons
                  name={backupStatus.exists ? 'checkmark-circle' : 'alert-circle'}
                  size={16}
                  color={backupStatus.exists ? theme.success : theme.warning}
                />
                <Text style={[
                  styles.statusBadgeText,
                  { color: backupStatus.exists ? theme.success : theme.warning }
                ]}>
                  {backupStatus.exists ? 'Backed Up' : 'Not Backed Up'}
                </Text>
              </View>
            </View>
            
            {backupStatus.lastUpdated && (
              <View style={styles.statusRow}>
                <Text style={[styles.statusLabel, { color: theme.textSecondary }]}>Last Updated:</Text>
                <Text style={[styles.statusValue, { color: theme.text }]}>
                  {format(new Date(backupStatus.lastUpdated), 'MMM d, yyyy HH:mm')}
                </Text>
              </View>
            )}
            
            {backupStatus.serviceConfigured !== undefined && (
              <View style={styles.statusRow}>
                <Text style={[styles.statusLabel, { color: theme.textSecondary }]}>Service:</Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: backupStatus.serviceConfigured ? theme.success + '20' : theme.primary + '20' }
                ]}>
                  <Ionicons
                    name={backupStatus.serviceConfigured ? 'cloud' : 'laptop'}
                    size={16}
                    color={backupStatus.serviceConfigured ? theme.success : theme.primary}
                  />
                  <Text style={[
                    styles.statusBadgeText,
                    { color: backupStatus.serviceConfigured ? theme.success : theme.primary }
                  ]}>
                    {backupStatus.serviceConfigured ? 'Cloud Backup' : 'Development Mode'}
                  </Text>
                </View>
              </View>
            )}
            
            {backupStatus.status && (
              <Text style={[styles.statusMessage, { color: theme.textMuted }]}>
                {backupStatus.status}
              </Text>
            )}
          </View>
        )}

        {/* Information */}
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            About Daily Backup
          </Text>
          
          <View style={styles.infoItem}>
            <Ionicons name="information-circle" size={20} color={theme.primary} />
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              Daily backups create a complete record of all collections for the selected date
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="cloud" size={20} color={theme.primary} />
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              Data is backed up to Google Sheets for secure storage and easy access
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="shield-checkmark" size={20} color={theme.primary} />
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              Each backup includes payment details, collector information, and summary statistics
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  dateSubtext: {
    fontSize: 14,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  statusMessage: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
}); 