import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useWishlist(userId: string | undefined) {
  return useQuery({
    queryKey: ["wishlist", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase.from("wishlist").select("product_id");
      if (error) throw error;
      return data.map((row) => row.product_id);
    },
  });
}

export function useToggleWishlist(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, active }: { productId: string; active: boolean }) => {
      if (!userId) throw new Error("Sign in to use your wishlist.");
      if (active) {
        const { error } = await supabase.from("wishlist").delete().eq("product_id", productId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("wishlist")
          .insert({ product_id: productId, user_id: userId });
        if (error) throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wishlist", userId] }),
  });
}

export interface HistoryRow {
  id: string;
  product_id: string;
  product_name: string;
  product_brand: string | null;
  result_path: string;
  created_at: string;
  signedUrl: string | null;
}

export function useHistory(userId: string | undefined) {
  return useQuery({
    queryKey: ["history", userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<HistoryRow[]> => {
      const { data, error } = await supabase
        .from("tryon_history")
        .select("id, product_id, product_name, product_brand, result_path, created_at")
        .order("created_at", { ascending: false })
        .limit(60);
      if (error) throw error;

      const signed = await supabase.storage
        .from("tryon")
        .createSignedUrls(data.map((row) => row.result_path), 3600);

      return data.map((row, index) => ({
        ...row,
        signedUrl: signed.data?.[index]?.signedUrl ?? null,
      }));
    },
  });
}

export function useDeleteHistory(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tryon_history").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["history", userId] }),
  });
}