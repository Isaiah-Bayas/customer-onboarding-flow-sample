import React from "react";

function Table({ data }) {
  const rows = data || [];
  const reserved = new Set(["uid", "email", "password"]);

  // determine columns from union of keys in data.data and data.profile
  const extraCols = new Set();
  rows.forEach(r => {
    if (r.data) {
      Object.keys(r.data)
        .filter(k => !reserved.has(k.toLowerCase())) // skip reserved keys
        .forEach(k => extraCols.add(k));
    }
    if (r.profile) {
      Object.keys(r.profile)
        .filter(k => !reserved.has(k.toLowerCase()))
        .forEach(k => extraCols.add(k));
    }
  });

  const columns = ["uid", "email", "displayName", ...Array.from(extraCols)];

  return (
    <div style={{ padding: 16 }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {columns.map(c => (
              <th key={c} style={{ border: "1px solid #ddd", padding: 8, textAlign: "left" }}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((user) => (
            <tr key={user.id || user.uid}>
              <td style={{ border: "1px solid #eee", padding: 8 }}>{user.uid || user.id}</td>
              <td style={{ border: "1px solid #eee", padding: 8 }}>{user.profile?.email || ""}</td>
              <td style={{ border: "1px solid #eee", padding: 8 }}>{user.profile?.displayName || ""}</td>
              {Array.from(extraCols).map(col => (
                <td key={col} style={{ border: "1px solid #eee", padding: 8 }}>
                  {user.data?.[col] ?? user.profile?.[col] ?? ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
