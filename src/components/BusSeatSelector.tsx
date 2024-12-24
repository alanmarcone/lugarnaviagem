import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Seat {
  id: number;
  numero: number;
  ocupado: boolean;
  user_id: string | null;
}

const BusSeatSelector = () => {
  const { toast } = useToast();
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  // Fetch seats from Supabase
  const { data: seats = [], isLoading } = useQuery({
    queryKey: ['seats'],
    queryFn: async () => {
      console.log("Fetching seats from Supabase");
      const { data, error } = await supabase
        .from('assentos')
        .select('*')
        .order('numero');
      
      if (error) {
        console.error("Error fetching seats:", error);
        throw error;
      }
      console.log("Seats fetched:", data);
      return data as Seat[];
    }
  });

  // Mutation for updating seat status
  const updateSeatMutation = useMutation({
    mutationFn: async (seatId: number) => {
      console.log("Updating seat:", seatId);
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data, error } = await supabase
        .from('assentos')
        .update({ 
          ocupado: true,
          user_id: userData.user.id 
        })
        .eq('id', seatId)
        .select()
        .single();

      if (error) {
        console.error("Error updating seat:", error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seats'] });
    }
  });

  const handleSeatClick = (seat: Seat) => {
    console.log(`Seat ${seat.numero} clicked`);
    
    if (seat.ocupado) {
      toast({
        title: "Assento indisponível",
        description: "Este assento já está ocupado.",
        variant: "destructive"
      });
      return;
    }

    if (selectedSeat === seat.id) {
      setSelectedSeat(null);
      toast({
        title: "Seleção removida",
        description: `Assento ${seat.numero} foi desmarcado.`
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
      setSelectedSeat(seat.id);
      toast({
        title: "Assento selecionado",
        description: `Você selecionou o assento ${seat.numero}.`
      });
    }
  };

  const confirmSelection = async () => {
    if (selectedSeat) {
      try {
        await updateSeatMutation.mutateAsync(selectedSeat);
        setSelectedSeat(null);
        toast({
          title: "Reserva confirmada",
          description: `Assento foi reservado com sucesso!`
        });
      } catch (error) {
        console.error("Error confirming selection:", error);
        toast({
          title: "Erro na reserva",
          description: "Não foi possível reservar o assento. Tente novamente.",
          variant: "destructive"
        });
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const renderSeat = (seat: Seat) => {
    const isSelected = selectedSeat === seat.id;

    return (
      <button
        key={seat.id}
        onClick={() => handleSeatClick(seat)}
        className={cn(
          "w-8 h-8 md:w-12 md:h-12 rounded-lg m-1 transition-all duration-200 flex items-center justify-center text-xs md:text-sm font-medium",
          seat.ocupado ? "bg-red-500 text-white cursor-not-allowed" :
          isSelected ? "bg-blue-500 text-white" :
          "bg-gray-100 hover:bg-gray-200"
        )}
        disabled={seat.ocupado}
      >
        {seat.numero}
      </button>
    );
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 md:py-12 px-2 md:px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4 flex-col md:flex-row gap-4 md:gap-0">
          <h1 className="text-2xl md:text-3xl font-bold">Seleção de Assentos</h1>
          <button
            onClick={handleLogout}
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

            <div className="flex justify-center gap-8 md:gap-16 relative">
              {/* Coluna da esquerda */}
              <div className="flex flex-col gap-2">
                {seats.filter(seat => seat.numero <= 25).map((seat, index) => (
                  <div key={seat.id} className="flex gap-2">
                    {renderSeat(seat)}
                    {index < 24 && renderSeat(seats[index + 25])}
                  </div>
                ))}
              </div>

              {/* Corredor */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-500 font-bold text-lg">
                CORREDOR
              </div>

              {/* Coluna da direita */}
              <div className="flex flex-col gap-2">
                {seats.filter(seat => seat.numero >= 26 && seat.numero <= 49).map((seat, index) => (
                  <div key={seat.id} className="flex gap-2">
                    {renderSeat(seat)}
                    {index === 11 && renderSeat(seats[49])} {/* Seat 50 */}
                  </div>
                ))}
              </div>
            </div>

            {selectedSeat && (
              <div className="mt-8">
                <button
                  onClick={confirmSelection}
                  className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  Confirmar Reserva
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