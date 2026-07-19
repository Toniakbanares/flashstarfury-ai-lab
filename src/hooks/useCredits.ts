// Credits system disabled — unlimited free generations for all users.
// Kept as a hook shim so existing imports keep working.
export function useCredits() {
  return {
    credits: Infinity,
    dailyCredits: Infinity,
    bonus: 0,
    loading: false,
    useCredit: async (): Promise<boolean> => true,
    refetch: async () => {},
  };
}
