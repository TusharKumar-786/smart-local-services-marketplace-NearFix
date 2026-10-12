// Labelled form input that shows a field error from the API underneath.
export default function Field({ label, error, as = 'input', children, hint, ...props }) {
  const Tag = as
  const id = props.id || props.name
  return (
    <div className={`field ${error ? 'has-error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {as === 'select' ? <select id={id} {...props}>{children}</select> : <Tag id={id} {...props} />}
      {hint && !error && <small className="hint">{hint}</small>}
      {error && <small className="field-error">{error}</small>}
    </div>
  )
}
