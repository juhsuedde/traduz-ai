import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/api/auth.functions";

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["auth", "user"],
    queryFn: () => getCurrentUser({}),
  });

  return { user, loading: isLoading };
}
