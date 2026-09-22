import { useCallback, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Alert,
  TextInput,
  Pressable,
  ScrollView,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { COLORS } from '@/constants/colors';
import { useAuth, signOut } from '@/lib/auth';
import { getProfile, updateProfile, type Profile } from '@/lib/profile';

export default function ProfileScreen() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  const [draftName, setDraftName] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const router = useRouter();

  const loadProfile = useCallback(async () => {
    if (!user) return;

    const p = await getProfile(user.id);

    setProfile(p);
    setDraftName(p?.full_name ?? '');
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  const handleSaveName = async () => {
    if (!user) return;

    const trimmedName = draftName.trim();

    if (!trimmedName) {
      Alert.alert('Name Required', 'Please enter your name.');
      return;
    }

    setSaving(true);

    const { error } = await updateProfile(user.id, {
      full_name: trimmedName,
    });

    setSaving(false);

    if (error) {
      Alert.alert('Error', error);
      return;
    }

    setProfile((prev) =>
      prev
        ? {
            ...prev,
            full_name: trimmedName,
          }
        : prev
    );

    setEditing(false);
  };

  const handleSignOut = async () => {
    setLoading(true);

    try {
      await signOut();
      router.replace('/login');
    } catch (err: any) {
      Alert.alert(
        'Sign Out Failed',
        err?.message || 'Failed to sign out.'
      );
    } finally {
      setLoading(false);
    }
  };

  const isTeacher = profile?.role === 'teacher';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>My Profile</Text>

        <Text style={styles.subtitle}>
          Manage your account information
        </Text>
      </View>

      {user && (
        <>
          {/* PROFILE CARD */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardTitle}>
                  Personal Information
                </Text>

                <Text style={styles.cardSubtitle}>
                  Your account details
                </Text>
              </View>

              <Ionicons
                name="person-circle-outline"
                size={28}
                color={COLORS.primary}
              />
            </View>

            {/* ROLE */}
            <View style={styles.infoItem}>
              <Text style={styles.label}>ROLE</Text>

              <View
                style={[
                  styles.roleBadge,
                  isTeacher
                    ? styles.teacherBadge
                    : styles.studentBadge,
                ]}
              >
                <Text style={styles.roleBadgeText}>
                  {isTeacher ? 'Teacher' : 'Student'}
                </Text>
              </View>
            </View>

            {/* NAME */}
            <View style={styles.infoItem}>
              <Text style={styles.label}>FULL NAME</Text>

              {editing ? (
                <View style={styles.editContainer}>
                  <TextInput
                    value={draftName}
                    onChangeText={setDraftName}
                    style={styles.nameInput}
                    placeholder="Enter your name"
                    placeholderTextColor={COLORS.textSecondary}
                    autoFocus
                  />

                  <View style={styles.editButtons}>
                    <Pressable
                      onPress={() => {
                        setDraftName(profile?.full_name ?? '');
                        setEditing(false);
                      }}
                      disabled={saving}
                      style={styles.cancelButton}
                    >
                      <Text style={styles.cancelButtonText}>
                        Cancel
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={handleSaveName}
                      disabled={saving}
                      style={styles.saveButton}
                    >
                      <Text style={styles.saveButtonText}>
                        {saving ? 'Saving...' : 'Save'}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <Pressable
                  onPress={() => setEditing(true)}
                  style={styles.nameRow}
                >
                  <View style={styles.nameValueContainer}>
                    <Ionicons
                      name="person-outline"
                      size={20}
                      color={COLORS.textSecondary}
                    />

                    <Text style={styles.value}>
                      {profile?.full_name ||
                        'Tap to add your name'}
                    </Text>
                  </View>

                  <View style={styles.editIcon}>
                    <Ionicons
                      name="pencil-outline"
                      size={17}
                      color={COLORS.primary}
                    />
                  </View>
                </Pressable>
              )}
            </View>

            {/* EMAIL */}
            <View style={styles.infoItem}>
              <Text style={styles.label}>EMAIL</Text>

              <View style={styles.valueRow}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={COLORS.textSecondary}
                />

                <Text style={styles.value}>
                  {user.email}
                </Text>
              </View>
            </View>

            {/* USER ID */}
            <View style={styles.lastInfoItem}>
              <Text style={styles.label}>USER ID</Text>

              <View style={styles.userIdBox}>
                <Text style={styles.valueSmall}>
                  {user.id}
                </Text>
              </View>
            </View>
          </View>

          {/* ACCOUNT */}
          <View style={styles.accountSection}>
            <Text style={styles.sectionTitle}>Account</Text>

            <Text style={styles.sectionDescription}>
              Sign out of your QR Attendance account.
            </Text>

            {/* SIGN OUT BUTTON */}
            <Pressable
              onPress={() => !loading && handleSignOut()}
              disabled={loading}
              style={[
                styles.signOutButton,
                loading && styles.signOutButtonDisabled,
              ]}
            >
              <Ionicons
                name="log-out-outline"
                size={20}
                color="#D32F2F"
              />

              <Text style={styles.signOutText}>
                {loading ? 'Signing out...' : 'Sign Out'}
              </Text>
            </Pressable>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
  },

  /* HEADER */

  header: {
    alignItems: 'center',
    marginBottom: 22,
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 5,
  },

  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  /* PROFILE CARD */

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    marginBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  cardSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 3,
  },

  /* INFORMATION */

  infoItem: {
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  lastInfoItem: {
    paddingTop: 11,
  },

  label: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 7,
  },

  value: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },

  valueSmall: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },

  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  /* ROLE */

  roleBadge: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  teacherBadge: {
    backgroundColor: COLORS.primary,
  },

  studentBadge: {
    backgroundColor: COLORS.textSecondary,
  },

  roleBadgeText: {
    color: COLORS.textOnPrimary,
    fontSize: 12,
    fontWeight: '700',
  },

  /* NAME */

  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 38,
  },

  nameValueContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  editIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },

  editContainer: {
    gap: 9,
  },

  nameInput: {
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 9,
    paddingHorizontal: 12,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.background,
    fontSize: 15,
  },

  editButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },

  cancelButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  cancelButtonText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },

  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  saveButtonText: {
    color: COLORS.textOnPrimary,
    fontSize: 13,
    fontWeight: '600',
  },

  /* USER ID */

  userIdBox: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 9,
  },

  /* ACCOUNT */

  accountSection: {
    marginBottom: 0,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },

  sectionDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 10,
  },

  /* SIGN OUT BUTTON */

  signOutButton: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: 10,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },

  signOutButtonDisabled: {
    opacity: 0.6,
  },

  signOutText: {
    color: '#D32F2F',
    fontSize: 15,
    fontWeight: '600',
  },
});