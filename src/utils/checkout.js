export const SHIPPING_KIT_FEE_DEFAULT = 15;

export const fmtPrice = (n) =>
  new Intl.NumberFormat("lt-LT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(Number(n || 0));

export const getEmailFromLocalStorage = () => {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return "";
    const user = JSON.parse(raw);
    return user?.email || "";
  } catch {
    return "";
  }
};

export const isShippingKit = (serviceOption) => {
  return (
    serviceOption === "shipping-kit" ||
    serviceOption === "shipping_kit" ||
    String(serviceOption || "")
      .toLowerCase()
      .includes("shipping")
  );
};

export const calcLineTotal = (
  item,
  shippingKitFee = SHIPPING_KIT_FEE_DEFAULT,
) => {
  const base = Number(item?.price) || 0;
  const qty = item?.quantity || 1;

  const fee =
    item?.category === "personal" && isShippingKit(item?.serviceOption)
      ? shippingKitFee
      : 0;

  return (base + fee) * qty;
};

export const calcSubtotal = (
  items,
  shippingKitFee = SHIPPING_KIT_FEE_DEFAULT,
) => {
  return (items || []).reduce((sum, item) => {
    return sum + calcLineTotal(item, shippingKitFee);
  }, 0);
};
