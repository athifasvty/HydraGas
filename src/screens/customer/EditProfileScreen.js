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

const EditProfileScreen = ({ navigation }) => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    // Validasi nama
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Nama harus diisi');
      return false;
    }

    if (formData.name.trim().length < 3) {
      Alert.alert('Error', 'Nama minimal 3 karakter');
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

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);

      // Update user data di context (untuk sementara, nanti bisa panggil API update profile)
      const updatedUser = {
        ...user,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
      };

      const result = await updateUser(updatedUser);

      if (result.success) {
        Alert.alert('Berhasil', 'Profile berhasil diupdate', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert('Gagal', 'Gagal update profile');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Terjadi kesalahan');
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
          <Icon name="person-circle" size={80} color={COLORS.primary} />
          <Text style={styles.username}>@{user?.username}</Text>
          <Text style={styles.hint}>Username tidak bisa diubah</Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {/* Nama Lengkap */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nama Lengkap *</Text>
            <View style={styles.inputContainer}>
              <Icon
                name="person-outline"
                size={20}
                color={COLORS.textLight}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Nama Lengkap"
                value={formData.name}
                onChangeText={(value) => handleChange('name', value)}
                autoCapitalize="words"
                editable={!isLoading}
              />
            </View>
          </View>

          {/* Nomor Telepon */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nomor Telepon</Text>
            <View style={styles.inputContainer}>
              <Icon
                name="call-outline"
                size={20}
                color={COLORS.textLight}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="08xxxxxxxxxx"
                value={formData.phone}
                onChangeText={(value) => handleChange('phone', value)}
                keyboardType="phone-pad"
                editable={!isLoading}
              />
            </View>
          </View>

          {/* Alamat */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Alamat Lengkap</Text>
            <View style={[styles.inputContainer, styles.textAreaContainer]}>
              <Icon
                name="location-outline"
                size={20}
                color={COLORS.textLight}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Alamat lengkap Anda"
                value={formData.address}
                onChangeText={(value) => handleChange('address', value)}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                editable={!isLoading}
              />
            </View>
          </View>

          {/* Info */}
          <Text style={styles.infoText}>* Wajib diisi</Text>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Icon name="checkmark-circle" size={20} color={COLORS.white} />
                <Text style={styles.saveButtonText}>Simpan Perubahan</Text>
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
  username: {
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SIZES.sm,
  },
  hint: {
    fontSize: SIZES.fontSm,
    color: COLORS.textLight,
    marginTop: SIZES.xs,
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
    minHeight: 50,
  },
  textAreaContainer: {
    alignItems: 'flex-start',
    paddingVertical: SIZES.md,
    minHeight: 100,
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
    minHeight: 80,
  },
  infoText: {
    fontSize: SIZES.fontSm,
    color: COLORS.textLight,
    marginBottom: SIZES.lg,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusMd,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  saveButtonDisabled: {
    backgroundColor: COLORS.gray,
  },
  saveButtonText: {
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

export default EditProfileScreen;