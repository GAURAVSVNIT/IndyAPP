import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  SafeAreaView,
  Animated,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { Menu, Settings, SendHorizontal } from 'lucide-react-native';
import { router } from 'expo-router';
import { useMessages } from '@/hooks/useMessages';
import { 
  extractIframes, 
  createWebViewFromIframe, 
  isTablet as isTabletDevice, 
  renderContentWithIframes 
} from '@/utils/iframe';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
}

export default function ChatScreen() {
  const [message, setMessage] = useState('');
  const { messages, sendMessage } = useMessages();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuAnim = useRef(new Animated.Value(-300)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const { width } = useWindowDimensions();
  const isTablet = isTabletDevice();

  const toggleMenu = () => {
    const toValue = isMenuOpen ? -300 : 0;
    const overlayValue = isMenuOpen ? 0 : 0.5;

    Animated.parallel([
      Animated.timing(menuAnim, {
        toValue,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(overlayAnim, {
        toValue: overlayValue,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    setIsMenuOpen(!isMenuOpen);
  };

  const handleSend = async () => {
    if (message.trim()) {
      await sendMessage(message);
      setMessage('');
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    
    // Check if the content contains iframes
    const hasIframe = !isUser && item.content.includes('<iframe');
    
    return (
      <View style={[
        styles.messageBubble,
        isUser ? styles.userBubble : styles.aiBubble,
        { alignSelf: isUser ? 'flex-end' : 'flex-start' },
        hasIframe && styles.iframeContainer
      ]}>
        {!isUser && (
          <View style={styles.aiAvatar}>
            <Text style={styles.aiAvatarText}>AI</Text>
          </View>
        )}
        
        {hasIframe ? (
          // For messages with iframes, use the iframe utility
          <View style={styles.messageContent}>
            {renderContentWithIframes(item.content, isTablet).map((content, index) => {
              if (typeof content === 'string') {
                // Render text content
                return (
                  <Text key={`text-${index}`} style={[
                    styles.messageText,
                    styles.aiText
                  ]}>
                    {content}
                  </Text>
                );
              } else {
                // Render React component (WebView)
                return <View key={`iframe-${index}`}>{content}</View>;
              }
            })}
          </View>
        ) : (
          // For regular messages without iframes, render as before
          <Text style={[
            styles.messageText,
            isUser ? styles.userText : styles.aiText
          ]}>
            {item.content}
          </Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Overlay for menu backdrop */}
      <Animated.View 
        style={[
          styles.overlay,
          { opacity: overlayAnim }
        ]}
        pointerEvents={isMenuOpen ? 'auto' : 'none'}
      >
        <Pressable style={styles.overlayTouch} onPress={toggleMenu} />
      </Animated.View>

      {/* Side Menu */}
      <Animated.View style={[
        styles.menu,
        { transform: [{ translateX: menuAnim }] }
      ]}>
        <View style={styles.menuHeader}>
          <Text style={styles.menuTitle}>IndyGPT</Text>
        </View>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => {
            toggleMenu();
            router.push('/settings');
          }}
        >
          <Settings size={24} color="#000000" />
          <Text style={styles.menuItemText}>Settings</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Main Chat Interface */}
      <View style={styles.main}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={toggleMenu}
            style={styles.menuButton}
          >
            <Menu size={24} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Chat</Text>
        </View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.content}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
        >
          <FlatList
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
          />
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={message}
              onChangeText={setMessage}
              placeholder="Message IndyGPT..."
              placeholderTextColor="#8E8E93"
              multiline
              maxHeight={100}
            />
            <TouchableOpacity
              onPress={handleSend}
              disabled={!message.trim()}
              style={[
                styles.sendButton,
                !message.trim() && styles.sendButtonDisabled
              ]}
            >
              <SendHorizontal size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  },
  overlayTouch: {
    flex: 1,
  },
  menu: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 300,
    backgroundColor: '#FFFFFF',
    zIndex: 2,
    borderRightWidth: 1,
    borderRightColor: '#E5E5EA',
  },
  menuHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  menuTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#000000',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  menuItemText: {
    marginLeft: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#000000',
  },
  main: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 0 : 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
  },
  menuButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Medium',
    color: '#000000',
    marginLeft: 16,
  },
  content: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 20,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iframeContainer: {
    maxWidth: '90%', // Make iframe messages wider
    padding: 12,
    paddingRight: 8, // Less padding on the right for WebView
  },
  messageContent: {
    flex: 1,
    flexDirection: 'column',
  },
  userBubble: {
    backgroundColor: '#0A84FF',
  },
  aiBubble: {
    backgroundColor: '#F5F5F7',
  },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0A84FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  aiAvatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    flex: 1,
  },
  userText: {
    color: '#FFFFFF',
  },
  aiText: {
    color: '#000000',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F7',
    borderRadius: 20,
    padding: 12,
    paddingTop: 12,
    paddingRight: 48,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: '#0A84FF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
