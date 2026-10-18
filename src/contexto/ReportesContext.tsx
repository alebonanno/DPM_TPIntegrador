import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { crearReporte, obtenerReportes } from '../servicios/reporte'; // <-- Importamos tus servicios
import { ReporteDeDemora } from '../tipos/reporte';

interface ReportesContextType {
  reportes: ReporteDeDemora[];
  agregarReporte: (reporteParcial: Omit<ReporteDeDemora, 'id' | 'confirmaciones' | 'fechaHora' | 'sincronizado'>) => Promise<void>;
  confirmarReporte: (id: string) => void;
}

const ReportesContext = createContext<ReportesContextType | undefined>(undefined);

export function ReportesProvider({ children }: { children: ReactNode }) {
  const [reportes, setReportes] = useState<ReporteDeDemora[]>([]);

  // Al iniciar la app, cargamos los reportes reales desde AsyncStorage usando tu servicio
  useEffect(() => {
    async function cargarDatosIniciales() {
      const datosLocales = await obtenerReportes();
      setReportes(datosLocales);
    }
    cargarDatosIniciales();
  }, []);

  // Función para crear un reporte usando tu servicio offline
  const agregarReporte = async (reporteParcial: Omit<ReporteDeDemora, 'id' | 'confirmaciones' | 'fechaHora' | 'sincronizado'>) => {
    try {
      // Llamamos a la función de tu servicio que maneja AsyncStorage y la cola de pendientes
      const nuevoReporte = await crearReporte(reporteParcial);
      
      // Actualizamos el estado de React para reflejarlo al instante en la pantalla
      setReportes((prevReportes) => [nuevoReporte, ...prevReportes]);
    } catch (error) {
      console.error('Error al agregar reporte desde el contexto:', error);
    }
  };

  const confirmarReporte = (id: string) => {
    setReportes((prevReportes) =>
      prevReportes.map((rep) =>
        rep.id === id ? { ...rep, confirmaciones: rep.confirmaciones + 1 } : rep
      )
    );
  };

  return (
    <ReportesContext.Provider value={{ reportes, agregarReporte, confirmarReporte }}>
      {children}
    </ReportesContext.Provider>
  );
}

export function useReportes() {
  const context = useContext(ReportesContext);
  if (!context) {
    throw new Error('useReportes debe usarse dentro de un ReportesProvider');
  }
  return context;
}