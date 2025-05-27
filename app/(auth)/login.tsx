import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { Logo } from '@/components/Logo';
import { themes } from '@/constants/theme';
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, isLoading, error } = useAuth();

  const handleLogin = async () => {
    if (email.trim() === '' || password === '') {
      return;
    }
    
    try {
      await signIn(email, password);
      router.replace('/(app)/(tabs)');
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.logoContainer}>
        <Logo size={80} />
        <Text style={styles.title}>IndyChat</Text>
        <Text style={styles.subtitle}>Connect with confidence</Text>
      </View>

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

        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}

        <TouchableOpacity 
          style={styles.loginButton} 
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <LogIn size={20} color="#FFFFFF" />
              <Text style={styles.loginButtonText}>Sign In</Text>
            </>
          )}
        </TouchableOpacity>

        <Link href="/forgot-password" asChild>
          <TouchableOpacity>
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </TouchableOpacity>
        </Link>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account?</Text>
        <Link href="/register" asChild>
          <TouchableOpacity>
            <Text style={styles.registerLink}>Sign Up</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
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
  loginButton: {
    flexDirection: 'row',
    backgroundColor: themes.light.primary,
    borderRadius: 8,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  loginButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  forgotPassword: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: themes.light.primary,
    textAlign: 'center',
    marginTop: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
    marginBottom: 24,
  },
  footerText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: themes.light.text.secondary,
  },
  registerLink: {
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