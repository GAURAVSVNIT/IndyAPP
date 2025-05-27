import { View, Text, StyleSheet } from 'react-native';

export default function ContactsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Contacts</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 44,
  },
});