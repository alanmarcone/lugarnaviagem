import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface Seat {
  id: number;
  isOccupied: boolean;
}

const BusSeatSelector = () => {
  const { toast } = useToast();
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [occupiedSeats, setOccupiedSeats] = useState<number[]>([]);
  const isMobile = useIsMobile();

  // Initialize seats array (50 seats)
  const initialSeats: Seat[] = Array.from({ length: 50 }, (_, index) => ({
    id: index + 1,
    isOccupied: false
  }));

  const [seats] = useState<Seat[]>(initialSeats);

  const handleSeatClick = (seatId: number) => {
    console.log(`Seat ${seatId} clicked`);
    
    if (occupiedSeats.includes(seatId)) {
      toast({
        title: "Assento indisponível",
        description: "Este assento já está ocupado.",
        variant: "destructive"
      });
      return;
    }

    if (selectedSeat === seatId) {
      setSelectedSeat(null);
      toast({
        title: "Seleção removida",
        description: `Assento ${seatId} foi desmarcado.`
      });
    } else {
      if (selectedSeat) {
        toast({
          title: "Apenas um assento permitido",
          description: "Por favor, desmarque o assento atual antes de selecionar outro.",
          variant: "destructive"
        });
        return;
      }
      setSelectedSeat(seatId);
      toast({
        title: "Assento selecionado",
        description: `Você selecionou o assento ${seatId}.`
      });
    }
  };

  const confirmSelection = () => {
    if (selectedSeat) {
      setOccupiedSeats([...occupiedSeats, selectedSeat]);
      setSelectedSeat(null);
      toast({
        title: "Reserva confirmada",
        description: `Assento ${selectedSeat} foi reservado com sucesso!`
      });
    }
  };

  const renderSeat = (seatId: number) => {
    const isSelected = selectedSeat === seatId;
    const isOccupied = occupiedSeats.includes(seatId);

    return (
      <button
        key={seatId}
        onClick={() => handleSeatClick(seatId)}
        className={cn(
          "w-8 h-8 md:w-12 md:h-12 rounded-lg m-1 transition-all duration-200 flex items-center justify-center text-xs md:text-sm font-medium",
          isOccupied ? "bg-red-500 text-white cursor-not-allowed" :
          isSelected ? "bg-blue-500 text-white" :
          "bg-gray-100 hover:bg-gray-200"
        )}
        disabled={isOccupied}
      >
        {seatId}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 md:py-12 px-2 md:px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4 flex-col md:flex-row gap-4 md:gap-0">
          <h1 className="text-2xl md:text-3xl font-bold">Seleção de Assentos</h1>
          <button
            onClick={() => {
              localStorage.removeItem("user");
              window.location.href = "/login";
            }}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Sair
          </button>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
          <div className="flex justify-center md:justify-between items-center mb-8 flex-wrap gap-4">
            <div className="flex gap-4 flex-wrap justify-center">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-100 rounded"></div>
                <span>Disponível</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span>Selecionado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>Ocupado</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center">
            {/* Motorista */}
            <div className="w-full text-center mb-8">
              <div className="bg-gray-200 rounded-lg p-2 inline-block">
                Motorista
              </div>
            </div>

            <div className="flex justify-center w-full max-w-3xl overflow-x-auto">
              <div className={cn(
                "grid gap-2",
                isMobile ? "grid-cols-2" : "grid-cols-4"
              )}>
                {/* Assentos 1-48 */}
                {Array.from({ length: 48 }, (_, i) => (
                  <div key={i + 1}>{renderSeat(i + 1)}</div>
                ))}
                
                {/* Assentos 49-50 juntos */}
                <div className="col-span-2 flex justify-center gap-2">
                  {renderSeat(49)}
                  {renderSeat(50)}
                </div>
              </div>
            </div>

            {/* Bottom section */}
            <div className="grid grid-cols-2 gap-4 mt-8 w-full max-w-md">
              <div className="text-center">
                <div className="bg-blue-100 rounded-lg p-2">
                  Geladeira
                </div>
              </div>
              <div className="text-center">
                <div className="bg-orange-100 rounded-lg p-2">
                  Toalete
                </div>
              </div>
            </div>

            {selectedSeat && (
              <div className="mt-8">
                <button
                  onClick={confirmSelection}
                  className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  Confirmar Reserva do Assento {selectedSeat}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusSeatSelector;