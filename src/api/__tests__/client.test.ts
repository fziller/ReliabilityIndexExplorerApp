import axios from "axios";
import { API_BASE_URL } from "../../config/api";
import { apiClient, getErrorMessage } from "../client";

const mockedAxios = jest.mocked(axios);

jest.mock("axios", () => ({
  create: jest.fn(() => ({})),
  isAxiosError: jest.fn(),
}));

function createAxiosLikeError(message: string, apiError?: string) {
  return {
    message,
    response:
      apiError === undefined
        ? undefined
        : {
            data: {
              error: apiError,
            },
          },
  };
}

describe("apiClient", () => {
  it("is created with the configured base URL and a 10 second timeout", () => {
    expect(apiClient).toEqual({});
    expect(mockedAxios.create).toHaveBeenCalledWith({
      baseURL: API_BASE_URL,
      timeout: 10_000,
    });
  });
});

describe("getErrorMessage", () => {
  beforeEach(() => {
    mockedAxios.isAxiosError.mockReset();
  });

  it("prefers the API error message for axios errors", () => {
    const error = createAxiosLikeError("Network failed", "Backend says no");
    mockedAxios.isAxiosError.mockReturnValue(true);

    expect(getErrorMessage(error)).toBe("Backend says no");
  });

  it("returns the normal error message for non-axios Error instances", () => {
    mockedAxios.isAxiosError.mockReturnValue(false);

    expect(getErrorMessage(new Error("Plain error"))).toBe("Plain error");
  });

  it("returns a generic fallback for unknown values", () => {
    mockedAxios.isAxiosError.mockReturnValue(false);

    expect(getErrorMessage("broken")).toBe("Something went wrong");
    expect(getErrorMessage(null)).toBe("Something went wrong");
  });
});
