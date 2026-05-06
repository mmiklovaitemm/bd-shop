import { describe, it, expect, beforeEach, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import useAuth from "@/store/useAuth";

// Mock fetch globally
global.fetch = vi.fn();

describe("useAuth store", () => {
  beforeEach(() => {
    useAuth.setState({ user: null, loading: false });
    vi.clearAllMocks();
  });

  it("starts with no user", () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.user).toBeNull();
  });

  it("sets user after successful login", async () => {
    const mockUser = { id: 1, email: "test@test.com", role: "user" };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: mockUser }),
    });

    const { result } = renderHook(() => useAuth());
    await act(async () => {
      await result.current.login({ email: "test@test.com", password: "pass" });
    });

    expect(result.current.user).toEqual(mockUser);
  });

  it("throws on failed login", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Invalid credentials" }),
    });

    const { result } = renderHook(() => useAuth());
    await expect(
      act(async () => {
        await result.current.login({ email: "bad@test.com", password: "wrong" });
      }),
    ).rejects.toThrow("Invalid credentials");
  });

  it("clears user on logout", async () => {
    useAuth.setState({ user: { id: 1, email: "test@test.com" } });
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    const { result } = renderHook(() => useAuth());
    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
  });
});
