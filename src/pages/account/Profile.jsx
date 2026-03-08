import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

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

  useEffect(() => {
    if (!user) fetchMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  };

  const validate = () => {
    const errs = {};
    if (!String(form.firstName || "").trim()) errs.firstName = "Required.";
    if (!String(form.lastName || "").trim()) errs.lastName = "Required.";
    return errs;
  };

  const [errors, setErrors] = useState({});

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
      setSuccess("Saved successfully.");
    } catch (err) {
      setServerError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <main className="px-2 pt-3 pb-10">
        <section className="mx-auto w-full max-w-6xl">
          <h1 className="font-display text-4xl leading-none">Profile</h1>

          <FullWidthDivider className="my-4" />

          <button
            type="button"
            onClick={() => navigate("/account")}
            className="inline-flex items-center gap-2 text-sm font-ui"
          >
            <img src={backArrowIcon} alt="" className="h-3 w-3" />
            <span>Back</span>
          </button>

          <FullWidthDivider className="my-4" />

          <div
            className="
              md:mx-auto md:border md:border-black/40 md:bg-white
              md:max-w-[560px] lg:max-w-[680px]
            "
          >
            <div className="md:px-8 md:py-8">
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                {serverError ? (
                  <div className="border border-red-600 bg-red-50 px-4 py-3 font-ui text-sm text-red-700">
                    {serverError}
                  </div>
                ) : null}

                {success ? (
                  <div className="border border-black/40 bg-black/5 px-4 py-3 font-ui text-sm">
                    {success}
                  </div>
                ) : null}

                {/* Email (read-only) */}
                <div className="space-y-2">
                  <Label>
                    Email address
                    <RequiredStar />
                  </Label>
                  <input
                    type="email"
                    value={form.email}
                    readOnly
                    autoComplete="email"
                    className="w-full border border-black bg-white px-4 py-3 font-ui text-sm outline-none placeholder:text-black/30 opacity-70"
                  />
                </div>

                {/* First name */}
                <div className="space-y-2">
                  <Label>
                    First name
                    <RequiredStar />
                  </Label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={onChangeField("firstName")}
                    autoComplete="given-name"
                    placeholder="Enter your first name"
                    className={[
                      "w-full border bg-white px-4 py-3 font-ui text-sm outline-none placeholder:text-black/30",
                      errors.firstName ? "border-red-600" : "border-black",
                    ].join(" ")}
                    aria-invalid={!!errors.firstName}
                  />
                  {errors.firstName ? (
                    <p className="font-ui text-xs text-red-600">
                      {errors.firstName}
                    </p>
                  ) : null}
                </div>

                {/* Last name */}
                <div className="space-y-2">
                  <Label>
                    Last name
                    <RequiredStar />
                  </Label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={onChangeField("lastName")}
                    autoComplete="family-name"
                    placeholder="Enter your last name"
                    className={[
                      "w-full border bg-white px-4 py-3 font-ui text-sm outline-none placeholder:text-black/30",
                      errors.lastName ? "border-red-600" : "border-black",
                    ].join(" ")}
                    aria-invalid={!!errors.lastName}
                  />
                  {errors.lastName ? (
                    <p className="font-ui text-xs text-red-600">
                      {errors.lastName}
                    </p>
                  ) : null}
                </div>

                {/* Password row (fake input) + Change */}
                <div className="space-y-2">
                  <Label>
                    Password
                    <RequiredStar />
                  </Label>

                  <div className="flex items-stretch gap-3">
                    <div className="relative flex-1">
                      <input
                        type="password"
                        value="********"
                        readOnly
                        className="w-full border border-black bg-white px-4 py-3 pr-12 font-ui text-sm outline-none placeholder:text-black/30 opacity-70"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate("/account/change-password")}
                      className="shrink-0 border border-black bg-black px-6 py-3 font-ui text-sm text-white"
                    >
                      Change
                    </button>
                  </div>
                </div>

                {/* Save */}
                <div className="pt-3">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={submitting}
                    className={[
                      "w-full border border-black bg-black py-4 font-ui text-sm text-white",
                      submitting ? "opacity-60 cursor-not-allowed" : "",
                    ].join(" ")}
                  >
                    {submitting ? "Saving..." : "Save"}
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
