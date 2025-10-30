import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../context/AuthContext'; // ✅ DIGANTI INI
import { COLORS, SIZES, SCREENS } from '../../utils/constants';

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    // Validasi input
    if (!username.trim()) {
      Alert.alert('Error', 'Username harus diisi');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Error', 'Password harus diisi');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password minimal 6 karakter');
      return;
    }

    try {
      setIsLoading(true);

      const result = await login(username.trim(), password);

      if (result.success) {
        // Login berhasil, navigation akan otomatis handle redirect berdasarkan role
        Alert.alert('Berhasil', 'Login berhasil!');
      } else {
        Alert.alert('Login Gagal', result.message || 'Username atau password salah');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Terjadi kesalahan saat login');
    } finally {
      setIsLoading(false);
    }
  };

  const goToRegister = () => {
    navigation.navigate(SCREENS.REGISTER);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo/Header */}
        <View style={styles.headerContainer}>
          <View style={styles.logoContainer}>
            <Icon name="water" size={60} color={COLORS.primary} />
          </View>
          <Text style={styles.title}>HydraGas</Text>
          <Text style={styles.subtitle}>Sistem Pemesanan Gas & Galon</Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {/* Username Input */}
          <View style={styles.inputContainer}>
            <Icon name="person-outline" size={20} color={COLORS.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Icon name="lock-closed-outline" size={20} color={COLORS.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Icon
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color={COLORS.textLight}
              />
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          {/* Register Link */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Belum punya akun? </Text>
            <TouchableOpacity onPress={goToRegister} disabled={isLoading}>
              <Text style={styles.registerLink}>Daftar Sekarang</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Login sebagai Customer untuk memesan{'\n'}
            Login sebagai Kurir untuk pengiriman
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SIZES.lg,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: SIZES.xl,
  },
  logoContainer: {
    width: 100,
    height: 100,
    backgroundColor: COLORS.light,
    borderRadius: SIZES.radiusFull,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  title: {
    fontSize: SIZES.fontXxl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SIZES.xs,
  },
  subtitle: {
    fontSize: SIZES.fontMd,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: SIZES.xl,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.light,
    borderRadius: SIZES.radiusMd,
    marginBottom: SIZES.md,
    paddingHorizontal: SIZES.md,
    height: 50,
  },
  inputIcon: {
    marginRight: SIZES.sm,
  },
  input: {
    flex: 1,
    fontSize: SIZES.fontMd,
    color: COLORS.text,
  },
  eyeIcon: {
    padding: SIZES.sm,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusMd,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SIZES.md,
  },
  loginButtonDisabled: {
    backgroundColor: COLORS.gray,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: SIZES.fontMd,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SIZES.lg,
  },
  registerText: {
    fontSize: SIZES.fontMd,
    color: COLORS.textLight,
  },
  registerLink: {
    fontSize: SIZES.fontMd,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  infoContainer: {
    alignItems: 'center',
    marginTop: SIZES.xl,
  },
  infoText: {
    fontSize: SIZES.fontSm,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default LoginScreen;