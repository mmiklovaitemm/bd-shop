import { describe, it, expect, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import useCart from "@/store/useCart";

describe("useCart store", () => {
  beforeEach(() => {
    useCart.setState({ items: [] });
    localStorage.clear();
  });

  it("starts with an empty cart", () => {
    const { result } = renderHook(() => useCart());
    expect(result.current.items).toHaveLength(0);
  });

  it("adds an item to the cart", () => {
    const { result } = renderHook(() => useCart());
    act(() => {
      result.current.addItem({
        productId: 1,
        name: "Test Ring",
        price: "49.99",
        color: "Gold",
        size: "S",
        quantity: 1,
        image: null,
        serviceOption: null,
      });
    });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].name).toBe("Test Ring");
  });

  it("increments quantity when same item added twice", () => {
    const { result } = renderHook(() => useCart());
    const item = {
      productId: 2,
      name: "Gold Earrings",
      price: "29.99",
      color: "Gold",
      size: "One size",
      quantity: 1,
      image: null,
      serviceOption: null,
    };
    act(() => {
      result.current.addItem(item);
      result.current.addItem(item);
    });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
  });

  it("removes an item from the cart", () => {
    const { result } = renderHook(() => useCart());
    act(() => {
      result.current.addItem({
        productId: 3,
        name: "Necklace",
        price: "89.99",
        color: "Silver",
        size: "40cm",
        quantity: 1,
        image: null,
        serviceOption: null,
      });
    });
    const key = result.current.items[0].key;
    act(() => {
      result.current.removeItem(key);
    });
    expect(result.current.items).toHaveLength(0);
  });

  it("clears all items", () => {
    const { result } = renderHook(() => useCart());
    act(() => {
      result.current.addItem({ productId: 1, name: "A", price: "10", color: "Gold", size: "S", quantity: 1, image: null, serviceOption: null });
      result.current.addItem({ productId: 2, name: "B", price: "20", color: "Silver", size: "M", quantity: 1, image: null, serviceOption: null });
      result.current.clearCart();
    });
    expect(result.current.items).toHaveLength(0);
  });
});
