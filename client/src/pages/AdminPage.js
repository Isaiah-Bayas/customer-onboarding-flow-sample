import React, { useEffect, useState } from "react";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const API = process.env.REACT_APP_API_BASE_URL || "http://localhost:4000";

function Toast({ message, type = "info", onClose }) {
  if (!message) return null;
  const bg = type === "success" ? "#d4edda" : type === "error" ? "#f8d7da" : "#fff3cd";
  const border = type === "success" ? "#c3e6cb" : type === "error" ? "#f5c6cb" : "#ffeeba";
  return (
    <div style={{
      position: "fixed", right: 20, top: 20, background: bg, border: `1px solid ${border}`,
      padding: 12, borderRadius: 6, zIndex: 9999, minWidth: 260, boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
    }} onClick={onClose}>
      <strong style={{display:"block", marginBottom:6}}>{type === "success" ? "Success" : type === "error" ? "Error" : "Info"}</strong>
      <div style={{ fontSize: 13 }}>{message}</div>
    </div>
  );
}

export default function AdminPage() {
  const [pageId, setPageId] = useState("page2");
  const [components, setComponents] = useState([]);
  const [newCompKey, setNewCompKey] = useState("");
  const [newCompLabel, setNewCompLabel] = useState("");
  const [newCompType, setNewCompType] = useState("textarea");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("info");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadConfig(pageId);
  }, [pageId]);

  const showToast = (msg, type="info", ms=2500) => {
    setStatusMessage(msg);
    setStatusType(type);
    if (ms>0) setTimeout(()=>{ setStatusMessage("") }, ms);
  };

  const loadConfig = async (pid) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admin/pages/${pid}`);
      const cfg = res.data || { components: [] };
      // ensure components array exists
      setComponents(cfg.components || []);
    } catch (err) {
      console.error(err);
      showToast("Failed to load page config. Showing empty config.", "error", 4000);
      setComponents([]);
    } finally {
      setLoading(false);
    }
  };

  const persist = async () => {
    // validate unique keys and required fields
    const errs = {};
    const keys = new Set();
    components.forEach((c, idx) => {
      if (!c.key || c.key.trim()==="") errs[idx] = "Key is required";
      if (!c.label || c.label.trim()==="") errs[idx] = (errs[idx] ? errs[idx] + "; label required" : "Label is required");
      if (keys.has(c.key)) errs[idx] = (errs[idx] ? errs[idx] + "; duplicate key" : "Duplicate key");
      keys.add(c.key);
      if (!["textarea","text","date","address"].includes(c.type)) errs[idx] = (errs[idx] ? errs[idx] + "; invalid type" : "Invalid type");
    });
    setErrors(errs);
    if (Object.keys(errs).length>0) {
      showToast("Validation failed. Fix highlighted fields.", "error", 4000);
      return;
    }

    try {
      await axios.post(`${API}/admin/pages/${pageId}`, { components });
      showToast("Page configuration saved.", "success", 2500);
      // reload to ensure saved config is consistent with backend
      loadConfig(pageId);
    } catch (err) {
      console.error(err);
      showToast("Failed to save configuration.", "error", 4000);
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const src = result.source.index;
    const dest = result.destination.index;
    const copy = Array.from(components);
    const [moved] = copy.splice(src, 1);
    copy.splice(dest, 0, moved);
    setComponents(copy);
  };

  const addComponent = () => {
    // basic validation for new component
    const key = newCompKey.trim();
    const label = newCompLabel.trim();
    if (!key) { showToast("Component key is required.", "error"); return; }
    if (!label) { showToast("Component label is required.", "error"); return; }
    if (components.find(c => c.key === key)) { showToast("Component key must be unique.", "error"); return; }
    if (!["textarea","text","date","address"].includes(newCompType)) { showToast("Invalid component type.", "error"); return; }
    const c = { key, label, type: newCompType };
    setComponents(prev => [...prev, c]);
    setNewCompKey(""); setNewCompLabel(""); setNewCompType("textarea");
    showToast("Component added (unsaved).", "info", 1500);
  };

  const updateComponent = (idx, patch) => {
    setComponents(prev => {
      const copy = Array.from(prev);
      copy[idx] = { ...copy[idx], ...patch };
      return copy;
    });
  };

  const removeComponent = (idx) => {
    setComponents(prev => prev.filter((_,i)=>i!==idx));
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Admin Editor</h2>
      <div style={{ marginBottom: 12 }}>
        <label>Select page: </label>
        <select value={pageId} onChange={(e)=>setPageId(e.target.value)} style={{ marginLeft: 8 }}>
          <option value="page2">Page 2</option>
          <option value="page3">Page 3</option>
        </select>
        <button onClick={persist} style={{ marginLeft: 12 }}>Save Configuration</button>
        {loading && <span style={{ marginLeft: 8 }}>Loading...</span>}
      </div>

      <div style={{ display: "flex", gap: 16 }}>
        <div style={{ flex: 1 }}>
          <h4>Components</h4>
          <div style={{ border: "1px dashed #ddd", padding: 8, minHeight: 120 }}>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="components">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {components.map((c, idx) => (
                      <Draggable key={c.key || ("c-"+idx)} draggableId={(c.key||("c-"+idx))+""} index={idx}>
                        {(prov) => (
                          <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps} style={{
                            padding: 8, marginBottom: 8, background: "#fff", borderRadius: 6, boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                            display: "flex", gap: 8, alignItems: "flex-start", ...prov.draggableProps.style
                          }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 600 }}>{c.label || <em>Unnamed</em>}</div>
                              <div style={{ fontSize: 12, color: "#555" }}>{c.key} · {c.type}</div>

                              <div style={{ marginTop: 8 }}>
                                <label style={{ display: "block", fontSize: 12 }}>Key</label>
                                <input value={c.key} onChange={(e)=>updateComponent(idx, { key: e.target.value })} />
                                {errors[idx] && errors[idx].includes("Key") && <div style={{ color: "red", fontSize: 12 }}>{errors[idx]}</div>}
                                <label style={{ display: "block", fontSize: 12, marginTop: 6 }}>Label</label>
                                <input value={c.label} onChange={(e)=>updateComponent(idx, { label: e.target.value })} />
                                {errors[idx] && errors[idx].includes("label") && <div style={{ color: "red", fontSize: 12 }}>{errors[idx]}</div>}
                                <label style={{ display: "block", fontSize: 12, marginTop: 6 }}>Type</label>
                                <select value={c.type} onChange={(e)=>updateComponent(idx, { type: e.target.value })}>
                                  <option value="textarea">textarea</option>
                                  <option value="text">text</option>
                                  <option value="date">date</option>
                                  <option value="address">address</option>
                                </select>
                                {errors[idx] && errors[idx].includes("type") && <div style={{ color: "red", fontSize: 12 }}>{errors[idx]}</div>}
                              </div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                              <button onClick={()=>removeComponent(idx)} style={{ background: "#ffe6e6", border: "1px solid #ffbcbc" }}>Remove</button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {components.length === 0 && <div style={{ padding: 12, color: "#666" }}>No components. Add one from the panel on the right.</div>}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>

        <div style={{ width: 360 }}>
          <h4>Add New Component</h4>
          <div style={{ display: "grid", gap: 8 }}>
            <label>Key</label>
            <input value={newCompKey} onChange={(e)=>setNewCompKey(e.target.value)} placeholder="unique_key" />
            <label>Label</label>
            <input value={newCompLabel} onChange={(e)=>setNewCompLabel(e.target.value)} placeholder="Label shown to users" />
            <label>Type</label>
            <select value={newCompType} onChange={(e)=>setNewCompType(e.target.value)}>
              <option value="textarea">textarea</option>
              <option value="text">text</option>
              <option value="date">date</option>
              <option value="address">address</option>
            </select>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={addComponent}>Add</button>
              <button onClick={()=>{ setNewCompKey(""); setNewCompLabel(""); setNewCompType("textarea"); }}>Reset</button>
            </div>

            <div style={{ marginTop: 18 }}>
              <h4>Help</h4>
              <div style={{ fontSize: 13, color: "#444" }}>
                - Reorder by drag & drop. <br/>
                - Edit keys/labels inline. Keys must be unique and non-empty. <br/>
                - Click "Save Configuration" to persist to backend. <br/>
                - Components types: textarea, text, date, address (address expands to street/city/state/zip on the wizard).
              </div>
            </div>
          </div>
        </div>
      </div>

      <Toast message={statusMessage} type={statusType} onClose={()=>setStatusMessage("")} />
    </div>
  );
}