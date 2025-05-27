import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { Logo } from '@/components/Logo';
import { themes } from '@/constants/theme';
import { UserPlus, Mail, Lock, User, Eye, EyeOff, ArrowLeft } from 'lucide-react-native';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signUp, isLoading, error } = useAuth();

  const handleRegister = async () => {
    if (name.trim() === '' || email.trim() === '' || password === '') {
      return;
    }
    
    if (password !== confirmPassword) {
      // Handle password mismatch
      return;
    }
    
    try {
      await signUp(name, email, password);
      router.replace('/(app)/(tabs)');
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={themes.light.text.primary} />
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <Logo size={60} />
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join IndyChat today</Text>
          </View>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <User size={20} color={themes.light.text.secondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor={themes.light.text.placeholder}
              autoCapitalize="words"
              value={name}
              onChangeText={setName}
            />
          </View>

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

          <View style={styles.inputContainer}>
            <Lock size={20} color={themes.light.text.secondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={themes.light.text.placeholder}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity 
              style={styles.eyeIcon} 
              onPress={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff size={20} color={themes.light.text.secondary} />
              ) : (
                <Eye size={20} color={themes.light.text.secondary} />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Lock size={20} color={themes.light.text.secondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor={themes.light.text.placeholder}
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity 
              style={styles.eyeIcon} 
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff size={20} color={themes.light.text.secondary} />
              ) : (
                <Eye size={20} color={themes.light.text.secondary} />
              )}
            </TouchableOpacity>
          </View>

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}

          <TouchableOpacity 
            style={styles.registerButton} 
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <UserPlus size={20} color="#FFFFFF" />
                <Text style={styles.registerButtonText}>Create Account</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.termsText}>
            By signing up, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <Link href="/login" asChild>
            <TouchableOpacity>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
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
    position: 'relative',
    marginBottom: 24,
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10,
    padding: 8,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 48,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: themes.light.text.primary,
    marginTop: 16,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: themes.light.text.secondary,
    marginTop: 8,
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
  eyeIcon: {
    padding: 8,
  },
  registerButton: {
    flexDirection: 'row',
    backgroundColor: themes.light.primary,
    borderRadius: 8,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  registerButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  termsText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: themes.light.text.secondary,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
  termsLink: {
    fontFamily: 'Inter-Medium',
    color: themes.light.primary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  footerText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: themes.light.text.secondary,
  },
  loginLink: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: themes.light.primary,
    marginLeft: 4,
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    color: themes.light.error,
    marginBottom: 16,
    textAlign: 'center',
  },
});