"use client";

import { useRef, useState, type FormEvent } from "react";
import { CircleAlert, CircleCheck, RotateCcw, TriangleAlert } from "lucide-react";
import { SegmentedControl } from "@/components/demos/segmented-control";

type Mode = "buggy" | "fixed";
type Field = "name" | "email" | "message";
type FormValues = Record<Field, string>;
type FormErrors = Partial<Record<Field, string>>;

const fieldOrder: Field[] = ["name", "email", "message"];
const emptyValues: FormValues = { name: "", email: "", message: "" };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_MESSAGE_LENGTH = 20;

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  if (!values.name.trim()) errors.name = "Enter your name.";
  if (!values.email.trim()) errors.email = "Enter your email address.";
  else if (!EMAIL_PATTERN.test(values.email.trim()))
    errors.email = "Enter an email address like name@example.com.";
  if (values.message.trim().length < MIN_MESSAGE_LENGTH)
    errors.message = `Enter a message of at least ${MIN_MESSAGE_LENGTH} characters.`;
  return errors;
}

/** The incomplete rule from the "before" code: only looks for an "@". */
function buggyValidate(values: FormValues) {
  return values.email.includes("@");
}

const labels: Record<Field, string> = {
  name: "Full name",
  email: "Email address",
  message: "Message",
};

