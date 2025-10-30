import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SIZES } from '../../utils/constants';

const ChangePasswordScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    // Validasi password lama
    if (!formData.currentPassword) {
      Alert.alert('Error', 'Password lama harus diisi');
      return false;
    }

    if (formData.currentPassword.length < 6) {
      Alert.alert('Error', 'Password lama minimal 6 karakter');
      return false;
    }

    // Validasi password baru
    if (!formData.newPassword) {
      Alert.alert('Error', 'Password baru harus diisi');
      return false;
    }

    if (formData.newPassword.length < 6) {
      Alert.alert('Error', 'Password baru minimal 6 karakter');
      return false;
    }

    // Validasi konfirmasi password
    if (formData.newPassword !== formData.confirmPassword) {
      Alert.alert('Error', 'Password baru dan konfirmasi password tidak sama');
      return false;
    }

    // Pastikan password baru berbeda dengan password lama
    if (formData.currentPassword === formData.newPassword) {
      Alert.alert('Error', 'Password baru harus berbeda dengan password lama');
      return false;
    }

    return true;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);

      // TODO: Panggil API change password
      // Untuk sementara, simulasi success
      await new Promise((resolve) => setTimeout(resolve, 1500));

      Alert.alert(
        'Berhasil',
        'Password berhasil diubah. Silakan login kembali dengan password baru.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', error.message || 'Gagal mengubah password');
    } finally {
      setIsLoading(false);
    }
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
        {/* Header Info */}
        <View style={styles.headerInfo}>
          <Icon name="lock-closed" size={60} color={COLORS.primary} />
          <Text style={styles.title}>Ganti Password</Text>
          <Text style={styles.subtitle}>Buat password yang kuat dan mudah diingat</Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {/* Password Lama */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password Lama *</Text>
            <View style={styles.inputContainer}>
              <Icon
                name="lock-closed-outline"
                size={20}
                color={COLORS.textLight}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Masukkan password lama"
                value={formData.currentPassword}
                onChangeText={(value) => handleChange('currentPassword', value)}
                secureTextEntry={!showCurrentPassword}
                autoCapitalize="none"
                editable={!isLoading}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                <Icon
                  name={showCurrentPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color={COLORS.textLight}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Password Baru */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password Baru *</Text>
            <View style={styles.inputContainer}>
              <Icon
                name="lock-closed-outline"
                size={20}
                color={COLORS.textLight}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Masukkan password baru"
                value={formData.newPassword}
                onChangeText={(value) => handleChange('newPassword', value)}
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
                editable={!isLoading}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                <Icon
                  name={showNewPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color={COLORS.textLight}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Konfirmasi Password Baru */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Konfirmasi Password Baru *</Text>
            <View style={styles.inputContainer}>
              <Icon
                name="lock-closed-outline"
                size={20}
                color={COLORS.textLight}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Ulangi password baru"
                value={formData.confirmPassword}
                onChangeText={(value) => handleChange('confirmPassword', value)}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
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
          </View>

          {/* Password Requirements */}
          <View style={styles.requirementsContainer}>
            <Text style={styles.requirementsTitle}>Syarat Password:</Text>
            <View style={styles.requirementItem}>
              <Icon name="checkmark-circle" size={16} color={COLORS.success} />
              <Text style={styles.requirementText}>Minimal 6 karakter</Text>
            </View>
            <View style={styles.requirementItem}>
              <Icon name="checkmark-circle" size={16} color={COLORS.success} />
              <Text style={styles.requirementText}>Kombinasi huruf dan angka lebih baik</Text>
            </View>
          </View>

          {/* Change Password Button */}
          <TouchableOpacity
            style={[
              styles.changeButton,
              isLoading && styles.changeButtonDisabled,
            ]}
            onPress={handleChangePassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Icon name="shield-checkmark" size={20} color={COLORS.white} />
                <Text style={styles.changeButtonText}>Ubah Password</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={isLoading}
          >
            <Text style={styles.cancelButtonText}>Batal</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SIZES.lg,
  },
  headerInfo: {
    alignItems: 'center',
    paddingVertical: SIZES.xl,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    marginBottom: SIZES.lg,
  },
  title: {
    fontSize: SIZES.fontXl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SIZES.md,
  },
  subtitle: {
    fontSize: SIZES.fontSm,
    color: COLORS.textLight,
    marginTop: SIZES.xs,
    textAlign: 'center',
    paddingHorizontal: SIZES.lg,
  },
  formContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.lg,
  },
  inputGroup: {
    marginBottom: SIZES.lg,
  },
  label: {
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.light,
    borderRadius: SIZES.radiusMd,
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
  requirementsContainer: {
    backgroundColor: COLORS.light,
    padding: SIZES.md,
    borderRadius: SIZES.radiusMd,
    marginBottom: SIZES.lg,
  },
  requirementsTitle: {
    fontSize: SIZES.fontSm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SIZES.xs,
  },
  requirementText: {
    fontSize: SIZES.fontSm,
    color: COLORS.textLight,
    marginLeft: SIZES.sm,
  },
  changeButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusMd,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  changeButtonDisabled: {
    backgroundColor: COLORS.gray,
  },
  changeButtonText: {
    color: COLORS.white,
    fontSize: SIZES.fontMd,
    fontWeight: 'bold',
    marginLeft: SIZES.sm,
  },
  cancelButton: {
    backgroundColor: COLORS.light,
    borderRadius: SIZES.radiusMd,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLORS.text,
    fontSize: SIZES.fontMd,
    fontWeight: '600',
  },
});

export default ChangePasswordScreen;