import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';
import { COLORS, SIZES } from '../../utils/constants';

const EditProfileScreen = ({ navigation }) => {
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Handle input change
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error saat user mulai ngetik
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nama tidak boleh kosong';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Nomor telepon tidak boleh kosong';
    } else if (!/^[0-9]{10,15}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Nomor telepon tidak valid (10-15 digit)';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Alamat tidak boleh kosong';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validasi Gagal', 'Mohon perbaiki data yang tidak valid');
      return;
    }

    Alert.alert(
      'Konfirmasi',
      'Simpan perubahan profile?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya, Simpan',
          onPress: () => submitUpdate(),
        },
      ]
    );
  };

  // Submit update to API
  const submitUpdate = async () => {
    try {
      setLoading(true);

      console.log('📤 Updating profile:', formData);

      // API endpoint untuk update profile
      const response = await apiClient.put('/kurir/profile.php', formData);

      console.log('✅ Update response:', response);

      if (response.success) {
        // Update user di context
        const updatedUser = {
          ...user,
          ...formData,
        };
        await updateUser(updatedUser);

        Alert.alert(
          'Berhasil!',
          'Profile berhasil diperbarui',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Gagal', response.message || 'Gagal memperbarui profile');
      }
    } catch (error) {
      console.error('❌ Update error:', error);
      Alert.alert('Error', error.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  // Render input field
  const renderInput = (
    icon,
    label,
    field,
    placeholder,
    keyboardType = 'default',
    multiline = false
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View
        style={[
          styles.inputWrapper,
          errors[field] && styles.inputWrapperError,
        ]}
      >
        <Icon
          name={icon}
          size={20}
          color={errors[field] ? COLORS.danger : COLORS.textLight}
          style={styles.inputIcon}
        />
        <TextInput
          style={[
            styles.input,
            multiline && styles.inputMultiline,
          ]}
          value={formData[field]}
          onChangeText={(value) => handleChange(field, value)}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textLight}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? 4 : 1}
          editable={!loading}
        />
      </View>
      {errors[field] && (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={14} color={COLORS.danger} />
          <Text style={styles.errorText}>{errors[field]}</Text>
        </View>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Icon name="information-circle" size={20} color={COLORS.primary} />
          <Text style={styles.infoText}>
            Update informasi profile Anda di sini
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {renderInput(
            'person-outline',
            'Nama Lengkap',
            'name',
            'Masukkan nama lengkap'
          )}

          {renderInput(
            'call-outline',
            'Nomor Telepon',
            'phone',
            'Masukkan nomor telepon',
            'phone-pad'
          )}

          {renderInput(
            'location-outline',
            'Alamat',
            'address',
            'Masukkan alamat lengkap',
            'default',
            true
          )}
        </View>

        {/* Username Info (Read Only) */}
        <View style={styles.readOnlyContainer}>
          <Icon name="lock-closed" size={16} color={COLORS.textLight} />
          <Text style={styles.readOnlyText}>
            Username tidak dapat diubah: <Text style={styles.readOnlyValue}>{user?.username}</Text>
          </Text>
        </View>
      </ScrollView>

      {/* Save Button (Fixed at bottom) */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Icon name="checkmark-circle" size={24} color={COLORS.white} />
              <Text style={styles.saveButtonText}>Simpan Perubahan</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SIZES.md,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: SIZES.md,
    borderRadius: SIZES.radiusMd,
    marginBottom: SIZES.lg,
    gap: SIZES.sm,
  },
  infoText: {
    flex: 1,
    fontSize: SIZES.fontSm,
    color: COLORS.primary,
  },
  formContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    gap: SIZES.lg,
  },
  inputContainer: {
    gap: SIZES.xs,
  },
  inputLabel: {
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radiusMd,
    borderWidth: 2,
    borderColor: COLORS.border,
    paddingHorizontal: SIZES.md,
  },
  inputWrapperError: {
    borderColor: COLORS.danger,
  },
  inputIcon: {
    marginRight: SIZES.sm,
  },
  input: {
    flex: 1,
    paddingVertical: SIZES.md,
    fontSize: SIZES.fontMd,
    color: COLORS.text,
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: SIZES.md,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  errorText: {
    fontSize: SIZES.fontSm,
    color: COLORS.danger,
  },
  readOnlyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SIZES.md,
    borderRadius: SIZES.radiusMd,
    marginTop: SIZES.md,
    gap: SIZES.sm,
  },
  readOnlyText: {
    flex: 1,
    fontSize: SIZES.fontSm,
    color: COLORS.textLight,
  },
  readOnlyValue: {
    fontWeight: '600',
    color: COLORS.text,
  },
  buttonContainer: {
    padding: SIZES.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radiusMd,
    gap: SIZES.sm,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});

export default EditProfileScreen;