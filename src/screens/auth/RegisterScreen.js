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

const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('register');

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    // Validasi nama
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Nama lengkap harus diisi');
      return false;
    }

    if (formData.name.trim().length < 3) {
      Alert.alert('Error', 'Nama minimal 3 karakter');
      return false;
    }

    // Validasi username
    if (!formData.username.trim()) {
      Alert.alert('Error', 'Username harus diisi');
      return false;
    }

    if (formData.username.trim().length < 3) {
      Alert.alert('Error', 'Username minimal 3 karakter');
      return false;
    }

    // Validasi username hanya huruf, angka, underscore
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(formData.username)) {
      Alert.alert('Error', 'Username hanya boleh mengandung huruf, angka, dan underscore');
      return false;
    }

    // Validasi password
    if (!formData.password) {
      Alert.alert('Error', 'Password harus diisi');
      return false;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password minimal 6 karakter');
      return false;
    }

    // Validasi confirm password
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Password dan konfirmasi password tidak sama');
      return false;
    }

    // Validasi phone (optional tapi kalau diisi harus valid)
    if (formData.phone && formData.phone.length > 0) {
      const phoneRegex = /^[0-9]{10,15}$/;
      if (!phoneRegex.test(formData.phone)) {
        Alert.alert('Error', 'Nomor telepon tidak valid (10-15 digit)');
        return false;
      }
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);

      // Prepare data
      const registerData = {
        name: formData.name.trim(),
        username: formData.username.trim(),
        password: formData.password,
        phone: formData.phone.trim() || '',
        address: formData.address.trim() || '',
      };

      const result = await register(registerData);

      if (result.success) {
        Alert.alert(
          'Berhasil',
          'Registrasi berhasil! Selamat datang di HydraGas',
          [{ text: 'OK' }]
        );
        // Navigation akan otomatis redirect ke customer screens
      } else {
        Alert.alert('Registrasi Gagal', result.message || 'Terjadi kesalahan saat registrasi');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Terjadi kesalahan saat registrasi');
    } finally {
      setIsLoading(false);
    }
  };

  const goToLogin = () => {
    navigation.goBack();
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
          showsVerticalScrollIndicator={false}
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
            <Text style={styles.title}>REGISTRASI</Text>

            {/* Tab Switcher */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'login' && styles.activeTab]}
                onPress={() => {
                  setActiveTab('login');
                  goToLogin();
                }}
              >
                <Text style={[styles.tabText, activeTab === 'login' && styles.activeTabText]}>
                  Login
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'register' && styles.activeTab]}
                onPress={() => setActiveTab('register')}
              >
                <Text style={[styles.tabText, activeTab === 'register' && styles.activeTabText]}>
                  Register
                </Text>
              </TouchableOpacity>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              {/* Nama Lengkap */}
              <TextInput
                style={styles.input}
                placeholder="name"
                value={formData.name}
                onChangeText={(value) => handleChange('name', value)}
                autoCapitalize="words"
                editable={!isLoading}
                placeholderTextColor={COLORS.textLight}
              />

              {/* Username */}
              <TextInput
                style={styles.input}
                placeholder="username"
                value={formData.username}
                onChangeText={(value) => handleChange('username', value)}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
                placeholderTextColor={COLORS.textLight}
              />

              {/* Password */}
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="password"
                  value={formData.password}
                  onChangeText={(value) => handleChange('password', value)}
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

              {/* Confirm Password */}
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Konfirmasi Password"
                  value={formData.confirmPassword}
                  onChangeText={(value) => handleChange('confirmPassword', value)}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                  placeholderTextColor={COLORS.textLight}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Icon
                    name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color={COLORS.textLight}
                  />
                </TouchableOpacity>
              </View>

              {/* Phone */}
              <TextInput
                style={styles.input}
                placeholder="phone"
                value={formData.phone}
                onChangeText={(value) => handleChange('phone', value)}
                keyboardType="phone-pad"
                editable={!isLoading}
                placeholderTextColor={COLORS.textLight}
              />

              {/* Address */}
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="address"
                value={formData.address}
                onChangeText={(value) => handleChange('address', value)}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                editable={!isLoading}
                placeholderTextColor={COLORS.textLight}
              />

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                onPress={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.submitButtonText}>SUBMIT</Text>
                )}
              </TouchableOpacity>
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
  textArea: {
    minHeight: 80,
    paddingTop: SIZES.md,
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
});

export default RegisterScreen;