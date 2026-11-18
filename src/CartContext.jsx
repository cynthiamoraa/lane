import { createContext, useContext, useMemo, useState } from "react";
import { availabilityOf } from "./availability.js";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  // [{ product, qty, availability }]. `product` is the whole product object, which
  // found-online items need to send as `webProduct` at checkout.
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);

  const add = (product, qty = product.type === "tyre" ? 4 : 1) => {
    setItems((prev) => {
      const found = prev.find((i) => i.product.id === product.id);
      if (found) return prev.map((i) => (i.product.id === product.id ? { ...i, qty: i.qty + qty } : i));
      return [...prev, { product, qty, availability: availabilityOf(product) }];
    });
    setOpen(true);
  };

  const setQty = (id, qty) =>
    setItems((prev) =>
      qty <= 0 ? prev.filter((i) => i.product.id !== id) : prev.map((i) => (i.product.id === id ? { ...i, qty } : i))
    );

  const clear = () => setItems([]);

  const value = useMemo(() => {
    const count = items.reduce((s, i) => s + i.qty, 0);
    // Only in-stock items have a firm price. Estimates are never added to the total.
    const stockItems = items.filter((i) => i.availability === "in_stock");
    const total = stockItems.reduce((s, i) => s + i.qty * (i.product.price || 0), 0);
    const unconfirmedCount = items.length - stockItems.length; // product lines priced on confirmation
    return { items, add, setQty, clear, count, total, unconfirmedCount, open, setOpen };
  }, [items, open]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
