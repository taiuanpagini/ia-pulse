"use client";

import { createContext, useContext, useTransition, useCallback } from "react";
import { useRouter } from "nextjs-toploader/app";

interface NavigationContextType {
  navigate: (url: string) => void;
  back: () => void;
  isPending: boolean;
}

const NavigationContext = createContext<NavigationContextType>({
  navigate: () => {},
  back: () => {},
  isPending: false,
});

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const navigate = useCallback(
    (url: string) => {
      startTransition(() => {
        router.push(url);
      });
    },
    [router]
  );

  const back = useCallback(() => {
    startTransition(() => {
      router.back();
    });
  }, [router]);

  return (
    <NavigationContext.Provider value={{ navigate, back, isPending }}>
      {children}
    </NavigationContext.Provider>
  );
}

export const useNavigation = () => useContext(NavigationContext);
