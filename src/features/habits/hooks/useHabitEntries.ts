import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useStorage } from "@/lib/storage/storage-provider";
import { HabitEntry } from "@/lib/storage/types";

export function useHabitEntries(from: string, to: string) {
  const storage = useStorage();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["entries", from, to],
    queryFn: () => storage.getEntries({ from, to }),
  });

  const setStatusMutation = useMutation({
    mutationFn: ({
      habitId,
      date,
      status,
    }: {
      habitId: string;
      date: string;
      status: HabitEntry["status"];
    }) => storage.setEntryStatus(habitId, date, status),
    
    // Optimistic UI updates
    onMutate: async ({ habitId, date, status }) => {
      // Cancel outgoing queries to prevent overwriting optimistic state
      await queryClient.cancelQueries({ queryKey: ["entries", from, to] });

      // Snapshot previous value
      const previousEntries = queryClient.getQueryData<HabitEntry[]>([
        "entries",
        from,
        to,
      ]);

      // Optimistically update to the new value
      queryClient.setQueryData<HabitEntry[]>(
        ["entries", from, to],
        (old = []) => {
          const filtered = old.filter(
            (e) => !(e.habitId === habitId && e.date === date)
          );
          if (status === "done" || status === "missed") {
            return [...filtered, { habitId, date, status }];
          }
          return filtered;
        }
      );

      // Return context with snapshotted value
      return { previousEntries };
    },
    
    // If the mutation fails, rollback
    onError: (err, variables, context) => {
      if (context?.previousEntries) {
        queryClient.setQueryData(["entries", from, to], context.previousEntries);
      }
    },
    
    // Always refetch or invalidate after success or error
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
    },
  });

  return {
    entries: query.data || [],
    isLoading: query.isLoading,
    setEntryStatus: setStatusMutation.mutateAsync,
  };
}
