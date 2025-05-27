import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl 
} from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useCalls } from '@/hooks/useCalls';
import { formatDistanceToNow } from 'date-fns';
import { PhoneIncoming, PhoneOutgoing, PhoneMissed, Phone, Video } from 'lucide-react-native';
import Avatar from '@/components/Avatar';
import EmptyState from '@/components/EmptyState';
import FloatingButton from '@/components/FloatingButton';

export default function CallsScreen() {
  const { theme } = useTheme();
  const { 
    calls, 
    loading, 
    refreshing, 
    refreshCalls 
  } = useCalls();

  const renderCallItem = ({ item }: { item: any }) => {
    let icon;
    let iconColor;

    if (item.missed) {
      icon = <PhoneMissed size={16} color={theme.error} />;
      iconColor = theme.error;
    } else if (item.incoming) {
      icon = <PhoneIncoming size={16} color={theme.success} />;
      iconColor = theme.success;
    } else {
      icon = <PhoneOutgoing size={16} color={theme.primary} />;
      iconColor = theme.primary;
    }

    return (
      <TouchableOpacity 
        style={styles.callItem}
        onPress={() => router.push(`/call/${item.id}`)}
      >
        <Avatar 
          uri={item.participantImage} 
          name={item.name}
          size={48}
        />
        <View style={styles.callDetails}>
          <View style={styles.callHeader}>
            <Text style={[styles.callName, { color: theme.text.primary }]}>
              {item.name}
            </Text>
            <Text style={[styles.callTime, { color: theme.text.tertiary }]}>
              {formatDistanceToNow(new Date(item.time), { addSuffix: true })}
            </Text>
          </View>
          <View style={styles.callFooter}>
            <View style={styles.callTypeContainer}>
              {icon}
              <Text style={[styles.callType, { color: iconColor }]}>
                {item.videoCall ? 'Video call' : 'Voice call'}
                {item.missed ? ' · Missed' : item.incoming ? ' · Incoming' : ' · Outgoing'}
              </Text>
            </View>
            <View style={styles.callActions}>
              <TouchableOpacity 
                style={[styles.callButton, { backgroundColor: theme.backgroundSecondary }]}
                onPress={() => router.push(`/call/${item.id}?video=false`)}
              >
                <Phone size={18} color={theme.primary} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.callButton, { backgroundColor: theme.backgroundSecondary, marginLeft: 8 }]}
                onPress={() => router.push(`/call/${item.id}?video=true`)}
              >
                <Video size={18} color={theme.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={calls}
        renderItem={renderCallItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.callsList}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={refreshCalls}
            tintColor={theme.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState 
            icon="phone"
            title="No call history"
            message={loading ? "Loading your calls..." : "Start a call with your contacts"}
            loading={loading}
          />
        }
      />

      <FloatingButton 
        icon={Phone}
        onPress={() => router.push('/contacts')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  callsList: {
    paddingHorizontal: 16,
    paddingTop: 8,
    flexGrow: 1,
  },
  callItem: {
    flexDirection: 'row',
    paddingVertical: 12,
  },
  callDetails: {
    flex: 1,
    marginLeft: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 12,
    justifyContent: 'center',
  },
  callHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  callName: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
  callTime: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  callFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  callTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  callType: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginLeft: 6,
  },
  callActions: {
    flexDirection: 'row',
  },
  callButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});