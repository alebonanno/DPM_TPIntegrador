import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

interface BotonVolverProps {
  color?: string;
}

export default function BotonVolver({ color = '#333' }: BotonVolverProps) {
  const router = useRouter();

  return (
    <TouchableOpacity 
      style={styles.boton} 
      onPress={() => router.back()}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // Mejora el área táctil
    >
      <Ionicons name="arrow-back" size={24} color={color} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  boton: {
    padding: 8,
    marginLeft: 8,
  },
});