import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Switch,
  Alert
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { router } from 'expo-router';
import { 
  User, 
  Bell, 
  Moon, 
  Lock, 
  HelpCircle, 
  Info, 
  LogOut,
  ChevronRight
} from 'lucide-react-native';
import Avatar from '@/components/Avatar';

export default function SettingsScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => {
            signOut();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const renderSettingItem = (icon: any, title: string, onPress: () => void, rightElement?: React.ReactNode) => {
    return (
      <TouchableOpacity 
        style={[styles.settingItem, { borderBottomColor: theme.border }]}
        onPress={onPress}
      >
        <View style={styles.settingIconContainer}>
          {icon}
        </View>
        <Text style={[styles.settingTitle, { color: theme.text.primary }]}>
          {title}
        </Text>
        <View style={styles.settingRightElement}>
          {rightElement || <ChevronRight size={20} color={theme.text.tertiary} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <TouchableOpacity 
        style={styles.profileSection}
        onPress={() => router.push(`/user/${user?.uid}`)}
      >
        <Avatar 
          uri={user?.photoURL || undefined} 
          name={user?.displayName || 'User'}
          size={80}
        />
        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, { color: theme.text.primary }]}>
            {user?.displayName || 'User'}
          </Text>
          <Text style={[styles.profileEmail, { color: theme.text.secondary }]}>
            {user?.email || 'user@example.com'}
          </Text>
          <Text style={[styles.viewProfile, { color: theme.primary }]}>
            View Profile
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.settingsSection}>
        <Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>Preferences</Text>
        
        {renderSettingItem(
          <Bell size={22} color={theme.primary} />, 
          'Notifications', 
          () => router.push('/settings/notifications')
        )}
        
        {renderSettingItem(
          <Moon size={22} color={theme.primary} />, 
          'Dark Mode', 
          toggleTheme,
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: '#D1D5DB', true: `${theme.primary}80` }}
            thumbColor={isDark ? theme.primary : '#F3F4F6'}
          />
        )}
        
        {renderSettingItem(
          <Lock size={22} color={theme.primary} />, 
          'Privacy & Security', 
          () => router.push('/settings/privacy')
        )}
      </View>

      <View style={styles.settingsSection}>
        <Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>Support</Text>
        
        {renderSettingItem(
          <HelpCircle size={22} color={theme.primary} />, 
          'Help & Support', 
          () => {/* Handle help */}
        )}
        
        {renderSettingItem(
          <Info size={22} color={theme.primary} />, 
          'About IndyChat', 
          () => {/* Show about info */}
        )}
      </View>

      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <LogOut size={22} color={theme.error} />
        <Text style={[styles.logoutText, { color: theme.error }]}>
          Log Out
        </Text>
      </TouchableOpacity>

      <Text style={[styles.versionText, { color: theme.text.tertiary }]}>
        Version 1.0.0
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileSection: {
    flexDirection: 'row',
    padding: 24,
    alignItems: 'center',
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
  },
  profileEmail: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginTop: 4,
  },
  viewProfile: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginTop: 8,
  },
  settingsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginLeft: 24,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingIconContainer: {
    width: 40,
    alignItems: 'center',
  },
  settingTitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    flex: 1,
    marginLeft: 12,
  },
  settingRightElement: {
    alignItems: 'flex-end',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginHorizontal: 24,
    marginTop: 24,
    marginBottom: 16,
  },
  logoutText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    marginLeft: 8,
  },
  versionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 32,
  },
});