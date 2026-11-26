import React, { useEffect, useState } from "react";

type PageKey = "overview" | "ledger" | "team";

interface PaymentEntry {
  id: string;
  developer: string;
  role: string;
  amount: number;
  status: "Pago" | "Pendente";
  date: string;
}

const STORAGE_KEY = "devpay_ledger_entries_v1";

const initialEntries: PaymentEntry[] = [
  {
    id: "1",
    developer: "Ana Silva",
    role: "Frontend / React",
    amount: 2400,
    status: "Pago",
    date: "2026-11-05"
  },
  {
    id: "2",
    developer: "Bruno Costa",
    role: "Backend / APIs",
    amount: 2800,
    status: "Pendente",
    date: "2026-11-15"
  },
  {
    id: "3",
    developer: "Carla Dias",
    role: "DevOps & Cloud",
    amount: 2600,
    status: "Pago",
    date: "2026-11-20"
  }
];

export default function App() {
  const [page, setPage] = useState<PageKey>("overview");
  const [entries, setEntries] = useState<PaymentEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved) as PaymentEntry[];
      }
    } catch {
      // Ignora erros de acesso ao localStorage em modo restrito
    }
    return initialEntries;
  });

  const [developer, setDeveloper] = useState("");
  const [role, setRole] = useState("Fullstack");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      // Ignora erros de escrita no localStorage
    }
  }, [entries]);

  const totalAmount = entries.reduce((acc, item) => acc + item.amount, 0);
  const paidAmount = entries
    .filter((item) => item.status === "Pago")
    .reduce((acc, item) => acc + item.amount, 0);
  const pendingAmount = totalAmount - paidAmount;

  function handleAddEntry(e: React.FormEvent) {
    e.preventDefault();
    const numericAmount = Number(amount);
    if (!developer.trim() || Number.isNaN(numericAmount) || numericAmount <= 0) {
      return;
    }

    const newEntry: PaymentEntry = {
      id: String(Date.now()),
      developer: developer.trim(),
      role: role.trim() || "Desenvolvedor",
      amount: numericAmount,
      status: "Pendente",
      date: new Date().toISOString().slice(0, 10)
    };

    setEntries((prev) => [newEntry, ...prev]);
    setDeveloper("");
    setAmount("");
    setPage("ledger");
  }

  function toggleStatus(id: string) {
    setEntries((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: item.status === "Pago" ? "Pendente" : "Pago" }
          : item
      )
    );
  }

  function resetDemoData() {
    setEntries(initialEntries);
  }

  const renderPage = () => {
    if (page === "overview") {
      return (
        <section style={{ display: "grid", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
            <div style={{ padding: 16, borderRadius: 10, background: "#18181b", border: "1px solid #27272a" }}>
              <div style={{ fontSize: 12, color: "#a1a1aa" }}>Total do ciclo</div>
              <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>${totalAmount.toLocaleString()}</div>
            </div>
            <div style={{ padding: 16, borderRadius: 10, background: "#18181b", border: "1px solid #27272a" }}>
              <div style={{ fontSize: 12, color: "#a1a1aa" }}>Pago</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#4ade80", marginTop: 4 }}>${paidAmount.toLocaleString()}</div>
            </div>
            <div style={{ padding: 16, borderRadius: 10, background: "#18181b", border: "1px solid #27272a" }}>
              <div style={{ fontSize: 12, color: "#a1a1aa" }}>Pendente</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#facc15", marginTop: 4 }}>${pendingAmount.toLocaleString()}</div>
            </div>
          </div>

          <form
            onSubmit={handleAddEntry}
            style={{ display: "grid", gap: 10, padding: 16, borderRadius: 10, background: "#18181b", border: "1px solid #27272a" }}
          >
            <strong style={{ fontSize: 15 }}>Novo registo de pagamento</strong>
            <input
              type="text"
              placeholder="Nome do desenvolvedor"
              value={developer}
              onChange={(e) => setDeveloper(e.target.value)}
              style={{ padding: 10, borderRadius: 8, border: "1px solid #3f3f46", background: "#09090b", color: "#fff" }}
            />
            <input
              type="text"
              placeholder="Função (ex.: Backend, Mobile, IA)"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{ padding: 10, borderRadius: 8, border: "1px solid #3f3f46", background: "#09090b", color: "#fff" }}
            />
            <input
              type="number"
              placeholder="Valor (ex.: 2500)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{ padding: 10, borderRadius: 8, border: "1px solid #3f3f46", background: "#09090b", color: "#fff" }}
            />
            <button
              type="submit"
              style={{ padding: 12, borderRadius: 8, border: "none", background: "#2563eb", color: "#fff", fontWeight: 600, cursor: "pointer" }}
            >
              Adicionar ao livro
            </button>
          </form>
        </section>
      );
    }

    if (page === "ledger") {
      return (
        <section style={{ display: "grid", gap: 10 }}>
          {entries.map((entry) => (
            <div
              key={entry.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                padding: 14,
                borderRadius: 10,
                background: "#18181b",
                border: "1px solid #27272a"
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>{entry.developer}</div>
                <div style={{ fontSize: 12, color: "#a1a1aa" }}>
                  {entry.role} • {entry.date} • ${entry.amount.toLocaleString()}
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggleStatus(entry.id)}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid #3f3f46",
                  background: entry.status === "Pago" ? "#14532d" : "#422006",
                  color: "#fff",
                  cursor: "pointer"
                }}
              >
                {entry.status}
              </button>
            </div>
          ))}
        </section>
      );
    }

    return (
      <section style={{ padding: 16, borderRadius: 10, background: "#18181b", border: "1px solid #27272a", display: "grid", gap: 12 }}>
        <div style={{ fontWeight: 600 }}>Estado local (localStorage)</div>
        <p style={{ margin: 0, fontSize: 14, color: "#a1a1aa", lineHeight: 1.5 }}>
          Os registos criados ficam guardados localmente neste navegador. Pode repor os dados de demonstração a qualquer momento.
        </p>
        <button
          type="button"
          onClick={resetDemoData}
          style={{ padding: 10, borderRadius: 8, border: "1px solid #3f3f46", background: "#27272a", color: "#fff", cursor: "pointer", width: "fit-content" }}
        >
          Repor dados iniciais
        </button>
      </section>
    );
  };

  return (
    <main style={{ minHeight: "100vh", background: "#09090b", color: "#f4f4f5", fontFamily: "system-ui, sans-serif", padding: 20 }}>
      <div style={{ maxWidth: 720, margin: "0 auto", display: "grid", gap: 16 }}>
        <header style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22 }}>DevPay Ledger</h1>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#a1a1aa" }}>Controlo simples de pagamentos da equipa</p>
          </div>
          <nav style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={() => setPage("overview")}
              style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #3f3f46", background: page === "overview" ? "#2563eb" : "#18181b", color: "#fff", cursor: "pointer" }}
            >
              Resumo
            </button>
            <button
              type="button"
              onClick={() => setPage("ledger")}
              style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #3f3f46", background: page === "ledger" ? "#2563eb" : "#18181b", color: "#fff", cursor: "pointer" }}
            >
              Pagamentos
            </button>
            <button
              type="button"
              onClick={() => setPage("team")}
              style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #3f3f46", background: page === "team" ? "#2563eb" : "#18181b", color: "#fff", cursor: "pointer" }}
            >
              Dados
            </button>
          </nav>
        </header>

        {renderPage()}
      </div>
    </main>
  );
}
