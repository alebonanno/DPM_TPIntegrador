import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface FavoritosContextType {
  lineasFavoritas: string[];
  paradasFavoritas: string[];
  toggleLineaFavorita: (id: string) => void;
  toggleParadaFavorita: (id: string) => void;
}

const FavoritosContext = createContext<FavoritosContextType | undefined>(undefined);

export function FavoritosProvider({ children }: { children: ReactNode }) {
  const [lineasFavoritas, setLineasFavoritas] = useState<string[]>([]);
  const [paradasFavoritas, setParadasFavoritas] = useState<string[]>([]);

  // Cargar favoritos desde la memoria del teléfono al iniciar
  useEffect(() => {
    async function cargarFavoritos() {
      try {
        const lineasGuardadas = await AsyncStorage.getItem('@favoritos_lineas');
        const paradasGuardadas = await AsyncStorage.getItem('@favoritos_paradas');
        if (lineasGuardadas) setLineasFavoritas(JSON.parse(lineasGuardadas));
        if (paradasGuardadas) setParadasFavoritas(JSON.parse(paradasGuardadas));
      } catch (error) {
        console.error("Error cargando favoritos", error);
      }
    }
    cargarFavoritos();
  }, []);

  // Funciones para agregar/quitar y guardar en disco
  const toggleLineaFavorita = async (id: string) => {
    const nuevaLista = lineasFavoritas.includes(id)
      ? lineasFavoritas.filter(favId => favId !== id)
      : [...lineasFavoritas, id];
    
    setLineasFavoritas(nuevaLista);
    await AsyncStorage.setItem('@favoritos_lineas', JSON.stringify(nuevaLista));
  };

  const toggleParadaFavorita = async (id: string) => {
    const nuevaLista = paradasFavoritas.includes(id)
      ? paradasFavoritas.filter(favId => favId !== id)
      : [...paradasFavoritas, id];
    
    setParadasFavoritas(nuevaLista);
    await AsyncStorage.setItem('@favoritos_paradas', JSON.stringify(nuevaLista));
  };

  return (
    <FavoritosContext.Provider value={{ lineasFavoritas, paradasFavoritas, toggleLineaFavorita, toggleParadaFavorita }}>
      {children}
    </FavoritosContext.Provider>
  );
}

export function useFavoritos() {
  const context = useContext(FavoritosContext);
  if (!context) throw new Error('useFavoritos debe usarse dentro de un FavoritosProvider');
  return context;
}