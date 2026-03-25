import useLanguage from "@/context/useLanguage";
import TextInput from "./TextInput";

export default function ShippingForm({
  country,
  setCountry,

  firstName,
  setFirstName,
  lastName,
  setLastName,
  address,
  setAddress,
  apartment,
  setApartment,
  city,
  setCity,
  postalCode,
  setPostalCode,
  phone,
  setPhone,

  errors = {},
  clearError,

  firstNameRef,
  lastNameRef,
  addressRef,
  cityRef,
  postalCodeRef,
  phoneRef,
}) {
  const { t } = useLanguage();

  return (
    <div>
      <p className="mb-4 font-ui text-[12px] text-black/50">
        {t.checkoutPage.contactTitle}
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm">
            {t.checkoutPage.countryRegionLabel}{" "}
            <span className="text-red-600">*</span>
          </label>

          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className={[
              "mt-2 w-full px-4 py-4 text-[15px] font-semibold outline-none transition-all duration-200",
              "bg-transparent focus:bg-black/5",
              "border border-black focus:border-black",
            ].join(" ")}
          >
            <option value="Lithuania">{t.checkoutPage.countryLithuania}</option>
          </select>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <TextInput
            label={t.firstName}
            required
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              clearError?.("firstName");
            }}
            autoComplete="given-name"
            error={errors.firstName}
            inputRef={firstNameRef}
          />

          <TextInput
            label={t.lastName}
            required
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);
              clearError?.("lastName");
            }}
            autoComplete="family-name"
            error={errors.lastName}
            inputRef={lastNameRef}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <TextInput
            label={t.checkoutPage.addressLabel}
            required
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              clearError?.("address");
            }}
            autoComplete="street-address"
            error={errors.address}
            inputRef={addressRef}
          />

          <TextInput
            label={t.checkoutPage.apartmentLabel}
            value={apartment}
            onChange={(e) => setApartment(e.target.value)}
            placeholder={t.checkoutPage.optionalPlaceholder}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <TextInput
            label={t.checkoutPage.cityLabel}
            required
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              clearError?.("city");
            }}
            autoComplete="address-level2"
            error={errors.city}
            inputRef={cityRef}
          />

          <TextInput
            label={t.checkoutPage.postalCodeLabel}
            required
            value={postalCode}
            onChange={(e) => {
              setPostalCode(e.target.value);
              clearError?.("postalCode");
            }}
            autoComplete="postal-code"
            error={errors.postalCode}
            inputRef={postalCodeRef}
          />
        </div>

        <TextInput
          label={t.phoneNumber}
          required
          type="tel"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            clearError?.("phone");
          }}
          autoComplete="tel"
          error={errors.phone}
          inputRef={phoneRef}
        />
      </div>
    </div>
  );
}
