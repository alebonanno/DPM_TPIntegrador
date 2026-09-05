import { Switch as RNSwitch } from 'react-native';

// define qué cosas puede recibir Interruptor.
interface InterruptorProps {
    valor: boolean;
    // Se ejecutará cuando el usuario toque el interruptor.
    alCambiar: (valor: boolean) => void;
    colorActivo?: string;
}

// Crea componente Interruptor.
// Pide las 3 propiedades de lcontrato de InterruptorProps.
export default function Interruptor({
    valor,
    alCambiar,
    colorActivo
    // InterruptorProps => Estas propiedades tienen que respetar la estructura/contrato de InterruptorProps.
}: InterruptorProps) {
    return (
        <RNSwitch
            value={valor}
            onValueChange={alCambiar}
            trackColor={{ true: colorActivo ?? '#1B6CA8' }}
        />
    );
}
