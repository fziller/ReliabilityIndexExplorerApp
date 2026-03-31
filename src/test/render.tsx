import { PropsWithChildren } from "react";
import { render, RenderOptions } from "@testing-library/react-native";
import { PaperProvider } from "react-native-paper";
import {
  ExplorerParamsProvider,
  ExplorerParamsState,
} from "../context/ExplorerParamsContext";
import { appTheme } from "../theme/theme";

interface AppRenderOptions extends Omit<RenderOptions, "wrapper"> {
  initialParams?: Partial<ExplorerParamsState>;
}

export function renderWithProviders(
  ui: React.ReactElement,
  { initialParams, ...options }: AppRenderOptions = {},
) {
  function Wrapper({ children }: PropsWithChildren) {
    return (
      <PaperProvider theme={appTheme}>
        <ExplorerParamsProvider initialParams={initialParams}>
          {children}
        </ExplorerParamsProvider>
      </PaperProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}
