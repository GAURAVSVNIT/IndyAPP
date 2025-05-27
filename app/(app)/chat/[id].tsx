import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useChat } from '@/hooks/useChat';
import { useLocalSearchParams, router } from 'expo-router';
import { 
  ArrowLeft, 
  MoreVertical,
  Phone,
  Video,
  Send,
  Mic,
  Image as ImageIcon,
  Paperclip,
  Play,
  Pause
} from 'lucide-react-native';
import Avatar from '@/components/Avatar';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import * as ImagePicker from 'expo-image-picker';
import { format } from 'date-fns';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

export default function ChatScreen() {
  const { theme } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { 
    chat, 
    messages, 
    sendMessage, 
    loading, 
    recording,
    startRecording,
    stopRecording,
    isRecording,
  } = useChat(id);

  const [messageText, setMessageText] = useState('');
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const sound = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    return () => {
      if (sound.current) {
        sound.current.unloadAsync();
      }
    };
  }, []);

  const handleSend = () => {
    if (messageText.trim() === '') return;
    
    sendMessage(messageText, 'text');
    setMessageText('');
  };

  const handleImageSend = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      sendMessage(result.assets[0].uri, 'image');
    }
  };

  const handleVoiceMessage = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const playVoiceMessage = async (audioUrl: string) => {
    try {
      if (sound.current) {
        await sound.current.unloadAsync();
      }
      
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true },
        (status) => {
          if (status.isLoaded) {
            setAudioProgress(status.positionMillis / status.durationMillis);
            if (status.didJustFinish) {
              setPlayingAudio(null);
              setAudioProgress(0);
            }
          }
        }
      );
      
      sound.current = newSound;
      setPlayingAudio(audioUrl);
    } catch (error) {
      console.error("Error playing voice message:", error);
    }
  };

  const stopVoiceMessage = async () => {
    if (sound.current) {
      await sound.current.stopAsync();
      setPlayingAudio(null);
      setAudioProgress(0);
    }
  };

  const speakMessage = (text: string) => {
    Speech.speak(text, {
      language: 'en',
      pitch: 1.0,
      rate: 0.9,
    });
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isCurrentUser = item.senderId === 'currentUser'; // Replace with actual user ID check
    
    return (
      <View style={[
        styles.messageContainer,
        isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
      ]}>
        {!isCurrentUser && !item.isConsecutive && (
          <Avatar 
            uri={item.senderAvatar} 
            name={item.senderName}
            size={30}
            style={styles.messageAvatar}
          />
        )}
        
        <View style={[
          styles.messageBubble,
          isCurrentUser 
            ? [styles.currentUserBubble, { backgroundColor: theme.primary }] 
            : [styles.otherUserBubble, { backgroundColor: theme.backgroundSecondary }]
        ]}>
          {!isCurrentUser && !item.isConsecutive && (
            <Text style={[styles.messageSender, { color: theme.accent }]}>
              {item.senderName}
            </Text>
          )}
          
          {item.type === 'text' && (
            <Text 
              style={[
                styles.messageText, 
                { color: isCurrentUser ? '#FFFFFF' : theme.text.primary }
              ]}
              onLongPress={() => speakMessage(item.content)}
            >
              {item.content}
            </Text>
          )}
          
          {item.type === 'image' && (
            <Image 
              source={{ uri: item.content }} 
              style={styles.messageImage}
              resizeMode="cover"
            />
          )}
          
          {item.type === 'voice' && (
            <TouchableOpacity 
              style={[
                styles.voiceMessageContainer, 
                { backgroundColor: isCurrentUser ? 'rgba(255,255,255,0.2)' : theme.background }
              ]}
              onPress={() => {
                if (playingAudio === item.content) {
                  stopVoiceMessage();
                } else {
                  playVoiceMessage(item.content);
                }
              }}
            >
              {playingAudio === item.content ? (
                <Pause size={20} color={isCurrentUser ? '#FFFFFF' : theme.primary} />
              ) : (
                <Play size={20} color={isCurrentUser ? '#FFFFFF' : theme.primary} />
              )}
              
              <View style={styles.voiceWaveContainer}>
                <View 
                  style={[
                    styles.voiceWaveProgress, 
                    { 
                      backgroundColor: isCurrentUser ? '#FFFFFF' : theme.primary,
                      width: playingAudio === item.content ? `${audioProgress * 100}%` : '0%'
                    }
                  ]} 
                />
              </View>
              
              <Text 
                style={[
                  styles.voiceDuration, 
                  { color: isCurrentUser ? '#FFFFFF' : theme.text.secondary }
                ]}
              >
                {item.duration || '0:15'}
              </Text>
            </TouchableOpacity>
          )}
          
          <Text 
            style={[
              styles.messageTime, 
              { color: isCurrentUser ? 'rgba(255,255,255,0.7)' : theme.text.tertiary }
            ]}
          >
            {format(new Date(item.timestamp), 'h:mm a')}
          </Text>
        </View>
      </View>
    );
  };

  if (loading || !chat) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={theme.text.primary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.headerProfile}
          onPress={() => router.push(chat.isGroup ? `/group/${id}` : `/user/${chat.participantId}`)}
        >
          <Avatar 
            uri={chat.isGroup ? chat.groupImage : chat.participantImage} 
            name={chat.name}
            size={40}
            online={!chat.isGroup && chat.online}
          />
          <View style={styles.headerInfo}>
            <Text style={[styles.headerName, { color: theme.text.primary }]}>
              {chat.name}
            </Text>
            <Text style={[styles.headerStatus, { color: theme.text.secondary }]}>
              {chat.isGroup 
                ? `${chat.participantsCount} members` 
                : chat.online ? 'Online' : 'Offline'}
            </Text>
          </View>
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => router.push(`/call/${id}?video=false`)}
          >
            <Phone size={24} color={theme.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => router.push(`/call/${id}?video=true`)}
          >
            <Video size={24} color={theme.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <MoreVertical size={24} color={theme.text.primary} />
          </TouchableOpacity>
        </View>
      </View>
      
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        inverted={false}
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {isRecording && (
          <Animated.View 
            style={[styles.recordingIndicator, { backgroundColor: theme.backgroundSecondary }]}
            entering={FadeIn}
            exiting={FadeOut}
          >
            <View style={[styles.recordingDot, { backgroundColor: theme.error }]} />
            <Text style={[styles.recordingText, { color: theme.text.primary }]}>
              Recording voice message...
            </Text>
            <Text style={[styles.recordingTimer, { color: theme.text.secondary }]}>
              {recording.duration}s
            </Text>
          </Animated.View>
        )}
        
        <View style={[styles.inputContainer, { backgroundColor: theme.background }]}>
          <TouchableOpacity 
            style={[styles.attachButton, { backgroundColor: theme.backgroundSecondary }]}
            onPress={handleImageSend}
          >
            <ImageIcon size={20} color={theme.text.secondary} />
          </TouchableOpacity>
          
          <View style={[styles.textInputContainer, { backgroundColor: theme.backgroundSecondary }]}>
            <TextInput
              style={[styles.input, { color: theme.text.primary }]}
              placeholder="Type a message..."
              placeholderTextColor={theme.text.tertiary}
              value={messageText}
              onChangeText={setMessageText}
              multiline
            />
            
            <TouchableOpacity 
              style={styles.inputActionButton}
              onPress={handleVoiceMessage}
            >
              <Mic 
                size={20} 
                color={isRecording ? theme.error : theme.text.secondary} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.inputActionButton}>
              <Paperclip size={20} color={theme.text.secondary} />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={[
              styles.sendButton, 
              { 
                backgroundColor: messageText.trim() ? theme.primary : theme.backgroundSecondary,
                opacity: messageText.trim() ? 1 : 0.7
              }
            ]}
            onPress={handleSend}
            disabled={!messageText.trim()}
          >
            <Send size={20} color={messageText.trim() ? '#FFFFFF' : theme.text.secondary} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerProfile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  headerInfo: {
    marginLeft: 12,
  },
  headerName: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
  headerStatus: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 8,
    marginLeft: 4,
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    maxWidth: '85%',
  },
  currentUserMessage: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
  otherUserMessage: {
    alignSelf: 'flex-start',
  },
  messageAvatar: {
    marginRight: 8,
    alignSelf: 'flex-end',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
    maxWidth: '100%',
  },
  currentUserBubble: {
    borderBottomRightRadius: 4,
  },
  otherUserBubble: {
    borderBottomLeftRadius: 4,
  },
  messageSender: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    marginBottom: 4,
  },
  messageText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 22,
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
  },
  messageTime: {
    fontFamily: 'Inter-Regular',
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  voiceMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 16,
    minWidth: 150,
  },
  voiceWaveContainer: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 2,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  voiceWaveProgress: {
    height: '100%',
    borderRadius: 2,
  },
  voiceDuration: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  textInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: 8,
  },
  inputActionButton: {
    padding: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    margin: 8,
    borderRadius: 20,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  recordingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  recordingTimer: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
});