import {
  PropsWithChildren,
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";
import { deriveAnalysisWindow } from "../utils/date";

interface ExplorerParamsContextValue {
  userId: string;
  scoreFrom: string;
  transactionFrom: string;
  transactionTo: string;
  setParams: (next: { userId: string; scoreFrom: string }) => void;
}

export interface ExplorerParamsState {
  userId: string;
  scoreFrom: string;
}

const DEFAULT_PARAMS: ExplorerParamsState = {
  userId: "user_123",
  scoreFrom: "2026-02-20",
};

const ExplorerParamsContext = createContext<ExplorerParamsContextValue | null>(
  null,
);

interface ExplorerParamsProviderProps extends PropsWithChildren {
  initialParams?: Partial<ExplorerParamsState>;
}

export function ExplorerParamsProvider({
  children,
  initialParams,
}: ExplorerParamsProviderProps) {
  const [params, setParams] = useState<ExplorerParamsState>({
    ...DEFAULT_PARAMS,
    ...initialParams,
  });

  const value = useMemo(() => {
    const analysisWindow = deriveAnalysisWindow(params.scoreFrom);

    return {
      ...params,
      ...analysisWindow,
      setParams,
    };
  }, [params]);

  return (
    <ExplorerParamsContext.Provider value={value}>
      {children}
    </ExplorerParamsContext.Provider>
  );
}

export function useExplorerParams() {
  const value = useContext(ExplorerParamsContext);

  if (!value) {
    throw new Error(
      "useExplorerParams must be used within ExplorerParamsProvider",
    );
  }

  return value;
}
