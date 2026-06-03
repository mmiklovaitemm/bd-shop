import useLanguage from "@/context/useLanguage";
import FullWidthDivider from "@/components/ui/FullWidthDivider";
import { getTranslatedProductName } from "@/utils/getTranslatedProductName";

/**
 * Renders a simple row for monetary values
 */
function MoneyRow({ label, value, strong = false }) {
  return (
    <div className="flex items-center justify-between font-ui text-sm">
      <span className={strong ? "font-semibold" : ""}>{label}</span>
      <span className={strong ? "font-semibold" : ""}>{value}</span>
    </div>
  );
}

/**
 * Renders a key-value pair row with optional custom styling for the value
 */
function CellLabelValue({ label, value, valueClassName = "" }) {
  return (
    <div className="flex items-center justify-between font-ui text-sm">
      <span className="text-neutral-600">{label}</span>
      <span className={valueClassName}>{value}</span>
    </div>
  );
}

/**
 * Renders an address block with safety checks for missing fields
 */
function AddressBlock({ label, name, street, zipCity }) {
  const hasInfo = name || street || zipCity;
  return (
    <div className="font-ui text-sm">
      <div className="text-neutral-600">{label}</div>
      <div className="mt-2 leading-6">
        {hasInfo ? (
          <>
            {name && <div className="font-semibold">{name}</div>}
            {street && <div>{street}</div>}
            {zipCity && <div>{zipCity}</div>}
          </>
        ) : (
          <div className="text-neutral-400">—</div>
        )}
      </div>
    </div>
  );
}

/**
 * Renders the list of products in the order with service options formatting
 */
