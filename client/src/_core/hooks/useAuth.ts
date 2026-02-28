import { trpc } from "@/lib/trpc";
import { COOKIE_NAME } from "@/const";

export function useAuth() {
  const { data: user, isLoading: loading } = trpc.auth.me.useQuery(undefined, {
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      window.location.reload();
    },
  });

  const logout = () => {
    logoutMutation.mutate();
  };

  return {
    loading,
    user: user ?? null,
    logout,
  };
}