function ContactForm({ mode }: { mode: Mode }) {
  const [values, setValues] = useState<FormValues>(emptyValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [generic, setGeneric] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<FormValues | null>(null);

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const refs = { name: nameRef, email: emailRef, message: messageRef };

  const isFixed = mode === "fixed";

  function updateField(field: Field, value: string) {
    const next = { ...values, [field]: value };
    setValues(next);
    // Once a field has been touched, re-validate it as the user types so the
    // error clears as soon as the value becomes valid.
    if (isFixed && touched[field]) {
      setErrors((current) => ({ ...current, [field]: validate(next)[field] }));
    }
  }

  function handleBlur(field: Field) {
    if (!isFixed) return;
    setTouched((current) => ({ ...current, [field]: true }));
    setErrors((current) => ({ ...current, [field]: validate(values)[field] }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isFixed) {
      // Mirrors the bug: a generic message, and submission continues regardless.
      setGeneric(buggyValidate(values) ? null : "Something is wrong.");
      setSubmitted(values);
      return;
    }

    const nextErrors = validate(values);
    setErrors(nextErrors);
    setTouched({ name: true, email: true, message: true });

    const firstInvalid = fieldOrder.find((field) => nextErrors[field]);
    if (firstInvalid) {
      refs[firstInvalid].current?.focus();
      return;
    }

    // Local only — nothing is sent anywhere.
    setSubmitted({
      name: values.name.trim(),
      email: values.email.trim(),
      message: values.message.trim(),
    });
  }

  function reset() {
    setValues(emptyValues);
    setErrors({});
    setTouched({});
    setGeneric(null);
    setSubmitted(null);
  }

  if (submitted) {
    const actualErrors = validate(submitted);
    const acceptedInvalid = fieldOrder.filter((field) => actualErrors[field]);

    return (
      <div className="flex min-h-[26rem] flex-col justify-center rounded-xl border border-slate-200 bg-white p-6">
        {acceptedInvalid.length > 0 ? (
          <div className="flex items-start gap-3 text-rose-800">
            <TriangleAlert size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-semibold">Submitted with invalid data</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                The buggy validation accepted {acceptedInvalid.length} invalid{" "}
                {acceptedInvalid.length === 1 ? "field" : "fields"}
                {generic ? `, after showing only "${generic}"` : ""}.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 text-emerald-800">
            <CircleCheck size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-semibold">Message ready to send</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                All fields passed validation. In this demo nothing leaves your browser.
              </p>
            </div>
          </div>
        )}

        <dl className="mt-5 divide-y divide-slate-100 rounded-lg border border-slate-200 text-sm">
          {fieldOrder.map((field) => (
            <div key={field} className="grid grid-cols-[7rem_1fr] gap-3 px-3 py-2.5">
              <dt className="text-slate-500">{labels[field]}</dt>
              <dd className="min-w-0 break-words">
                {submitted[field] ? (
                  <span className="text-slate-900">{submitted[field]}</span>
                ) : (
                  <span className="italic text-slate-400">(empty)</span>
                )}
                {actualErrors[field] && (
                  <span className="mt-0.5 block text-xs text-rose-700">{actualErrors[field]}</span>
                )}
              </dd>
            </div>
          ))}
        </dl>

        <button
          type="button"
          onClick={reset}
          className="mt-5 inline-flex items-center gap-1.5 self-start rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        >
          <RotateCcw size={14} aria-hidden="true" />
          Start again
        </button>
      </div>
    );
  }

  const errorCount = fieldOrder.filter((field) => errors[field]).length;

  const inputClass = (field: Field) =>
    `mt-1.5 block w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 ${
      errors[field]
        ? "border-rose-400 focus:border-rose-500 focus:ring-rose-200"
        : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-200"
    }`;

  const describedBy = (field: Field) => (errors[field] ? `${mode}-${field}-error` : undefined);

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="min-h-[26rem] rounded-xl border border-slate-200 bg-white p-5 sm:p-6"
    >
      {isFixed && errorCount > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800" role="alert">
          <CircleAlert size={16} className="shrink-0" aria-hidden="true" />
          {errorCount === 1 ? "1 field needs attention." : `${errorCount} fields need attention.`}
        </div>
      )}
      {!isFixed && generic && (
        <div className="mb-4 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">{generic}</div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor={`${mode}-name`} className="text-sm font-medium text-slate-800">
            {labels.name}
            {isFixed && <span className="text-rose-600"> *</span>}
          </label>
          <input
            ref={nameRef}
            id={`${mode}-name`}
            name="name"
            autoComplete="name"
            value={values.name}
            onChange={(event) => updateField("name", event.target.value)}
            onBlur={() => handleBlur("name")}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={describedBy("name")}
            aria-required={isFixed || undefined}
            className={inputClass("name")}
            placeholder="Alex Morgan"
          />
          {errors.name && (
            <p id={`${mode}-name-error`} className="mt-1.5 text-xs text-rose-700">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor={`${mode}-email`} className="text-sm font-medium text-slate-800">
            {labels.email}
            {isFixed && <span className="text-rose-600"> *</span>}
          </label>
          <input
            ref={emailRef}
            id={`${mode}-email`}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={values.email}
            onChange={(event) => updateField("email", event.target.value)}
            onBlur={() => handleBlur("email")}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={describedBy("email")}
            aria-required={isFixed || undefined}
            className={inputClass("email")}
            placeholder="alex@example.com"
          />
          {errors.email && (
            <p id={`${mode}-email-error`} className="mt-1.5 text-xs text-rose-700">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor={`${mode}-message`} className="text-sm font-medium text-slate-800">
            {labels.message}
            {isFixed && <span className="text-rose-600"> *</span>}
          </label>
          <textarea
            ref={messageRef}
            id={`${mode}-message`}
            name="message"
            rows={3}
            value={values.message}
            onChange={(event) => updateField("message", event.target.value)}
            onBlur={() => handleBlur("message")}
            aria-invalid={errors.message ? true : undefined}
            aria-describedby={describedBy("message") ?? `${mode}-message-hint`}
            aria-required={isFixed || undefined}
            className={`${inputClass("message")} resize-none`}
            placeholder="Tell us about the issue you're seeing…"
          />
          {errors.message ? (
            <p id={`${mode}-message-error`} className="mt-1.5 text-xs text-rose-700">
              {errors.message}
            </p>
          ) : (
            <p id={`${mode}-message-hint`} className="mt-1.5 text-xs text-slate-500">
              {values.message.trim().length}/{MIN_MESSAGE_LENGTH} characters minimum
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          Send message
        </button>
        <button
          type="button"
          onClick={() => {
            setValues({ name: "   ", email: "alex@", message: "" });
            setErrors({});
            setTouched({});
          }}
          className="text-sm font-medium text-slate-600 underline-offset-4 hover:text-slate-900 hover:underline"
        >
          Fill invalid sample
        </button>
      </div>
    </form>
  );
}

export function FormValidationDemo() {
  const [mode, setMode] = useState<Mode>("buggy");

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SegmentedControl
          label="Validation version"
          value={mode}
          onChange={setMode}
          options={[
            { value: "buggy", label: "Buggy validation", tone: "broken" },
            { value: "fixed", label: "Fixed validation", tone: "fixed" },
          ]}
        />
        <p className="text-xs text-slate-500">Nothing you type is stored or sent.</p>
      </div>

      <div className="mx-auto max-w-lg">
        {/* key resets the form when switching versions */}
        <ContactForm key={mode} mode={mode} />
      </div>
    </div>
  );
}
