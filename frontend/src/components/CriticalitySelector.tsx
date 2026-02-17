import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Criticality = 'Mineure' | 'Majeure' | 'Critique';

interface CriticalitySelectorProps {
  value: Criticality;
  onChange: (value: Criticality) => void;
}

export const CriticalitySelector: React.FC<CriticalitySelectorProps> = ({
  value,
  onChange,
}) => {
  const options: { key: Criticality; color: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'Mineure', color: '#4CAF50', icon: 'alert-circle-outline' },
    { key: 'Majeure', color: '#FF9800', icon: 'warning-outline' },
    { key: 'Critique', color: '#F44336', icon: 'alert' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Criticité *</Text>
      <View style={styles.options}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.option,
              value === option.key && { backgroundColor: option.color },
            ]}
            onPress={() => onChange(option.key)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={option.icon}
              size={28}
              color={value === option.key ? '#FFF' : option.color}
            />
            <Text
              style={[
                styles.optionText,
                value === option.key && styles.optionTextSelected,
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
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 12,
  },
  options: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  option: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: '#2A2A2A',
    borderWidth: 2,
    borderColor: '#444',
    minHeight: 90,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    marginTop: 8,
  },
  optionTextSelected: {
    color: '#FFF',
  },
});
