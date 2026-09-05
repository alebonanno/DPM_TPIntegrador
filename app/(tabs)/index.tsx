import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { obtenerParadas } from '../../src/servicios/parada';
import { Parada } from '@/src/tipos/parada';

import { useTema } from '@/src/contexto/TemaContexto';
import { colores } from '@/src/tema/colores';

export default function HomeScreen() {
  const [paradas, setParadas] = useState<Parada[]>([]);
  const { temaReal } = useTema();
  const coloresActuales = colores[temaReal];

  useEffect(() => {
    async function cargarParadas() {
      const datos = await obtenerParadas();
      setParadas(datos);
    }

    cargarParadas();
  }, []);

  return (
    <View style={[
      styles.container,
      { backgroundColor: coloresActuales.fondo },
    ]}>
      <Text style={[
        styles.titulo,
        { color: coloresActuales.texto },
      ]}>
        Paraná Bus
      </Text>

      <Text style={[
        styles.subtitulo,
        { color: coloresActuales.texto },
      ]}>
        Tus paradas
      </Text>

      <FlatList
        data={paradas}
        keyExtractor={(parada) => parada.id}
        renderItem={({ item: parada }) => (
          <View style={[
            styles.parada,
            { backgroundColor: coloresActuales.tarjeta },
          ]}>
            <Text style={[
              styles.nombre,
              { color: coloresActuales.texto },
            ]}>
              {parada.nombre}
            </Text>

            <Text style={{ color: coloresActuales.textoItem }}>
              Líneas: {parada.lineaIds.join(', ')}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
  },

  titulo: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    textDecorationLine: 'underline',
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
  },

  nombre: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
});
