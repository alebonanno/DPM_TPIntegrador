import { Magnetometer } from 'expo-sensors';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { calcularAngulo, calcularDistancia } from '../servicios/ubicacion';
import { Coordenadas } from '../tipos/linea';

interface Props {
  ubicacionUsuario: Coordenadas | null;
  coordenadasParada: Coordenadas;
}

export default function FlechaDireccion({ ubicacionUsuario, coordenadasParada }: Props) {
  const [grados, setGrados] = useState(0);

  useEffect(() => {
    let suscripcion: any;
    
    Magnetometer.setUpdateInterval(100);
    suscripcion = Magnetometer.addListener((data) => {
      let { x, y } = data;
      let anguloBrujula = Math.atan2(y, x) * (180 / Math.PI);
      if (anguloBrujula < 0) anguloBrujula += 360;
      setGrados(anguloBrujula);
    });

    return () => suscripcion && suscripcion.remove();
  }, []);

  if (!ubicacionUsuario) return null;

  const anguloHaciaParada = calcularAngulo(ubicacionUsuario, coordenadasParada);
  const rotacionFlecha = anguloHaciaParada - grados;
  const distancia = calcularDistancia(ubicacionUsuario, coordenadasParada);

  return (
    <View style={styles.container}>
      <View style={[styles.flecha, { transform: [{ rotate: `${rotacionFlecha}deg` }] }]}>
        <Text style={styles.textoFlecha}>⬆</Text>
      </View>
      <Text style={styles.textoDistancia}>A {distancia} m</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
  flecha: { width: 30, height: 30, justifyContent: 'center', alignItems: 'center' },
  textoFlecha: { fontSize: 22, color: '#1B6CA8', fontWeight: 'bold' },
  textoDistancia: { marginLeft: 8, fontSize: 18, fontWeight: '600', color: '#444' },
});