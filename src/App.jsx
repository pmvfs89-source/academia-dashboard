import { useEffect, useState } from "react";

export default function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/pipedrive-dashboard")
      .then((res) => res.json())
      .then((json) => {
        console.log(json);
        setData(json);
      })
      .catch((err) => console.error(err));
  }, []);

  if (!data) {
    return (
      <div style={{ padding: 40, color: "white" }}>
        Loading dashboard...
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 40,
        background: "#071028",
        minHeight: "100vh",
        color: "white",
        fontFamily: "Arial",
      }}
    >
      <h1>Academia Dashboard</h1>

      <h2>Total Deals</h2>
      <p>{data.deals.length}</p>

      <h2>Deals</h2>

      {data.deals.slice(0, 20).map((deal) => (
        <div
          key={deal.id}
          style={{
            border: "1px solid #1e3a5f",
            padding: 16,
            marginBottom: 12,
            borderRadius: 8,
            background: "#0d1b34",
          }}
        >
          <h3>{deal.title}</h3>

          <p>
            <strong>Pipeline:</strong> {deal.pipeline}
          </p>

          <p>
            <strong>Stage:</strong> {deal.stage}
          </p>

          <p>
            <strong>Status:</strong> {deal.status}
          </p>

          <p>
            <strong>Valor:</strong> € {deal.value}
          </p>
        </div>
      ))}
    </div>
  );
}
