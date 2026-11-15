// Lab day (AI required). This file ends up as the form described in CONTRACT.md §4.

import { useState } from "react";

const EMPTY = {
  code: "",
  title: "",
  description: "",
  department: "",
  credits: "",
  capacity: "",
};

export function AddCourseForm({ onAdd }) {
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm(previous => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSubmitting(true);
    setError(null);

    try {
      await onAdd({
        ...form,
        credits: Number(form.credits),
        capacity: Number(form.capacity),
        description: form.description === "" ? null : form.description,
      });

      setForm({ ...EMPTY });
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  }

  const fieldErrors = error?.fieldErrors ?? {};

  function renderFieldError(name) {
    if (!fieldErrors[name]) return null;

    return (
      <p id={`${name}-error`}>
        {fieldErrors[name]}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {error?.message && (
        <p role="alert">{error.message}</p>
      )}

      <label htmlFor="code">Code</label>
      <input
        id="code"
        name="code"
        value={form.code}
        onChange={handleChange}
        aria-invalid={Boolean(fieldErrors.code)}
        aria-describedby={fieldErrors.code ? "code-error" : undefined}
      />
      {renderFieldError("code")}

      <label htmlFor="title">Title</label>
      <input
        id="title"
        name="title"
        value={form.title}
        onChange={handleChange}
        aria-invalid={Boolean(fieldErrors.title)}
        aria-describedby={fieldErrors.title ? "title-error" : undefined}
      />
      {renderFieldError("title")}

      <label htmlFor="description">Description</label>
      <textarea
        id="description"
        name="description"
        value={form.description}
        onChange={handleChange}
        aria-invalid={Boolean(fieldErrors.description)}
        aria-describedby={
          fieldErrors.description ? "description-error" : undefined
        }
      />
      {renderFieldError("description")}

      <label htmlFor="department">Department</label>
      <input
        id="department"
        name="department"
        value={form.department}
        onChange={handleChange}
        aria-invalid={Boolean(fieldErrors.department)}
        aria-describedby={
          fieldErrors.department ? "department-error" : undefined
        }
      />
      {renderFieldError("department")}

      <label htmlFor="credits">Credits</label>
      <input
        id="credits"
        name="credits"
        type="number"
        value={form.credits}
        onChange={handleChange}
        aria-invalid={Boolean(fieldErrors.credits)}
        aria-describedby={fieldErrors.credits ? "credits-error" : undefined}
      />
      {renderFieldError("credits")}

      <label htmlFor="capacity">Capacity</label>
      <input
        id="capacity"
        name="capacity"
        type="number"
        value={form.capacity}
        onChange={handleChange}
        aria-invalid={Boolean(fieldErrors.capacity)}
        aria-describedby={fieldErrors.capacity ? "capacity-error" : undefined}
      />
      {renderFieldError("capacity")}

      <button type="submit" disabled={submitting}>
        {submitting ? "Adding..." : "Add course"}
      </button>
    </form>
  );
}
