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
import { COLORS, SIZES } from '../../utils/constants';

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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.backButton} onPress={goToLogin}>
            <Icon name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Daftar Akun</Text>
          <Text style={styles.subtitle}>Buat akun customer baru</Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {/* Nama Lengkap */}
          <View style={styles.inputContainer}>
            <Icon name="person-outline" size={20} color={COLORS.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Nama Lengkap *"
              value={formData.name}
              onChangeText={(value) => handleChange('name', value)}
              autoCapitalize="words"
              editable={!isLoading}
            />
          </View>

          {/* Username */}
          <View style={styles.inputContainer}>
            <Icon name="at-outline" size={20} color={COLORS.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Username *"
              value={formData.username}
              onChangeText={(value) => handleChange('username', value)}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          {/* Password */}
          <View style={styles.inputContainer}>
            <Icon name="lock-closed-outline" size={20} color={COLORS.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password *"
              value={formData.password}
              onChangeText={(value) => handleChange('password', value)}
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

          {/* Confirm Password */}
          <View style={styles.inputContainer}>
            <Icon name="lock-closed-outline" size={20} color={COLORS.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Konfirmasi Password *"
              value={formData.confirmPassword}
              onChangeText={(value) => handleChange('confirmPassword', value)}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
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
          <View style={styles.inputContainer}>
            <Icon name="call-outline" size={20} color={COLORS.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Nomor Telepon (Opsional)"
              value={formData.phone}
              onChangeText={(value) => handleChange('phone', value)}
              keyboardType="phone-pad"
              editable={!isLoading}
            />
          </View>

          {/* Address */}
          <View style={[styles.inputContainer, styles.textAreaContainer]}>
            <Icon name="location-outline" size={20} color={COLORS.textLight} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Alamat Lengkap (Opsional)"
              value={formData.address}
              onChangeText={(value) => handleChange('address', value)}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              editable={!isLoading}
            />
          </View>

          {/* Info */}
          <Text style={styles.infoText}>* Wajib diisi</Text>

          {/* Register Button */}
          <TouchableOpacity
            style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.registerButtonText}>Daftar</Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Sudah punya akun? </Text>
            <TouchableOpacity onPress={goToLogin} disabled={isLoading}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
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
    padding: SIZES.lg,
  },
  headerContainer: {
    marginBottom: SIZES.xl,
    marginTop: SIZES.xl,
  },
  backButton: {
    marginBottom: SIZES.md,
  },
  title: {
    fontSize: SIZES.fontXxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  subtitle: {
    fontSize: SIZES.fontMd,
    color: COLORS.textLight,
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
    minHeight: 50,
  },
  textAreaContainer: {
    alignItems: 'flex-start',
    paddingVertical: SIZES.md,
    minHeight: 80,
  },
  inputIcon: {
    marginRight: SIZES.sm,
  },
  input: {
    flex: 1,
    fontSize: SIZES.fontMd,
    color: COLORS.text,
  },
  textArea: {
    minHeight: 60,
  },
  eyeIcon: {
    padding: SIZES.sm,
  },
  infoText: {
    fontSize: SIZES.fontSm,
    color: COLORS.textLight,
    marginBottom: SIZES.md,
  },
  registerButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusMd,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SIZES.md,
  },
  registerButtonDisabled: {
    backgroundColor: COLORS.gray,
  },
  registerButtonText: {
    color: COLORS.white,
    fontSize: SIZES.fontMd,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SIZES.lg,
  },
  loginText: {
    fontSize: SIZES.fontMd,
    color: COLORS.textLight,
  },
  loginLink: {
    fontSize: SIZES.fontMd,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});

export default RegisterScreen;