import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useStorage } from "@/lib/storage/storage-provider";
import { SleepEntry } from "@/lib/storage/types";

export function useSleepEntries(from: string, to: string) {
  const storage = useStorage();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["sleep", from, to],
    queryFn: () => storage.getSleepEntries({ from, to }),
  });

  const setSleepMutation = useMutation({
    mutationFn: ({ date, hours }: { date: string; hours: number }) =>
      storage.setSleepEntry(date, hours),
    onSuccess: () => {
      // Invalidate both sleep records and any analytics queries
      queryClient.invalidateQueries({ queryKey: ["sleep"] });
    },
  });

  return {
    sleepEntries: query.data || [],
    isLoading: query.isLoading,
    setSleepEntry: setSleepMutation.mutateAsync,
    isSetting: setSleepMutation.isPending,
  };
}
