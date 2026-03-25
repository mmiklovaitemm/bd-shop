// src/components/account/OrderInfoPanel.jsx
import useLanguage from "@/context/useLanguage";
import FullWidthDivider from "@/components/ui/FullWidthDivider";

function MoneyRow({ label, value, strong = false }) {
  return (
    <div className="flex items-center justify-between font-ui text-sm">
      <span className={strong ? "font-semibold" : ""}>{label}</span>
      <span className={strong ? "font-semibold" : ""}>{value}</span>
    </div>
  );
}

function CellLabelValue({ label, value, valueClassName = "" }) {
  return (
    <div className="flex items-center justify-between font-ui text-sm">
      <span className="text-neutral-600">{label}</span>
      <span className={valueClassName}>{value}</span>
    </div>
  );
}

function AddressBlock({ label, name, street, zipCity }) {
  return (
    <div className="font-ui text-sm">
      <div className="text-neutral-600">{label}</div>
      <div className="mt-2 leading-6">
        <div className="font-semibold">{name}</div>
        <div>{street}</div>
        <div>{zipCity}</div>
      </div>
    </div>
  );
}

function ProductsBlock({ items = [] }) {
  const { t } = useLanguage();

  if (!items.length) return null;

  const formatService = (value) => {
    const v = String(value || "")
      .trim()
      .toLowerCase();

    if (v === "shipping" || v === "shipping kit") {
      return t.shippingKitWithPrice;
    }

    if (v === "in_store" || v === "in-store" || v === "in store") {
      return t.inStore;
    }

    return value || null;
  };

  return (
    <div className="font-ui text-sm">
      <div className="text-neutral-600">{t.products}:</div>

      <div className="mt-3 space-y-4">
        {items.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-start justify-between gap-4">
              <div className="text-black">{item.name}</div>
              <div className="whitespace-nowrap text-black">
                {item.price || "—"}
              </div>
            </div>

            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 text-xs text-neutral-500">
                {item.color ? (
                  <div>
                    {t.color}: {item.color}
                  </div>
                ) : null}

                {item.service_option || item.service ? (
                  <div>
                    {t.service}:{" "}
                    {formatService(item.service_option || item.service)}
                  </div>
                ) : null}
              </div>

              <div className="whitespace-nowrap text-xs text-neutral-500">
                x{item.quantity}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DeliveryInfoBlock({ info }) {
  const { t } = useLanguage();

  return (
    <div className="font-ui text-sm">
      <div className="text-neutral-600">{t.delivery}:</div>

      <div className="mt-3 space-y-3">
        <CellLabelValue label={`${t.carrier}:`} value={info.deliveryMethod} />
        <CellLabelValue
          label={`${t.deliveryPrice}:`}
          value={info.deliveryPrice}
        />
        <CellLabelValue label={`${t.orderValue}:`} value={info.orderValue} />
        <CellLabelValue
          label={`${t.total}:`}
          value={info.total}
          valueClassName="font-semibold"
        />
      </div>
    </div>
  );
}

export default function OrderInfoPanel({ info }) {
  const { t } = useLanguage();

  return (
    <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-stone-300/60">
      <div className="mx-auto w-full max-w-6xl px-4">
        {/* MOBILE */}
        <div className="space-y-0 md:hidden">
          <div className="flex items-center justify-between py-4 font-ui text-sm">
            <span className="text-neutral-600">{t.orderDate}:</span>
            <span>{info.orderDate}</span>
          </div>
          <FullWidthDivider />

          <div className="flex items-center justify-between py-4 font-ui text-sm">
            <span className="text-neutral-600">{t.orderNo}:</span>
            <span className="break-all text-right">{info.orderNo}</span>
          </div>
          <FullWidthDivider />

          <div className="flex items-center justify-between py-4 font-ui text-sm">
            <span className="text-neutral-600">{t.pickup}:</span>
            <span className="text-right">{info.pickup}</span>
          </div>
          <FullWidthDivider />

          <div className="py-4 font-ui text-sm">
            <span className="text-neutral-600">{t.deliveryTo}:</span>
            <div className="mt-2 leading-6">
              <div>{info.deliveryTo.name}</div>
              <div>{info.deliveryTo.street}</div>
              <div>{info.deliveryTo.zipCity}</div>
            </div>
          </div>
          <FullWidthDivider />

          <div className="py-4 font-ui text-sm">
            <span className="text-neutral-600">{t.billingAddress}:</span>
            <div className="mt-2 leading-6">
              <div>{info.billingAddress.name}</div>
              <div>{info.billingAddress.street}</div>
              <div>{info.billingAddress.zipCity}</div>
            </div>
          </div>
          <FullWidthDivider />

          <div className="py-4">
            <ProductsBlock items={info.productLines} />
          </div>
          <FullWidthDivider />

          <div className="space-y-3 py-6">
            <MoneyRow label={t.delivery} value={info.deliveryPrice} />
            <MoneyRow label={t.orderValue} value={info.orderValue} />
            <MoneyRow label={t.total} value={info.total} strong />
          </div>

          <FullWidthDivider />
        </div>

        {/* TABLET */}
        <div className="hidden py-4 md:block lg:hidden">
          <div className="grid grid-cols-4 border border-neutral-600 bg-stone-200/40">
            <div className="border-r border-neutral-600 p-4">
              <CellLabelValue
                label={`${t.orderDate}:`}
                value={info.orderDate}
              />
            </div>

            <div className="border-r border-neutral-600 p-4">
              <CellLabelValue
                label={`${t.orderNo}:`}
                value={info.orderNo}
                valueClassName="break-all text-right"
              />
            </div>

            <div className="p-4">
              <CellLabelValue label={`${t.pickup}:`} value={info.pickup} />
            </div>

            <div className="col-span-4 h-px bg-neutral-600" />

            <div className="border-r border-neutral-600 p-4">
              <AddressBlock
                label={`${t.deliveryTo}:`}
                name={info.deliveryTo.name}
                street={info.deliveryTo.street}
                zipCity={info.deliveryTo.zipCity}
              />
            </div>

            <div className="border-r border-neutral-600 p-4">
              <AddressBlock
                label={`${t.billingAddress}:`}
                name={info.billingAddress.name}
                street={info.billingAddress.street}
                zipCity={info.billingAddress.zipCity}
              />
            </div>

            <div className="border-r border-neutral-600 p-4">
              <ProductsBlock items={info.productLines} />
            </div>

            <div className="p-4">
              <DeliveryInfoBlock info={info} />
            </div>
          </div>
        </div>

        {/* DESKTOP */}
        <div className="hidden py-4 lg:block">
          <div className="grid grid-cols-4 border border-neutral-600 bg-stone-200/40">
            <div className="divide-y divide-neutral-600 border-r border-neutral-600">
              <div className="p-4">
                <CellLabelValue
                  label={`${t.orderDate}:`}
                  value={info.orderDate}
                />
              </div>

              <div className="p-4">
                <CellLabelValue
                  label={`${t.orderNo}:`}
                  value={info.orderNo}
                  valueClassName="break-all text-right"
                />
              </div>

              <div className="p-4">
                <CellLabelValue label={`${t.pickup}:`} value={info.pickup} />
              </div>
            </div>

            <div className="border-r border-neutral-600 p-4">
              <AddressBlock
                label={`${t.deliveryTo}:`}
                name={info.deliveryTo.name}
                street={info.deliveryTo.street}
                zipCity={info.deliveryTo.zipCity}
              />
            </div>

            <div className="border-r border-neutral-600 p-4">
              <ProductsBlock items={info.productLines} />
            </div>

            <div className="p-4">
              <DeliveryInfoBlock info={info} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
