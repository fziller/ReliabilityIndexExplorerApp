import { expect } from "@jest/globals";
import * as matchers from "@testing-library/react-native/matchers";

expect.extend(matchers);

const originalWarn = console.warn;
const originalError = console.error;

beforeAll(() => {
  jest.spyOn(console, "warn").mockImplementation((message, ...args) => {
    if (
      typeof message === "string" &&
      message.includes("Tried to use the icon") &&
      message.includes("react-native-paper")
    ) {
      return;
    }

    originalWarn(message, ...args);
  });

  jest.spyOn(console, "error").mockImplementation((message, ...args) => {
    const normalizedMessage = String(message);

    if (
      normalizedMessage.includes("inside a test was not wrapped in act") &&
      args.some((arg) => String(arg).includes("Icon"))
    ) {
      return;
    }

    originalError(message, ...args);
  });
});

afterAll(() => {
  jest.restoreAllMocks();
});

jest.mock("react-native-paper-dates", () => ({
  DatePickerModal: ({
    visible,
    onConfirm,
    onDismiss,
  }: {
    visible: boolean;
    onConfirm: ({ date }: { date: Date | undefined }) => void;
    onDismiss: () => void;
  }) => {
    const React = require("react");
    const { Button } = require("react-native-paper");

    return visible ? (
      <>
        <Button
          onPress={() =>
            onConfirm({ date: new Date("2026-03-15T00:00:00.000Z") })
          }
        >
          Confirm mock date
        </Button>
        <Button onPress={onDismiss}>Dismiss mock date picker</Button>
      </>
    ) : null;
  },
}));
