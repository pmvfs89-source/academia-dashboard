import { useEffect, useMemo, useState } from "react";

const owners = {
  23281672: "Bernardete",
  30036684: "Rita",
  30036673: "Alexandre",
};

function euro(value) {
  return Number(value || 0).toLocaleString("pt-PT", {
    style: "currency",
    currency: "EUR",
  });
}

export default function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/.netlify/functions/pipedrive-dashboard")
      .then((res) => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  const metrics = useMemo(() => {
    if (!data?.deals) return null;

    const won = data.deals.filter((d) => d.status === "won");
    const open = data.deals.filter((d) => d.status === "open");
    const lost = data.deals.filter((d) => d.status === "lost");

    return {
      totalDeals: data.deals.length,
      wonRevenue: won.reduce((s, d) => s + Number(d.value || 0), 0),
      openPipeline: open.reduce((s, d) => s + Number(d.value || 0), 0),
      won: won.length,
      open: open.length,
      lost: lost.length,
    };
  }, [data]);

  if (!data || !metrics) {
    return (
      <div className="page">
        <h1>Academia Dashboard</h1>
        <p>A carregar dados do Pipedrive...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="header">
        <div>
          <p className="eyebrow">Academia Doutor Finanças</p>
          <h1>Command Center</h1>
          <p className="subtitle">
            Dashboard ligado ao Pipedrive · atualizado em{" "}
            {new Date(data.updatedAt).toLocaleString("pt-PT")}
          </p>
        </div>
      </header>

      <section className="grid">
        <Card title="Total de deals" value={metrics.totalDeals} />
        <Card title="Revenue ganho" value={euro(metrics.wonRevenue)} />
        <Card title="Pipeline aberto" value={euro(metrics.openPipeline)} />
        <Card title="Deals ganhos" value={metrics.won} />
        <Card title="Deals abertos" value={metrics.open} />
        <Card title="Deals perdidos" value={metrics.lost} />
      </section>

      <section className="panel">
        <h2>Deals por owner</h2>
        {Object.entries(owners).map(([id, name]) => {
          const ownerDeals = data.deals.filter(
            (deal) => Number(deal.owner_id) === Number(id)
          );

          const ownerRevenue = ownerDeals
            .filter((d) => d.status === "won")
            .reduce((s, d) => s + Number(d.value || 0), 0);

          return (
            <div className="owner" key={id}>
              <strong>{name}</strong>
              <span>{ownerDeals.length} deals</span>
              <span>{euro(ownerRevenue)} ganhos</span>
            </div>
          );
        })}
      </section>

      <section className="panel">
        <h2>Últimos deals</h2>

        <div className="table">
          <div className="row head">
            <span>Deal</span>
            <span>Owner</span>
            <span>Pipeline</span>
            <span>Etapa</span>
            <span>Status</span>
            <span>Valor</span>
          </div>

          {data.deals.slice(0, 40).map((deal) => (
            <div className="row" key={deal.id}>
              <span>{deal.title}</span>
              <span>{owners[deal.owner_id] || deal.owner_id}</span>
              <span>{deal.pipeline}</span>
              <span>{deal.stage}</span>
              <span>{deal.status}</span>
              <span>{euro(deal.value)}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="card">
      <p>{title}</p>
      <strong>{value}</strong>
    </div>
  );
}
