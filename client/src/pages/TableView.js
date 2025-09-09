// client/src/pages/TableView.js
import React, { useEffect, useState } from "react";
import Table from "../components/Table";

function TableView() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
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