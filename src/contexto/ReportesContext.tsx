import React, { createContext, ReactNode, useContext, useState } from 'react';
import { ReporteDeDemora } from '../tipos/reporte';

// Definimos qué funciones y datos va a exponer el contexto
interface ReportesContextType {
  reportes: ReporteDeDemora[];
  agregarReporte: (reporteParcial: Omit<ReporteDeDemora, 'id' | 'confirmaciones' | 'fechaHora' | 'sincronizado'>) => void;
  confirmarReporte: (id: string) => void;
}

const ReportesContext = createContext<ReportesContextType | undefined>(undefined);

export function ReportesProvider({ children }: { children: ReactNode }) {
  // Iniciamos con un arreglo vacío (o podrías poner mocks aquí para probar)
  const [reportes, setReportes] = useState<ReporteDeDemora[]>([]);

  // Función para crear un reporte (autocompleta la fecha, el ID y arranca en 0 confirmaciones)
  const agregarReporte = (reporteParcial: Omit<ReporteDeDemora, 'id' | 'confirmaciones' | 'fechaHora' | 'sincronizado'>) => {
    const nuevoReporte: ReporteDeDemora = {
      ...reporteParcial,
      id: Math.random().toString(36).substring(7), // Genera un ID aleatorio temporal
      confirmaciones: 0,
      fechaHora: new Date().toISOString(),
      sincronizado: false,
    };
    
    // Lo agregamos al principio de la lista
    setReportes((prevReportes) => [nuevoReporte, ...prevReportes]);
  };

  // Función para sumar una confirmación a un reporte específico
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

// Hook personalizado para usar el contexto fácilmente
export function useReportes() {
  const context = useContext(ReportesContext);
  if (!context) {
    throw new Error('useReportes debe usarse dentro de un ReportesProvider');
  }
  return context;
}