import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type FicheType = 'Qualité' | 'Sécurité' | 'Environnement';

interface TypeSelectorProps {
  value: FicheType;
  onChange: (value: FicheType) => void;
}

export const TypeSelector: React.FC<TypeSelectorProps> = ({
  value,
  onChange,
}) => {
  const options: { key: FicheType; color: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'Qualité', color: '#2196F3', icon: 'checkmark-circle' },
    { key: 'Sécurité', color: '#FF9800', icon: 'shield-checkmark' },
    { key: 'Environnement', color: '#4CAF50', icon: 'leaf' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Type de déclaration *</Text>
      <View style={styles.options}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.option,
              value === option.key && { backgroundColor: option.color, borderColor: option.color },
            ]}
            onPress={() => onChange(option.key)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={option.icon}
              size={32}
              color={value === option.key ? '#FFF' : option.color}
            />
            <Text
              style={[
                styles.optionText,
                { color: value === option.key ? '#FFF' : option.color },
              ]}
            >
              {option.key}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 16,
  },
  options: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  option: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginHorizontal: 6,
    borderRadius: 16,
    backgroundColor: '#2A2A2A',
    borderWidth: 2,
    borderColor: '#444',
    minHeight: 100,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
  },
});
