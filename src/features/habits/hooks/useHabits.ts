import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useStorage } from "@/lib/storage/storage-provider";
import { Habit } from "@/lib/storage/types";

export function useHabits() {
  const storage = useStorage();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["habits"],
    queryFn: () => storage.getHabits(),
  });

  const saveMutation = useMutation({
    mutationFn: (habit: Habit) => storage.saveHabit(habit),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (habitId: string) => storage.deleteHabit(habitId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      // Invalidate all entries when a habit is deleted
      queryClient.invalidateQueries({ queryKey: ["entries"] });
    },
  });

  return {
    habits: query.data || [],
    isLoading: query.isLoading,
    saveHabit: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    deleteHabit: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
