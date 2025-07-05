import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeContext } from '@/contexts/ThemeContext';
import { router } from 'expo-router';

interface ProfileItem {
  label: string;
  value: string;
  icon: string;
  editable: boolean;
  key?: 'name' | 'email' | 'phone';
}

interface ProfileSection {
  title: string;
  items: ProfileItem[];
}

export default function ProfileScreen() {
  const { theme } = useThemeContext();
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    });
    setIsEditing(false);
  };

  const profileSections: ProfileSection[] = [
    {
      title: 'Personal Information',
      items: [
        {
          label: 'Full Name',
          value: formData.name,
          icon: 'person',
          editable: true,
          key: 'name',
        },
        {
          label: 'Email',
          value: formData.email,
          icon: 'mail',
          editable: true,
          key: 'email',
        },
        {
          label: 'Phone',
          value: formData.phone,
          icon: 'call',
          editable: true,
          key: 'phone',
        },
      ],
    },
    {
      title: 'Account Information',
      items: [
        {
          label: 'User ID',
          value: user?.id || 'N/A',
          icon: 'id-card',
          editable: false,
        },
        {
          label: 'Role',
          value: user?.role || 'COLLECTOR',
          icon: 'shield-checkmark',
          editable: false,
        },
        {
          label: 'Member Since',
          value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
          icon: 'calendar',
          editable: false,
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Profile</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setIsEditing(!isEditing)}
        >
          <Text style={[styles.editText, { color: theme.primary }]}>
            {isEditing ? 'Cancel' : 'Edit'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Avatar */}
        <View style={[styles.avatarSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
            <Ionicons name="person" size={40} color={theme.buttonText} />
          </View>
          <Text style={[styles.userName, { color: theme.text }]}>
            {user?.name || 'User'}
          </Text>
          <Text style={[styles.userRole, { color: theme.textSecondary }]}>
            {user?.role || 'COLLECTOR'}
          </Text>
        </View>

        {/* Profile Sections */}
        {profileSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              {section.title}
            </Text>
            <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              {section.items.map((item, itemIndex) => (
                <View key={itemIndex} style={styles.profileItem}>
                  <View style={styles.itemLeft}>
                    <View style={[styles.itemIcon, { backgroundColor: theme.primary + '20' }]}>
                      <Ionicons name={item.icon as any} size={20} color={theme.primary} />
                    </View>
                    <View style={styles.itemContent}>
                      <Text style={[styles.itemLabel, { color: theme.textSecondary }]}>
                        {item.label}
                      </Text>
                      {isEditing && item.editable ? (
                        <TextInput
                          style={[styles.textInput, { 
                            color: theme.text, 
                            borderColor: theme.border,
                            backgroundColor: theme.background 
                          }]}
                          value={item.value}
                          onChangeText={(text) => {
                            if (item.key) {
                              setFormData(prev => ({ ...prev, [item.key as keyof typeof formData]: text }));
                            }
                          }}
                          placeholder={`Enter ${item.label.toLowerCase()}`}
                          placeholderTextColor={theme.textMuted}
                        />
                      ) : (
                        <Text style={[styles.itemValue, { color: theme.text }]}>
                          {item.value}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Save Button */}
        {isEditing && (
          <View style={styles.saveSection}>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: theme.primary }]}
              onPress={handleSave}
            >
              <Ionicons name="checkmark" size={20} color={theme.buttonText} />
              <Text style={[styles.saveText, { color: theme.buttonText }]}>
                Save Changes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: theme.border }]}
              onPress={handleCancel}
            >
              <Text style={[styles.cancelText, { color: theme.textSecondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        )}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  editButton: {
    padding: 4,
  },
  editText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  avatarSection: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  profileItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  itemValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  textInput: {
    fontSize: 16,
    fontWeight: '500',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 4,
  },
  saveSection: {
    marginBottom: 24,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  cancelButton: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
  },
}); 