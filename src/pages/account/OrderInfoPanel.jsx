// src/components/account/OrderInfoPanel.jsx
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

export default function OrderInfoPanel({ info }) {
  return (
    <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-stone-300/60">
      <div className="mx-auto w-full max-w-6xl px-4">
        {/* MOBILE (paliekam kaip yra) */}
        <div className="md:hidden space-y-0">
          <div className="flex items-center justify-between py-4 font-ui text-sm">
            <span className="text-neutral-600">Order date:</span>
            <span>{info.orderDate}</span>
          </div>
          <FullWidthDivider />

          <div className="flex items-center justify-between py-4 font-ui text-sm">
            <span className="text-neutral-600">Order no.:</span>
            <span className="break-all text-right">{info.orderNo}</span>
          </div>
          <FullWidthDivider />

          <div className="flex items-center justify-between py-4 font-ui text-sm">
            <span className="text-neutral-600">Pickup:</span>
            <span className="text-right">{info.pickup}</span>
          </div>
          <FullWidthDivider />

          <div className="py-4 font-ui text-sm">
            <span className="text-neutral-600">Delivery to:</span>
            <div className="mt-2 leading-6">
              <div>{info.deliveryTo.name}</div>
              <div>{info.deliveryTo.street}</div>
              <div>{info.deliveryTo.zipCity}</div>
            </div>
          </div>
          <FullWidthDivider />

          <div className="py-4 font-ui text-sm">
            <span className="text-neutral-600">Billing address:</span>
            <div className="mt-2 leading-6">
              <div>{info.billingAddress.name}</div>
              <div>{info.billingAddress.street}</div>
              <div>{info.billingAddress.zipCity}</div>
            </div>
          </div>
          <FullWidthDivider />

          <div className="py-6 space-y-3">
            <MoneyRow label="Delivery" value={info.deliveryPrice} />
            <MoneyRow label="Order value" value={info.orderValue} />
            <MoneyRow label="Total" value={info.total} strong />
          </div>

          <FullWidthDivider />
        </div>

        {/* TABLET (paliekam kaip buvo) */}
        <div className="hidden md:block lg:hidden py-4">
          <div className="grid grid-cols-3 border border-neutral-600 bg-stone-200/40">
            {/* Row 1 */}
            <div className="p-4 border-r border-neutral-600">
              <CellLabelValue label="Order date:" value={info.orderDate} />
            </div>

            <div className="p-4 border-r border-neutral-600">
              <CellLabelValue
                label="Order no.:"
                value={info.orderNo}
                valueClassName="break-all text-right"
              />
            </div>

            <div className="p-4">
              <CellLabelValue label="Pickup:" value={info.pickup} />
            </div>

            {/* Row divider */}
            <div className="col-span-3 h-px bg-neutral-600" />

            {/* Row 2 */}
            <div className="p-4 border-r border-neutral-600">
              <AddressBlock
                label="Delivery to:"
                name={info.deliveryTo.name}
                street={info.deliveryTo.street}
                zipCity={info.deliveryTo.zipCity}
              />
            </div>

            <div className="p-4 border-r border-neutral-600">
              <AddressBlock
                label="Billing address:"
                name={info.billingAddress.name}
                street={info.billingAddress.street}
                zipCity={info.billingAddress.zipCity}
              />
            </div>

            <div className="p-4">
              <div className="space-y-3">
                <MoneyRow label="Delivery" value={info.deliveryPrice} />
                <MoneyRow label="Order value" value={info.orderValue} />
                <MoneyRow label="Total" value={info.total} strong />
              </div>
            </div>
          </div>
        </div>

        {/* DESKTOP (lg+) – pagal dizainą: 4 stulpeliai, pirmas stulpelis su 3 eilutėmis viduje */}
        <div className="hidden lg:block py-4">
          <div className="grid grid-cols-4 border border-neutral-600 bg-stone-200/40">
            {/* Col 1: Order date / Order no / Pickup (stacked) */}
            <div className="border-r border-neutral-600">
              <div className="p-4">
                <CellLabelValue label="Order date:" value={info.orderDate} />
              </div>
              <div className="h-px bg-neutral-600" />
              <div className="p-4">
                <CellLabelValue
                  label="Order no.:"
                  value={info.orderNo}
                  valueClassName="break-all text-right"
                />
              </div>
              <div className="h-px bg-neutral-600" />
              <div className="p-4">
                <CellLabelValue label="Pickup:" value={info.pickup} />
              </div>
            </div>

            {/* Col 2: Delivery */}
            <div className="p-4 border-r border-neutral-600">
              <AddressBlock
                label="Delivery to:"
                name={info.deliveryTo.name}
                street={info.deliveryTo.street}
                zipCity={info.deliveryTo.zipCity}
              />
            </div>

            {/* Col 3: Billing */}
            <div className="p-4 border-r border-neutral-600">
              <AddressBlock
                label="Billing address:"
                name={info.billingAddress.name}
                street={info.billingAddress.street}
                zipCity={info.billingAddress.zipCity}
              />
            </div>

            {/* Col 4: Money */}
            <div className="p-4">
              <div className="space-y-3">
                <MoneyRow label="Delivery" value={info.deliveryPrice} />
                <MoneyRow label="Order value" value={info.orderValue} />
                <MoneyRow label="Total" value={info.total} strong />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
