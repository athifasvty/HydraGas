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
  ImageBackground,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SIZES, SCREENS } from '../../utils/constants';

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'

  const handleLogin = async () => {
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
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800' }}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Card Container */}
          <View style={styles.cardContainer}>
            {/* Logo */}
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/images/logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>

            {/* Title */}
            <Text style={styles.title}>LOGIN</Text>

            {/* Tab Switcher */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'login' && styles.activeTab]}
                onPress={() => setActiveTab('login')}
              >
                <Text style={[styles.tabText, activeTab === 'login' && styles.activeTabText]}>
                  Login
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'register' && styles.activeTab]}
                onPress={() => {
                  setActiveTab('register');
                  goToRegister();
                }}
              >
                <Text style={[styles.tabText, activeTab === 'register' && styles.activeTabText]}>
                  Register
                </Text>
              </TouchableOpacity>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              {/* Username Input */}
              <TextInput
                style={styles.input}
                placeholder="username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
                placeholderTextColor={COLORS.textLight}
              />

              {/* Password Input */}
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                  placeholderTextColor={COLORS.textLight}
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

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.submitButtonText}>SUBMIT</Text>
                )}
              </TouchableOpacity>

              {/* Links */}
              <View style={styles.linksContainer}>
                <TouchableOpacity>
                  <Text style={styles.linkText}>Lupa password?</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={goToRegister}>
                  <Text style={styles.linkText}>Ganti Password</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(135, 206, 235, 0.3)',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SIZES.lg,
  },
  cardContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 0,
    padding: SIZES.xl,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  logoImage: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SIZES.lg,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.light,
    borderRadius: 8,
    padding: 4,
    marginBottom: SIZES.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: SIZES.sm,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: SIZES.fontMd,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.text,
    fontWeight: 'bold',
  },
  formContainer: {
    marginTop: SIZES.md,
  },
  input: {
    backgroundColor: COLORS.light,
    borderRadius: 8,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.md,
    fontSize: SIZES.fontMd,
    color: COLORS.text,
    marginBottom: SIZES.md,
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: SIZES.md,
  },
  eyeIcon: {
    position: 'absolute',
    right: SIZES.md,
    top: '50%',
    transform: [{ translateY: -10 }],
    padding: SIZES.xs,
  },
  submitButton: {
    backgroundColor: '#2980b9',
    borderRadius: 25,
    paddingVertical: SIZES.md,
    alignItems: 'center',
    marginTop: SIZES.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.gray,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: SIZES.fontMd,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SIZES.lg,
    paddingHorizontal: SIZES.xs,
  },
  linkText: {
    fontSize: SIZES.fontSm,
    color: COLORS.textLight,
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;