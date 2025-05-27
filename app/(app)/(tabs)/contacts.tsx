import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  RefreshControl,
  SectionList
} from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useContacts } from '@/hooks/useContacts';
import { Search, UserPlus, Users } from 'lucide-react-native';
import Avatar from '@/components/Avatar';
import EmptyState from '@/components/EmptyState';

export default function ContactsScreen() {
  const { theme } = useTheme();
  const { 
    contacts, 
    groups,
    loading, 
    refreshing, 
    searchQuery, 
    setSearchQuery,
    refreshContacts 
  } = useContacts();

  const renderContactItem = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity 
        style={styles.contactItem}
        onPress={() => router.push(`/user/${item.id}`)}
      >
        <Avatar 
          uri={item.avatar} 
          name={item.name}
          size={48}
          online={item.online}
        />
        <View style={styles.contactDetails}>
          <Text style={[styles.contactName, { color: theme.text.primary }]}>
            {item.name}
          </Text>
          <Text style={[styles.contactStatus, { color: theme.text.secondary }]}>
            {item.status || 'Available for chat'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderGroupItem = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity 
        style={styles.contactItem}
        onPress={() => router.push(`/group/${item.id}`)}
      >
        <Avatar 
          uri={item.avatar} 
          name={item.name}
          size={48}
          isGroup
        />
        <View style={styles.contactDetails}>
          <Text style={[styles.contactName, { color: theme.text.primary }]}>
            {item.name}
          </Text>
          <Text style={[styles.contactStatus, { color: theme.text.secondary }]}>
            {item.membersCount} members
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const sections = [
    {
      title: 'Groups',
      data: groups,
      renderItem: renderGroupItem,
      key: 'groups',
      icon: <Users size={20} color={theme.text.secondary} />
    },
    {
      title: 'Contacts',
      data: contacts,
      renderItem: renderContactItem,
      key: 'contacts',
      icon: <UserPlus size={20} color={theme.text.secondary} />
    }
  ];

  const renderSectionHeader = ({ section }: { section: any }) => {
    if (section.data.length === 0) return null;
    
    return (
      <View style={[styles.sectionHeader, { backgroundColor: theme.background }]}>
        <View style={styles.sectionTitleContainer}>
          {section.icon}
          <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
            {section.title}
          </Text>
        </View>
        {section.title === 'Groups' && (
          <TouchableOpacity
            onPress={() => router.push('/group/new')}
            style={[styles.createButton, { backgroundColor: theme.backgroundSecondary }]}
          >
            <Text style={[styles.createButtonText, { color: theme.primary }]}>Create</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.searchContainer, { backgroundColor: theme.backgroundSecondary }]}>
        <Search size={20} color={theme.text.secondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.text.primary }]}
          placeholder="Search contacts..."
          placeholderTextColor={theme.text.tertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled={true}
        contentContainerStyle={styles.contactsList}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={refreshContacts}
            tintColor={theme.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState 
            icon="user"
            title="No contacts yet"
            message={loading ? "Loading your contacts..." : "Add contacts to start chatting"}
            loading={loading}
          />
        }
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
  contactsList: {
    paddingHorizontal: 16,
    flexGrow: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    marginLeft: 8,
  },
  contactItem: {
    flexDirection: 'row',
    paddingVertical: 12,
  },
  contactDetails: {
    flex: 1,
    marginLeft: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 12,
    justifyContent: 'center',
  },
  contactName: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
  contactStatus: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginTop: 2,
  },
  createButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  createButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
});