import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { obtenerParadas } from '../src/servicios/parada';

export default function EscanerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [escaneando, setEscaneando] = useState(false);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permisoContainer}>
        <Text style={styles.textoPermiso}>Necesitamos permiso para usar la cámara y escanear códigos QR.</Text>
        <TouchableOpacity style={styles.botonPermiso} onPress={requestPermission}>
          <Text style={styles.textoBoton}>Otorgar Permiso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (escaneando) return;
    setEscaneando(true);

    try {
      // Validamos formato: ej. transportapp://parada/par-101 o similar
      // También aceptamos si viene directamente el ID o la URL
      let paradaId = '';
      if (data.includes('parada/')) {
        paradaId = data.split('parada/')[1];
      } else if (data.startsWith('par-')) {
        paradaId = data;
      } else {
        // Si escanean cualquier otro QR ajeno (ej. una URL de Google, un ticket, etc.)
        Alert.alert('Aviso', 'El código QR escaneado no pertenece a una parada de colectivo válida.', [
          { text: 'OK', onPress: () => setEscaneando(false) }
        ]);
        return;
      }

      // Verificamos que la parada exista en nuestro sistema
      const paradas = await obtenerParadas();
      const paradaEncontrada = paradas.find((p) => p.id === paradaId);

      if (paradaEncontrada) {
        // Volvemos al mapa y pasamos el ID de la parada para seleccionarla automáticamente
        router.back();
        // Opcional: podrías disparar un evento o pasar parámetros por ruta
      } else {
        Alert.alert('No encontrada', 'La parada escaneada no existe en el sistema.', [
          { text: 'OK', onPress: () => setEscaneando(false) }
        ]);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo procesar el código QR.', [
        { text: 'OK', onPress: () => setEscaneando(false) }
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={escaneando ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      >
        <View style={styles.overlay}>
          <View style={styles.encuadre} />
          <Text style={styles.instruccion}>Enfoca el código QR de la parada</Text>
          <TouchableOpacity style={styles.botonVolver} onPress={() => router.back()}>
            <Text style={styles.textoBoton}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  permisoContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  textoPermiso: { textAlign: 'center', fontSize: 16, marginBottom: 20, color: '#333' },
  botonPermiso: { backgroundColor: '#1B6CA8', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  textoBoton: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  encuadre: { width: 250, height: 250, borderWidth: 2, borderColor: '#FFD700', borderRadius: 16, backgroundColor: 'transparent' },
  instruccion: { color: '#fff', fontSize: 16, marginTop: 24, fontWeight: '600' },
  botonVolver: { position: 'absolute', bottom: 50, backgroundColor: '#d9534f', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 8 },
});