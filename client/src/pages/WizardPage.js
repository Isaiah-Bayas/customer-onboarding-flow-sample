import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API = process.env.REACT_APP_API_BASE_URL || "http://localhost:4000";

export default function WizardPage() {
  const { id } = useParams(); // expects "page2" or "page3"
  const pageId = id;
  const navigate = useNavigate();

  const [config, setConfig] = useState(null);
  const [formData, setFormData] = useState({});
  const [uid, setUid] = useState(localStorage.getItem("currentUid") || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Always fetch latest config whenever pageId changes
  useEffect(() => {
    if (!pageId) return;
    axios
      .get(`${API}/admin/pages/${pageId}?t=${Date.now()}`) // cache-buster to avoid stale data
      .then((res) => {
        setConfig(res.data);
        const initialData = {};
        (res.data.components || []).forEach((c) => (initialData[c.key] = ""));
        setFormData(initialData);
      })
      .catch(() => {
        setConfig({ components: [] });
      });
  }, [pageId]);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const saveAndNext = async (nextPath) => {
    if (!uid) {
      setError("No user logged in. Please go back to login.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await axios.post(`${API}/users`, {
        uid,
        data: formData
      });
      navigate(nextPath);
    } catch (err) {
      console.error(err);
      setError("Failed to save data. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!config) return <div style={{ padding: 16 }}>Loading...</div>;

  return (
    <div style={{ padding: 16 }}>
      <h2>Customer Profile</h2>
      {config.components && config.components.length > 0 ? (
        <div style={{ maxWidth: 600 }}>
          {config.components.map((c) => (
            <div key={c.key} style={{ marginBottom: 12 }}>
              <label>{c.label || c.key}</label>
              {c.type === "textarea" ? (
                <textarea
                  value={formData[c.key] || ""}
                  onChange={(e) => handleChange(c.key, e.target.value)}
                  style={{ width: "100%", height: 80 }}
                />
              ) : c.type === "date" ? (
                <input
                  type="date"
                  value={formData[c.key] || ""}
                  onChange={(e) => handleChange(c.key, e.target.value)}
                />
              ) : c.type === "address" ? (
                <div>
                  <input
                    placeholder="street"
                    value={formData[c.key + "_street"] || ""}
                    onChange={(e) =>
                      handleChange(c.key + "_street", e.target.value)
                    }
                  />
                  <br />
                  <input
                    placeholder="city"
                    value={formData[c.key + "_city"] || ""}
                    onChange={(e) =>
                      handleChange(c.key + "_city", e.target.value)
                    }
                  />
                  <br />
                  <input
                    placeholder="state"
                    value={formData[c.key + "_state"] || ""}
                    onChange={(e) =>
                      handleChange(c.key + "_state", e.target.value)
                    }
                  />
                  <br />
                  <input
                    placeholder="zip"
                    value={formData[c.key + "_zip"] || ""}
                    onChange={(e) =>
                      handleChange(c.key + "_zip", e.target.value)
                    }
                  />
                  <br />
                </div>
              ) : (
                <input
                  value={formData[c.key] || ""}
                  onChange={(e) => handleChange(c.key, e.target.value)}
                />
              )}
            </div>
          ))}
          {error && <div style={{ color: "red", marginBottom: 10 }}>{error}</div>}
          <div style={{ marginTop: 12 }}>
            <button
              disabled={loading}
              onClick={() =>
                saveAndNext(pageId === "page2" ? "/wizard/page3" : "/data")
              }
            >
              {loading ? "Saving..." : "Save & Next"}
            </button>
          </div>
        </div>
      ) : (
        <p>No components configured for this page.</p>
      )}
    </div>
  );
}



