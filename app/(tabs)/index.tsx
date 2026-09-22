import { router } from 'expo-router';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

import AppButton from '@/components/AppButton';
import Header from '@/components/Header';
import { COLORS } from '@/constants/colors';

export default function Index() {
  return (
    <SafeAreaView style={styles.container}>
      
      {/* HEADER */}
      <View style={styles.headerContainer}>
        <Header title="QR Attendance" />

        <Text style={styles.author}>
          by: Aliah Beth O. Mahinay
        </Text>
      </View>

      {/* MAIN CONTENT */}
      <View style={styles.bodyContainer}>
        <Text style={styles.mainTitle}>
          School Event Attendance
        </Text>

        <Text style={styles.subtitle}>
          Scan QR Codes to record attendance during school activities.
        </Text>
      </View>

      {/* BUTTONS */}
      <View style={styles.footerContainer}>

        <AppButton
          theme="primary"
          title="Scan QR Code"
          icon="qr-code-outline"
          onPress={() => router.push('/scan')}
        />

        <AppButton
          title="Attendance History"
          icon="time-outline"
          onPress={() => router.push('/history')}
        />

        <AppButton
          title="Profile"
          icon="person-outline"
          onPress={() => router.push('/profile')}
        />

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  headerContainer: {
    flex: 1,
    justifyContent: 'center',
  },

  author: {
    textAlign: 'center',
    width: '100%',
    marginTop: 4,
  },

  bodyContainer: {
    paddingHorizontal: 32,
    marginBottom: 16,
  },

  mainTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 21,
  },

  footerContainer: {
    flex: 1 / 3,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 24,
    width: '100%',
    gap: 1,
  },
});