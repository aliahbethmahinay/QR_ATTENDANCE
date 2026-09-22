import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { COLORS } from '@/constants/colors';
import { useAuth } from '@/lib/auth';
import {
  getAttendanceHistory,
  type AttendanceRecord,
  getTeacherEventAttendance,
  type TeacherEventAttendance,
} from '@/lib/attendance';
import { getProfile, type Role } from '@/lib/profile';

export default function HistoryScreen() {
  const { user } = useAuth();

  const [role, setRole] = useState<Role | null>(null);
  const [studentRecords, setStudentRecords] = useState<AttendanceRecord[]>([]);
  const [teacherEvents, setTeacherEvents] = useState<
    TeacherEventAttendance[]
  >([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const profile = await getProfile(user.id);
      const currentRole = profile?.role ?? 'student';

      setRole(currentRole);

      if (currentRole === 'teacher') {
        const events = await getTeacherEventAttendance(user.id);

        setTeacherEvents(events);
        setStudentRecords([]);
      } else {
        const records = await getAttendanceHistory(user.id);

        setStudentRecords(records);
        setTeacherEvents([]);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  /*
   * ============================
   * TEACHER HISTORY
   * ============================
   */
  if (role === 'teacher') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>My Events</Text>

        {loading ? (
          <Text style={styles.subtitle}>Loading events...</Text>
        ) : teacherEvents.length === 0 ? (
          <Text style={styles.subtitle}>
            No events yet. Create an event from the Teacher tab.
          </Text>
        ) : (
          <FlatList
            data={teacherEvents}
            keyExtractor={(item) => item.eventId}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View style={styles.card}>

                {/* EVENT HEADER */}
                <View style={styles.headerRow}>
                  <Text style={styles.eventTitle}>
                    {item.title}
                  </Text>

                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>
                      {item.attendeeCount}
                    </Text>
                  </View>
                </View>

                {/* EVENT CODE */}
                <Text style={styles.eventMeta}>
                  Event Code: {item.eventCode}
                </Text>

                {/* START TIME */}
                {item.startTime && (
                  <View style={styles.timeSection}>
                    <Text style={styles.timeLabel}>
                      Start Time
                    </Text>

                    <Text style={styles.timeValue}>
                      {formatDate(item.startTime)}
                    </Text>
                  </View>
                )}

                {/* END TIME */}
                {item.endTime && (
                  <View style={styles.timeSection}>
                    <Text style={styles.timeLabel}>
                      End Time
                    </Text>

                    <Text style={styles.timeValue}>
                      {formatDate(item.endTime)}
                    </Text>
                  </View>
                )}

                {/* ATTENDEES */}
                <Text style={styles.attendeeTitle}>
                  Attendees ({item.attendeeCount})
                </Text>

                {item.attendees.length === 0 ? (
                  <Text style={styles.noAttendees}>
                    No students have scanned yet.
                  </Text>
                ) : (
                  item.attendees.map((attendee) => (
                    <View
                      key={`${attendee.studentId}-${attendee.scannedAt}`}
                      style={styles.attendeeRow}
                    >
                      <View style={styles.attendeeInfo}>
                        <Text style={styles.studentId}>
                          Student
                        </Text>

                        <Text style={styles.studentIdValue}>
                          {shortId(attendee.studentId)}
                        </Text>
                      </View>

                      <View style={styles.scanInfo}>
                        <Text style={styles.scanLabel}>
                          Scanned
                        </Text>

                        <Text style={styles.scanTime}>
                          {formatDate(attendee.scannedAt)}
                        </Text>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}
          />
        )}
      </View>
    );
  }

  /*
   * ============================
   * STUDENT HISTORY
   * ============================
   */
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Attendance History</Text>

      {loading ? (
        <Text style={styles.subtitle}>
          Loading records...
        </Text>
      ) : studentRecords.length === 0 ? (
        <Text style={styles.subtitle}>
          No records yet. Scan a QR code to register your attendance.
        </Text>
      ) : (
        <FlatList
          data={studentRecords}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>

              {/* EVENT TITLE */}
              <Text style={styles.eventTitle}>
                {item.eventTitle}
              </Text>

              {/* EVENT ID */}
              <Text style={styles.eventMeta}>
                Event ID: {item.eventId}
              </Text>

              {/* START TIME */}
              {item.startTime && (
                <View style={styles.timeSection}>
                  <Text style={styles.timeLabel}>
                    Start Time
                  </Text>

                  <Text style={styles.timeValue}>
                    {formatDate(item.startTime)}
                  </Text>
                </View>
              )}

              {/* END TIME */}
              {item.endTime && (
                <View style={styles.timeSection}>
                  <Text style={styles.timeLabel}>
                    End Time
                  </Text>

                  <Text style={styles.timeValue}>
                    {formatDate(item.endTime)}
                  </Text>
                </View>
              )}

              {/* ATTENDANCE TIME */}
              <View style={styles.timeSection}>
                <Text style={styles.timeLabel}>
                  Your Attendance
                </Text>

                <Text style={styles.timeValue}>
                  {formatDate(item.scannedAt)}
                </Text>
              </View>

              {/* ATTENDEES */}
              {item.attendees && (
                <>
                  <Text style={styles.attendeeTitle}>
                    Attendees ({item.attendees.length})
                  </Text>

                  {item.attendees.length === 0 ? (
                    <Text style={styles.noAttendees}>
                      No attendees recorded.
                    </Text>
                  ) : (
                    item.attendees.map((attendee) => (
                      <View
                        key={`${attendee.studentId}-${attendee.scannedAt}`}
                        style={styles.attendeeRow}
                      >
                        <View style={styles.attendeeInfo}>
                          <Text style={styles.studentId}>
                            Student
                          </Text>

                          <Text style={styles.studentIdValue}>
                            {shortId(attendee.studentId)}
                          </Text>
                        </View>

                        <View style={styles.scanInfo}>
                          <Text style={styles.scanLabel}>
                            Scanned
                          </Text>

                          <Text style={styles.scanTime}>
                            {formatDate(attendee.scannedAt)}
                          </Text>
                        </View>
                      </View>
                    ))
                  )}
                </>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

/*
 * ============================
 * HELPERS
 * ============================
 */

function shortId(id: string) {
  return id ? id.slice(0, 8) : 'unknown';
}

function formatDate(iso: string) {
  if (!iso) return 'Not available';

  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return 'Invalid date';
  }

  return date.toLocaleString();
}

/*
 * ============================
 * STYLES
 * ============================
 */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
    paddingTop: 24,
  },

  title: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },

  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 32,
  },

  list: {
    paddingBottom: 24,
  },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,

    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  eventTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },

  eventMeta: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  /*
   * TIME
   */

  timeSection: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: COLORS.background,
  },

  timeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 2,
  },

  timeValue: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },

  /*
   * ATTENDEE COUNT
   */

  countBadge: {
    minWidth: 32,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },

  countText: {
    color: COLORS.textOnPrimary,
    fontSize: 13,
    fontWeight: '700',
  },

  /*
   * ATTENDEES
   */

  attendeeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },

  attendeeRow: {
    paddingVertical: 9,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  attendeeInfo: {
    flex: 1,
  },

  studentId: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },

  studentIdValue: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '500',
    marginTop: 2,
  },

  scanInfo: {
    alignItems: 'flex-end',
  },

  scanLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },

  scanTime: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  noAttendees: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});