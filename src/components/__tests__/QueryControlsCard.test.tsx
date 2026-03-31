import { fireEvent, screen } from "@testing-library/react-native";
import { QueryControlsCard } from "../QueryControlsCard";
import { renderWithProviders } from "../../test/render";

describe("QueryControlsCard", () => {
  it("renders initial draft and live window values from explorer params", () => {
    renderWithProviders(<QueryControlsCard />);

    expect(screen.getByDisplayValue("user_123")).toBeOnTheScreen();
    expect(screen.getByDisplayValue("2026-02-20")).toBeOnTheScreen();
    expect(
      screen.getByText("Draft window: 2026-02-20 to 2027-02-19"),
    ).toBeOnTheScreen();
    expect(
      screen.getByText("Current live window: 2026-02-20 to 2027-02-19"),
    ).toBeOnTheScreen();
  });

  it("blocks apply when the user id is empty", () => {
    renderWithProviders(<QueryControlsCard />);

    fireEvent.changeText(screen.getByTestId("query-controls-user-id-input"), "   ");
    fireEvent.press(screen.getByTestId("query-controls-apply-button"));

    expect(screen.getByText("User ID is required.")).toBeOnTheScreen();
    expect(
      screen.getByText("Current live window: 2026-02-20 to 2027-02-19"),
    ).toBeOnTheScreen();
  });

  it("blocks apply when the score anchor is not a valid ISO date", () => {
    renderWithProviders(<QueryControlsCard />, {
      initialParams: { scoreFrom: "invalid-date" },
    });

    fireEvent.press(screen.getByTestId("query-controls-apply-button"));

    expect(
      screen.getByText("Use YYYY-MM-DD for the scoring anchor date."),
    ).toBeOnTheScreen();
    expect(screen.getByText("Current live window:  to")).toBeOnTheScreen();
  });

  it("trims the user id and commits valid values on apply", () => {
    renderWithProviders(<QueryControlsCard />);

    fireEvent.changeText(
      screen.getByTestId("query-controls-user-id-input"),
      "  user_999  ",
    );
    fireEvent.press(screen.getByTestId("query-controls-date-trigger"));
    fireEvent.press(screen.getByText("Confirm mock date"));
    fireEvent.press(screen.getByTestId("query-controls-apply-button"));

    expect(screen.queryByText("User ID is required.")).not.toBeOnTheScreen();
    expect(screen.getByDisplayValue("user_999")).toBeOnTheScreen();
    expect(
      screen.getByText("Current live window: 2026-03-15 to 2027-03-14"),
    ).toBeOnTheScreen();
  });

  it("updates the draft date from the picker without changing live values before apply", () => {
    renderWithProviders(<QueryControlsCard />);

    fireEvent.press(screen.getByTestId("query-controls-date-trigger"));
    fireEvent.press(screen.getByText("Confirm mock date"));

    expect(screen.getByDisplayValue("2026-03-15")).toBeOnTheScreen();
    expect(
      screen.getByText("Draft window: 2026-03-15 to 2027-03-14"),
    ).toBeOnTheScreen();
    expect(
      screen.getByText("Current live window: 2026-02-20 to 2027-02-19"),
    ).toBeOnTheScreen();
  });
});
