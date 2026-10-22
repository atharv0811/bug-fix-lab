"use client";

import { useRef, useState, type FormEvent } from "react";
import { CircleAlert, CircleCheck, CircleX, ClipboardList, Lock, RotateCcw, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DemoToolbar } from "@/components/ui/demo-toolbar";
import { ModeSwitch } from "@/components/ui/mode-switch";
import { buttonClass, input, inputState } from "@/lib/ui";

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

function FieldError({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p id={id} className="mt-1.5 flex items-center gap-1 text-xs font-medium text-danger">
      <CircleAlert size={12} className="shrink-0" aria-hidden="true" />
      {children}
    </p>
  );
}

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
    const invalid = acceptedInvalid.length > 0;

    return (
      <div className="flex min-h-108 flex-col justify-center rounded-xl border border-line bg-surface p-6 shadow-card">
        <div className="flex items-start gap-3">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
              invalid
                ? "border-danger-line bg-danger-soft text-danger"
                : "border-success-line bg-success-soft text-success"
            }`}
          >
            {invalid ? <TriangleAlert size={19} aria-hidden="true" /> : <CircleCheck size={19} aria-hidden="true" />}
          </span>
          <div>
            <p className={`font-semibold ${invalid ? "text-danger" : "text-success"}`}>
              {invalid ? "Submitted with invalid data" : "Message ready to send"}
            </p>
            <p className="mt-1 text-sm leading-6 text-muted">
              {invalid ? (
                <>
                  The buggy validation accepted {acceptedInvalid.length} invalid{" "}
                  {acceptedInvalid.length === 1 ? "field" : "fields"}
                  {generic ? `, after showing only "${generic}"` : ""}.
                </>
              ) : (
                "All fields passed validation. In this demo nothing leaves your browser."
              )}
            </p>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-line overflow-hidden rounded-lg border border-line text-sm">
          {fieldOrder.map((field) => (
            <div key={field} className="grid grid-cols-[7rem_1fr] gap-3 bg-surface-2 px-3 py-2.5">
              <dt className="text-muted">{labels[field]}</dt>
              <dd className="min-w-0 wrap-break-word">
                {submitted[field] ? (
                  <span className="text-fg">{submitted[field]}</span>
                ) : (
                  <span className="italic text-subtle">(empty)</span>
                )}
                {actualErrors[field] && (
                  <span className="mt-0.5 block text-xs text-danger">{actualErrors[field]}</span>
                )}
              </dd>
            </div>
          ))}
        </dl>

        <button type="button" onClick={reset} className={buttonClass({ variant: "secondary", className: "mt-5 self-start" })}>
          <RotateCcw size={14} aria-hidden="true" />
          Start again
        </button>
      </div>
    );
  }

  const errorCount = fieldOrder.filter((field) => errors[field]).length;

  const inputClass = (field: Field) =>
    `mt-1.5 ${input} ${errors[field] ? inputState.invalid : inputState.default}`;

  const describedBy = (field: Field) => (errors[field] ? `${mode}-${field}-error` : undefined);

  const labelClass = "text-sm font-medium text-fg";
  const required = isFixed && <span className="text-danger"> *</span>;

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="min-h-108 rounded-xl border border-line bg-surface p-5 shadow-card sm:p-6"
    >
      <div className="mb-5 flex items-center justify-between gap-3 border-b border-line pb-4">
        <div>
          <p className="text-sm font-semibold text-fg">Contact us</p>
          <p className="text-xs text-muted">
            {isFixed ? "Fields marked * are required." : "No required-field checks."}
          </p>
        </div>
      </div>

      {isFixed && errorCount > 0 && (
        <div
          className="mb-4 flex items-center gap-2 rounded-lg border border-danger-line bg-danger-soft px-3 py-2 text-sm text-danger"
          role="alert"
        >
          <CircleAlert size={16} className="shrink-0" aria-hidden="true" />
          {errorCount === 1 ? "1 field needs attention." : `${errorCount} fields need attention.`}
        </div>
      )}
      {!isFixed && generic && (
        <div className="mb-4 rounded-lg border border-line bg-surface-3 px-3 py-2 text-sm text-fg-2">{generic}</div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor={`${mode}-name`} className={labelClass}>
            {labels.name}
            {required}
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
          {errors.name && <FieldError id={`${mode}-name-error`}>{errors.name}</FieldError>}
        </div>

        <div>
          <label htmlFor={`${mode}-email`} className={labelClass}>
            {labels.email}
            {required}
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
          {errors.email && <FieldError id={`${mode}-email-error`}>{errors.email}</FieldError>}
        </div>

        <div>
          <label htmlFor={`${mode}-message`} className={labelClass}>
            {labels.message}
            {required}
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
            <FieldError id={`${mode}-message-error`}>{errors.message}</FieldError>
          ) : (
            <p id={`${mode}-message-hint`} className="mt-1.5 text-xs text-muted">
              {values.message.trim().length}/{MIN_MESSAGE_LENGTH} characters minimum
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button type="submit" className={buttonClass()}>
          Send message
        </button>
        <button
          type="button"
          onClick={() => {
            setValues({ name: "   ", email: "alex@", message: "" });
            setErrors({});
            setTouched({});
          }}
          className={buttonClass({ variant: "ghost", size: "sm" })}
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
      <DemoToolbar
        icon={ClipboardList}
        context="Contact form · validation runs locally"
        status={
          <Badge tone="neutral" icon={<Lock size={11} aria-hidden="true" />}>
            Nothing is stored or sent
          </Badge>
        }
      >
        <ModeSwitch
          label="Validation version"
          value={mode}
          onChange={setMode}
          options={[
            { value: "buggy", label: "Buggy validation", tone: "broken", icon: CircleX },
            { value: "fixed", label: "Fixed validation", tone: "fixed", icon: CircleCheck },
          ]}
        />
        <p className="px-1 text-xs text-muted">
          {mode === "buggy" ? (
            <>
              Rule: <code className="font-mono text-fg-2">email.includes(&quot;@&quot;)</code>
            </>
          ) : (
            "Required fields, email format, and a 20-character message"
          )}
        </p>
      </DemoToolbar>

      <div className="mx-auto max-w-lg">
        {/* key resets the form when switching versions */}
        <ContactForm key={mode} mode={mode} />
      </div>
    </div>
  );
}
