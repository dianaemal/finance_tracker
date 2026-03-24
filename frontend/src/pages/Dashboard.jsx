import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/accounts/"); // protected route
        setData(res.data);
      } catch (err) {
        console.error(err);
        alert("Not authorized");
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}