function ProductsBlock({ items = [] }) {
  const { t } = useLanguage();

  if (!items || !items.length) return null;

  const formatService = (value) => {
    const v = String(value || "")
      .trim()
      .toLowerCase();
    if (v === "shipping" || v === "shipping kit") return t.shippingKitWithPrice;
    if (v === "in_store" || v === "in-store" || v === "in store")
      return t.inStore;
    return value || null;
  };

  return (
    <div className="font-ui text-sm">
      <div className="text-neutral-600">{t.products}:</div>
      <div className="mt-3 space-y-4">
        {items.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-start justify-between gap-4">
              <div className="text-black">{getTranslatedProductName(item?.name, t) || "Product"}</div>
              <div className="whitespace-nowrap text-black">
                {item?.price || "—"}
              </div>
            </div>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 text-xs text-neutral-500">
                {item?.color && (
                  <div>
                    {t.color}: {item.color}
                  </div>
                )}
                <div>
                  {t.size || "Size"}: {item?.size || "one size"}
                </div>
                {(item?.service_option || item?.service) && (
                  <div>
                    {t.service}:{" "}
                    {formatService(item.service_option || item.service)}
                  </div>
                )}
              </div>
              <div className="whitespace-nowrap text-xs text-neutral-500">
                x{item?.quantity || 1}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Renders delivery and summary information
 */
function DeliveryInfoBlock({ info }) {
  const { t } = useLanguage();

  return (
    <div className="font-ui text-sm">
      <div className="text-neutral-600">{t.delivery}:</div>
      <div className="mt-3 space-y-3">
        <CellLabelValue
          label={`${t.carrier}:`}
          value={info?.deliveryMethod || "N/A"}
        />
        <CellLabelValue
          label={`${t.deliveryPrice}:`}
          value={info?.deliveryPrice || "€0.00"}
        />
        <CellLabelValue
          label={`${t.orderValue}:`}
          value={info?.orderValue || "€0.00"}
        />
        <CellLabelValue
          label={`${t.total}:`}
          value={info?.total || "€0.00"}
          valueClassName="font-semibold"
        />
      </div>
    </div>
  );
}

/**
 * Main panel component that expands under the OrderCard
 */
export default function OrderInfoPanel({ info }) {
  const { t } = useLanguage();

  // Guard against null/undefined info object to prevent app crash
  if (!info) return null;

  return (
    <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-stone-300/60">
      <div className="mx-auto w-full max-w-6xl px-4">
        {/* MOBILE VIEW */}
        <div className="space-y-0 md:hidden">
          <div className="flex items-center justify-between py-4 font-ui text-sm">
            <span className="text-neutral-600">{t.orderDate}:</span>
            <span>{info?.orderDate}</span>
          </div>
          <FullWidthDivider />

          <div className="flex items-center justify-between py-4 font-ui text-sm">
            <span className="text-neutral-600">{t.orderNo}:</span>
            <span className="break-all text-right">{info?.orderNo}</span>
          </div>
          <FullWidthDivider />

          <div className="flex items-center justify-between py-4 font-ui text-sm">
            <span className="text-neutral-600">{t.pickup}:</span>
            <span className="text-right">{info?.pickup}</span>
          </div>
          <FullWidthDivider />

          <div className="py-4 font-ui text-sm">
            <AddressBlock
              label={`${t.deliveryTo}:`}
              name={info?.deliveryTo?.name}
              street={info?.deliveryTo?.street}
              zipCity={info?.deliveryTo?.zipCity}
            />
          </div>
          <FullWidthDivider />

          <div className="py-4 font-ui text-sm">
            <AddressBlock
              label={`${t.billingAddress}:`}
              name={info?.billingAddress?.name}
              street={info?.billingAddress?.street}
              zipCity={info?.billingAddress?.zipCity}
            />
          </div>
          <FullWidthDivider />

          <div className="py-4">
            <ProductsBlock items={info?.productLines} />
          </div>
          <FullWidthDivider />

          <div className="space-y-3 py-6">
            <MoneyRow label={t.delivery} value={info?.deliveryPrice} />
            <MoneyRow label={t.orderValue} value={info?.orderValue} />
            <MoneyRow label={t.total} value={info?.total} strong />
          </div>
        </div>

        {/* TABLET VIEW */}
        <div className="hidden py-4 md:block lg:hidden">
          <div className="grid grid-cols-4 border border-neutral-600 bg-stone-200/40">
            <div className="border-r border-neutral-600 p-4">
              <CellLabelValue
                label={`${t.orderDate}:`}
                value={info?.orderDate}
              />
            </div>
            <div className="border-r border-neutral-600 p-4">
              <CellLabelValue
                label={`${t.orderNo}:`}
                value={info?.orderNo}
                valueClassName="break-all text-right"
              />
            </div>
            <div className="p-4">
              <CellLabelValue label={`${t.pickup}:`} value={info?.pickup} />
            </div>

            <div className="col-span-4 h-px bg-neutral-600" />

            <div className="border-r border-neutral-600 p-4">
              <AddressBlock
                label={`${t.deliveryTo}:`}
                name={info?.deliveryTo?.name}
                street={info?.deliveryTo?.street}
                zipCity={info?.deliveryTo?.zipCity}
              />
            </div>
            <div className="border-r border-neutral-600 p-4">
              <AddressBlock
                label={`${t.billingAddress}:`}
                name={info?.billingAddress?.name}
                street={info?.billingAddress?.street}
                zipCity={info?.billingAddress?.zipCity}
              />
            </div>
            <div className="border-r border-neutral-600 p-4">
              <ProductsBlock items={info?.productLines} />
            </div>
            <div className="p-4">
              <DeliveryInfoBlock info={info} />
            </div>
          </div>
        </div>

        {/* DESKTOP VIEW */}
        <div className="hidden py-4 lg:block">
          <div className="grid grid-cols-4 border border-neutral-600 bg-stone-200/40">
            <div className="divide-y divide-neutral-600 border-r border-neutral-600">
              <div className="p-4">
                <CellLabelValue
                  label={`${t.orderDate}:`}
                  value={info?.orderDate}
                />
              </div>
              <div className="p-4">
                <CellLabelValue
                  label={`${t.orderNo}:`}
                  value={info?.orderNo}
                  valueClassName="break-all text-right"
                />
              </div>
              <div className="p-4">
                <CellLabelValue label={`${t.pickup}:`} value={info?.pickup} />
              </div>
            </div>

            <div className="border-r border-neutral-600 p-4">
              <AddressBlock
                label={`${t.deliveryTo}:`}
                name={info?.deliveryTo?.name}
                street={info?.deliveryTo?.street}
                zipCity={info?.deliveryTo?.zipCity}
              />
            </div>

            <div className="border-r border-neutral-600 p-4">
              <ProductsBlock items={info?.productLines} />
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
