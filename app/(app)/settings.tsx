import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { Moon, Bell, Shield, LogOut } from 'lucide-react-native';

export default function SettingsScreen() {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  const settingsOptions = [
    {
      icon: <Moon size={24} color="#000000" />,
      title: 'Theme',
      onPress: () => {}
    },
    {
      icon: <Bell size={24} color="#000000" />,
      title: 'Notifications',
      onPress: () => {}
    },
    {
      icon: <Shield size={24} color="#000000" />,
      title: 'Privacy',
      onPress: () => {}
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {settingsOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.option}
            onPress={option.onPress}
          >
            {option.icon}
            <Text style={styles.optionText}>{option.title}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[styles.option, styles.signOutOption]}
          onPress={handleSignOut}
        >
          <LogOut size={24} color="#FF3B30" />
          <Text style={[styles.optionText, styles.signOutText]}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  optionText: {
    marginLeft: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#000000',
  },
  signOutOption: {
    marginTop: 32,
  },
  signOutText: {
    color: '#FF3B30',
  },
});
