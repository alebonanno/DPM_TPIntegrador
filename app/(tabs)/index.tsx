import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { obtenerParadas } from '../../src/servicios/parada';
import { Parada } from '@/src/tipos/parada';

export default function HomeScreen() {
  const [paradas, setParadas] = useState<Parada[]>([]);

  useEffect(() => {
    async function cargarParadas() {
      const datos = await obtenerParadas();
      setParadas(datos);
    }

    cargarParadas();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Paraná Bus</Text>

      <Text style={styles.subtitulo}>Tus paradas</Text>

      {paradas.map((parada) => (
        <View key={parada.id} style={styles.parada}>
          <Text style={styles.nombre}>
            {parada.nombre}
          </Text>

          <Text>
            Líneas: {parada.lineaIds.join(', ')}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#fff',
  },

  titulo: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
  },

  subtitulo: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 16,
  },

  parada: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#f1f1f1',
  },

  nombre: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
});
