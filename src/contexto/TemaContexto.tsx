import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';


type Tema = 'claro' | 'oscuro' | 'sistema';

interface TemaContextoType {
    tema: Tema;
    temaReal: 'claro' | 'oscuro';
    cambiarTema: (tema: Tema) => void;
}

const TemaContexto = createContext<TemaContextoType | null>(null);

export function TemaProvider({ children }: { children: React.ReactNode }) {
    const [tema, setTema] = useState<Tema>('claro');
    useEffect(() => {
        AsyncStorage.getItem('tema').then((guardado) => {
            if (guardado === 'claro' || guardado === 'oscuro' || guardado === 'sistema') {
                setTema(guardado);
            }
        });
    }, []);
    const colorScheme = useColorScheme();

    const temaReal =
        tema === 'sistema'
            ? colorScheme === 'dark'
                ? 'oscuro'
                : 'claro'
            : tema;

    async function cambiarTema(nuevoTema: Tema) {
        setTema(nuevoTema);

        try {
            await AsyncStorage.setItem('tema', nuevoTema);
        } catch (error) {
            console.error('No se pudo guardar el tema:', error);
        }
    }


    return (
        <TemaContexto.Provider
            value={{
                tema,
                temaReal,
                cambiarTema,
            }}
        >
            {children}
        </TemaContexto.Provider>
    );
}

export function useTema() {
    const contexto = useContext(TemaContexto);

    if (!contexto) {
        throw new Error('useTema debe usarse dentro de TemaProvider');
    }

    return contexto;
}
