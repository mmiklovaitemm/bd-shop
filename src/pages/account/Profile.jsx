import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import useLanguage from "@/context/useLanguage";
import AboutStudioSection from "@/components/ui/AboutStudioSection";
import FullWidthDivider from "@/components/ui/FullWidthDivider";
import backArrowIcon from "@/assets/ui/back-arrow.svg";
import useAuth from "@/store/useAuth";

function Label({ children }) {
  return (
    <label className="block font-ui text-sm text-neutral-800">{children}</label>
  );
}

function RequiredStar() {
  return <span className="text-red-600"> *</span>;
}

export default function Profile() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const user = useAuth((s) => s.user);
  const fetchMe = useAuth((s) => s.fetchMe);
  const updateProfile = useAuth((s) => s.updateProfile);

  const initialForm = useMemo(
    () => ({
      email: user?.email || "",
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
    }),
    [user],
  );

  const [form, setForm] = useState(initialForm);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!user) fetchMe();
  }, [user, fetchMe]);

  useEffect(() => {
    setForm({
      email: user?.email || "",
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
    });
  }, [user]);

  const onChangeField = (key) => (e) => {
    setServerError("");
    setSuccess("");
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  /**
   * Helper to translate error keys to current language
   */
  const getErrorMessage = (field) => {
    if (errors[field] === "required") return t.requiredShort;
    return "";
  };

  const validate = () => {
    const errs = {};
    if (!String(form.firstName || "").trim()) errs.firstName = "required";
    if (!String(form.lastName || "").trim()) errs.lastName = "required";
    return errs;
  };

  const handleSave = async () => {
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    setServerError("");
    setSuccess("");

    try {
      await updateProfile({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
      });
      setSuccess(t.savedSuccessfully);
    } catch (err) {
      setServerError(err.message || t.somethingWentWrong);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <main className="px-2 pb-10 pt-3">
        <section className="mx-auto w-full max-w-6xl">
          <h1 className="font-display text-4xl leading-none">{t.profile}</h1>
          <FullWidthDivider className="my-4" />
          <button
            type="button"
            onClick={() => navigate("/account")}
            className="inline-flex items-center gap-2 text-sm font-ui"
          >
            <img src={backArrowIcon} alt="" className="h-3 w-3" />
            <span>{t.back}</span>
          </button>
          <FullWidthDivider className="my-4" />

          <div className="md:mx-auto md:max-w-[560px] md:border md:border-black/40 md:bg-white lg:max-w-[680px]">
            <div className="md:px-8 md:py-8">
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                {serverError && (
                  <div className="border border-red-600 bg-red-50 px-4 py-3 font-ui text-sm text-red-700">
                    {serverError}
                  </div>
                )}
                {success && (
                  <div className="border border-black/40 bg-black/5 px-4 py-3 font-ui text-sm">
                    {success}
                  </div>
                )}

                <div className="space-y-2">
                  <Label>
                    {t.emailAddress}
                    <RequiredStar />
                  </Label>
                  <input
                    type="email"
                    value={form.email}
                    readOnly
                    className="w-full border border-black bg-white px-4 py-3 font-ui text-sm outline-none opacity-70"
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    {t.firstName}
                    <RequiredStar />
                  </Label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={onChangeField("firstName")}
                    placeholder={t.enterYourFirstName}
                    className={[
                      "w-full border bg-white px-4 py-3 font-ui text-sm outline-none",
                      errors.firstName ? "border-red-600" : "border-black",
                    ].join(" ")}
                  />
                  {errors.firstName && (
                    <p className="font-ui text-xs text-red-600">
                      {getErrorMessage("firstName")}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>
                    {t.lastName}
                    <RequiredStar />
                  </Label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={onChangeField("lastName")}
                    placeholder={t.enterYourLastName}
                    className={[
                      "w-full border bg-white px-4 py-3 font-ui text-sm outline-none",
                      errors.lastName ? "border-red-600" : "border-black",
                    ].join(" ")}
                  />
                  {errors.lastName && (
                    <p className="font-ui text-xs text-red-600">
                      {getErrorMessage("lastName")}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>
                    {t.password}
                    <RequiredStar />
                  </Label>
                  <div className="flex items-stretch gap-3">
                    <input
                      type="password"
                      value="********"
                      readOnly
                      className="flex-1 border border-black bg-white px-4 py-3 font-ui text-sm outline-none opacity-70"
                    />
                    <button
                      type="button"
                      onClick={() => navigate("/account/change-password")}
                      className="shrink-0 border border-black bg-black px-6 py-3 font-ui text-sm text-white"
                    >
                      {t.change}
                    </button>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={submitting}
                    className={[
                      "w-full border border-black bg-black py-4 font-ui text-sm text-white",
                      submitting ? "cursor-not-allowed opacity-60" : "",
                    ].join(" ")}
                  >
                    {submitting ? t.saving : t.save}
                  </button>
                </div>
              </form>
            </div>
          </div>
          <FullWidthDivider className="mt-6" />
        </section>
      </main>
      <FullWidthDivider />
      <AboutStudioSection />
    </>
  );
}
