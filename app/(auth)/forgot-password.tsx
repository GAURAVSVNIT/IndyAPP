import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { themes } from '@/constants/theme';
import { Mail, ArrowLeft, SendHorizontal } from 'lucide-react-native';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { resetPassword, isLoading, error } = useAuth();

  const handleResetPassword = async () => {
    if (email.trim() === '') {
      return;
    }
    
    try {
      await resetPassword(email);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Password reset error:', error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={themes.light.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Reset Password</Text>
      </View>

      {!isSubmitted ? (
        <>
          <Text style={styles.instructions}>
            Enter your email address and we'll send you instructions to reset your password.
          </Text>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Mail size={20} color={themes.light.text.secondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={themes.light.text.placeholder}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}

            <TouchableOpacity 
              style={styles.resetButton} 
              onPress={handleResetPassword}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <SendHorizontal size={20} color="#FFFFFF" />
                  <Text style={styles.resetButtonText}>Send Instructions</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.successContainer}>
          <SendHorizontal size={60} color={themes.light.primary} />
          <Text style={styles.successTitle}>Check Your Email</Text>
          <Text style={styles.successMessage}>
            We've sent password reset instructions to {email}
          </Text>
          <TouchableOpacity 
            style={styles.backToLoginButton} 
            onPress={() => router.replace('/login')}
          >
            <Text style={styles.backToLoginText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: themes.light.text.primary,
  },
  instructions: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: themes.light.text.secondary,
    marginBottom: 24,
    lineHeight: 24,
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: themes.light.border,
    borderRadius: 8,
    height: 56,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: themes.light.text.primary,
  },
  resetButton: {
    flexDirection: 'row',
    backgroundColor: themes.light.primary,
    borderRadius: 8,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  resetButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    color: themes.light.error,
    marginBottom: 16,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  successTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: themes.light.text.primary,
    marginTop: 24,
    marginBottom: 16,
  },
  successMessage: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: themes.light.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  backToLoginButton: {
    backgroundColor: themes.light.primary,
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  backToLoginText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#FFFFFF',
  },
});