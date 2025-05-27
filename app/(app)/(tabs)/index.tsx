import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  RefreshControl
} from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useChats } from '@/hooks/useChats';
import { formatDistanceToNow } from 'date-fns';
import { Search, Plus, Mic } from 'lucide-react-native';
import Avatar from '@/components/Avatar';
import FloatingButton from '@/components/FloatingButton';
import EmptyState from '@/components/EmptyState';

export default function ChatsScreen() {
  const { theme } = useTheme();
  const { 
    chats, 
    loading, 
    refreshing, 
    searchQuery, 
    setSearchQuery,
    fetchChats,
    refreshChats 
  } = useChats();

  const renderChatItem = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity 
        style={styles.chatItem}
        onPress={() => router.push(`/chat/${item.id}`)}
      >
        <Avatar 
          uri={item.isGroup ? item.groupImage : item.participantImage} 
          name={item.name}
          size={56}
          online={item.isGroup ? false : item.online}
        />
        <View style={styles.chatDetails}>
          <View style={styles.chatHeader}>
            <Text style={[styles.chatName, { color: theme.text.primary }]} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={[styles.chatTime, { color: theme.text.tertiary }]}>
              {formatDistanceToNow(new Date(item.lastMessageTime), { addSuffix: true })}
            </Text>
          </View>
          <View style={styles.chatFooter}>
            <Text 
              style={[
                styles.lastMessage, 
                { color: item.unreadCount > 0 ? theme.text.primary : theme.text.secondary }
              ]}
              numberOfLines={1}
            >
              {item.lastMessageType === 'voice' ? (
                <View style={styles.voiceMessageContainer}>
                  <Mic size={14} color={theme.text.secondary} />
                  <Text style={{ color: theme.text.secondary, marginLeft: 4 }}>Voice message</Text>
                </View>
              ) : (
                item.lastMessage
              )}
            </Text>
            {item.unreadCount > 0 && (
              <View style={[styles.unreadBadge, { backgroundColor: theme.primary }]}>
                <Text style={styles.unreadCount}>
                  {item.unreadCount > 99 ? '99+' : item.unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.searchContainer, { backgroundColor: theme.backgroundSecondary }]}>
        <Search size={20} color={theme.text.secondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.text.primary }]}
          placeholder="Search conversations..."
          placeholderTextColor={theme.text.tertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.chatList}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={refreshChats}
            tintColor={theme.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState 
            icon="message-square"
            title="No conversations yet"
            message={loading ? "Loading your chats..." : "Start a new conversation with the button below"}
            loading={loading}
          />
        }
      />

      <FloatingButton 
        icon={Plus}
        onPress={() => router.push('/contacts')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 24,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  chatList: {
    paddingHorizontal: 16,
    flexGrow: 1,
  },
  chatItem: {
    flexDirection: 'row',
    paddingVertical: 12,
  },
  chatDetails: {
    flex: 1,
    marginLeft: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 12,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  chatName: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    flex: 1,
  },
  chatTime: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginLeft: 8,
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    flex: 1,
  },
  unreadBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  unreadCount: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  voiceMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});