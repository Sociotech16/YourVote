export default function Field({ id, label, error, children, ...inputProps }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children || <input id={id} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} {...inputProps} />}
      {error && <p id={`${id}-err`} className="field-error">{error}</p>}
    </div>
  );
}
