// client/src/pages/TableView.js
import React, { useEffect, useState } from "react";
import Table from "../components/Table";
import axios from "axios";

const API = (process.env.REACT_APP_API_BASE_URL || "http://localhost:4000").replace(/\/$/, "");

function TableView() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/data`)
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2>User Data</h2>
      <Table data={data} />
    </div>
  );
}

export default TableView;