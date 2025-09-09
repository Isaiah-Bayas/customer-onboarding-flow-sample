// client/src/components/FieldRenderer.js
import React from "react";

/**
 * field: { key, label, type }
 * value: current value (string or object for address)
 * onChange: function(fieldKey, newValue)
 */
export default function FieldRenderer({ field, value, onChange }) {
  if (!field) return null;

  const { key, label, type } = field;

  const handlePrimitiveChange = (e) => {
    onChange(key, e.target.value);
  };

  if (type === "address") {
    const addr = value || { street: "", city: "", state: "", zip: "" };
    const setPart = (partKey) => (e) => {
      const next = { ...addr, [partKey]: e.target.value };
      onChange(key, next);
    };

    return (
      <div className="form-field">
        <label>{label || "Address"}</label>
        <input placeholder="Street" value={addr.street || ""} onChange={setPart("street")} />
        <input placeholder="City" value={addr.city || ""} onChange={setPart("city")} />
        <input placeholder="State" value={addr.state || ""} onChange={setPart("state")} />
        <input placeholder="ZIP" value={addr.zip || ""} onChange={setPart("zip")} />
      </div>
    );
  }

  if (type === "textarea") {
    return (
      <div className="form-field">
        <label>{label}</label>
        <textarea value={value || ""} onChange={handlePrimitiveChange} placeholder={label} />
      </div>
    );
  }

  if (type === "date") {
    return (
      <div className="form-field">
        <label>{label}</label>
        <input type="date" value={value || ""} onChange={handlePrimitiveChange} />
      </div>
    );
  }

  return (
    <div className="form-field">
      <label>{label}</label>
      <input value={value || ""} onChange={handlePrimitiveChange} placeholder={label || key} />
    </div>
  );
}
