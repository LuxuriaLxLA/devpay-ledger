import React, { useEffect, useMemo, useState } from "react";

type PageId =
  | "home"
  | "about"
  | "services"
  | "cycles"
  | "security"
  | "milestones"
  | "resources"
  | "cms"
  | "contact"
  | "portal";

interface PaymentRecord {
  id: string;
  developer: string;
  role: string;
  amount: number;
  status: "Pago" | "Pendente";
  date: string;
}

interface MilestoneItem {
  id: string;
  phase: string;
  title: string;
  deliverable: string;
  status: "Concluído" | "Em andamento" | "Planejado";
}

interface CmsContent {
  brandName: string;
  tagline: string;
  heroTitle: string;
  heroSubtitle: string;
  announcement: string;
  aboutText: string;
  servicesText: string;
  securityText: string;
}

const STORAGE_PAYMENTS_KEY = "devpay_portal_payments_v1";
const STORAGE_CMS_KEY = "devpay_portal_cms_v1";
const STORAGE_AUTH_KEY = "devpay_portal_auth_v1";

const NAV_PAGES: { id: PageId; label: string; restricted?: boolean }[] = [
  { id: "home", label: "01. Home" },
  { id: "about", label: "02. About Us" },
  { id: "services", label: "03. Services" },
  { id: "cycles", label: "04. Cycles" },
  { id: "security", label: "05. Security" },
  { id: "milestones", label: "06. Milestones" },
  { id: "resources", label: "07. Resources" },
  { id: "cms", label: "08. CMS Editor" },
  { id: "contact", label: "09. Contact" },
  { id: "portal", label: "10. Restricted Portal", restricted: true },
];

const INITIAL_PAYMENTS: PaymentRecord[] = [
  {
    id: "1",
    developer: "Ana Silva",
    role: "Frontend / React",
    amount: 3200,
    status: "Pago",
    date: "2026-11-05",
  },
  {
    id: "2",
    developer: "Bruno Costa",
    role: "Backend / APIs",
    amount: 3600,
    status: "Pendente",
    date: "2026-11-15",
  },
  {
    id: "3",
    developer: "Carla Mendes",
    role: "DevOps / Cloud",
    amount: 3400,
    status: "Pago",
    date: "2026-11-05",
  },
];

const INITIAL_MILESTONES: MilestoneItem[] = [
  {
    id: "m1",
    phase: "Etapa 1",
    title: "Arquitetura das 10 páginas e layout responsivo",
    deliverable: "Navegação unificada para desktop, tablet e mobile",
    status: "Concluído",
  },
  {
    id: "m2",
    phase: "Etapa 2",
    title: "Portal restrito e controlo de acesso autorizado",
    deliverable: "Autenticação para área de gestão salarial e registos",
    status: "Em andamento",
  },
  {
    id: "m3",
    phase: "Etapa 3",
    title: "Painel CMS editável e base de conteúdos",
    deliverable: "Atualização direta de textos sem intervenção no código",
    status: "Em andamento",
  },
  {
    id: "m4",
    phase: "Etapa 4",
    title: "QA, SEO básico e deploy contínuo",
    deliverable: "Testes de regressão, metadados e publicação em produção",
    status: "Planejado",
  },
];

const INITIAL_CMS: CmsContent = {
  brandName: "DevSalary Hub",
  tagline: "Gestão estruturada de salários e ciclos para equipas de engenharia",
  heroTitle: "Compensação de desenvolvedores clara, previsível e protegida",
  heroSubtitle:
    "Plataforma privada com 10 secções integradas, cronograma por etapas, gestão de conteúdos e acesso restrito para equipas autorizadas.",
  announcement: "Ciclo de novembro em revisão — fecho previsto para o dia 28.",
  aboutText:
    "Ajudamos empresas de tecnologia a organizar folhas de pagamento de desenvolvedores, bónus por entrega e históricos de remuneração com rastreabilidade.",
  servicesText:
    "Planeamento de faixas salariais por senioridade, consolidação por ciclo, controlo de pagamentos pendentes e relatórios prontos para revisão.",
  securityText:
    "Separação entre páginas institucionais e área restrita, validação de entradas e foco em privacidade de dados operacionais.",
};

export function App() {
  const [activePage, setActivePage] = useState<PageId>("home");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_AUTH_KEY) === "true";
    } catch {
      return false;
    }
  });

  const [cms, setCms] = useState<CmsContent>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CMS_KEY);
      return saved ? { ...INITIAL_CMS, ...JSON.parse(saved) } : INITIAL_CMS;
    } catch {
      return INITIAL_CMS;
    }
  });

  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PAYMENTS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
    } catch {
      return INITIAL_PAYMENTS;
    }
  });

  // Login form state
  const [loginEmail, setLoginEmail] = useState("admin@devsalary.io");
  const [loginPass, setLoginPass] = useState("123456");
  const [loginError, setLoginError] = useState("");

  // Payment form state (inside Restricted Portal)
  const [developer, setDeveloper] = useState("");
  const [role, setRole] = useState("Fullstack");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<"Pago" | "Pendente">("Pendente");

  // Contact form state
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactSent, setContactSent] = useState(false);

  // CMS feedback
  const [cmsSavedNotice, setCmsSavedNotice] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PAYMENTS_KEY, JSON.stringify(payments));
    } catch {
      // Ignora falhas de armazenamento
    }
  }, [payments]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CMS_KEY, JSON.stringify(cms));
    } catch {
      // Ignora falhas de armazenamento
    }
  }, [cms]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_AUTH_KEY, String(isAuthenticated));
    } catch {
      // Ignora falhas de armazenamento
    }
  }, [isAuthenticated]);

  const totals = useMemo(() => {
    const total = payments.reduce((acc, item) => acc + item.amount, 0);
    const paid = payments
      .filter((item) => item.status === "Pago")
      .reduce((acc, item) => acc + item.amount, 0);
    const pending = total - paid;
    return { total, paid, pending };
  }, [payments]);

  function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!loginEmail.trim() || loginPass.trim().length < 4) {
      setLoginError("Informe um e-mail válido e uma senha com pelo menos 4 caracteres.");
      return;
    }
    setLoginError("");
    setIsAuthenticated(true);
    setActivePage("portal");
  }

  function handleLogout() {
    setIsAuthenticated(false);
    setActivePage("home");
  }

  function handleAddPayment(e: React.FormEvent) {
    e.preventDefault();
    const numericAmount = Number(amount);
    if (!developer.trim() || Number.isNaN(numericAmount) || numericAmount <= 0) {
      return;
    }
    const newRecord: PaymentRecord = {
      id: String(Date.now()),
      developer: developer.trim(),
      role: role.trim() || "Developer",
      amount: numericAmount,
      status,
      date: new Date().toISOString().slice(0, 10),
    };
    setPayments((prev) => [newRecord, ...prev]);
    setDeveloper("");
    setAmount("");
  }

  function togglePaymentStatus(id: string) {
    setPayments((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: item.status === "Pago" ? "Pendente" : "Pago" }
          : item
      )
    );
  }

  function handleSaveCms(e: React.FormEvent) {
    e.preventDefault();
    setCmsSavedNotice(true);
    setTimeout(() => setCmsSavedNotice(false), 2500);
  }

  function handleResetCms() {
    setCms(INITIAL_CMS);
    setCmsSavedNotice(true);
    setTimeout(() => setCmsSavedNotice(false), 2500);
  }

  function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      return;
    }
    setContactSent(true);
    setContactName("");
    setContactEmail("");
    setContactMessage("");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Announcement Bar */}
      <div className="bg-blue-950/80 border-b border-blue-800/50 px-4 py-2 text-xs text-blue-200 flex flex-wrap items-center justify-between gap-2">
        <span>{cms.announcement}</span>
        <span className="font-medium">
          Sessão: {isAuthenticated ? "Autorizada (Acesso Restrito Ativo)" : "Visitante (Área Restrita Bloqueada)"}
        </span>
      </div>

      {/* Header & 10-Page Navigation */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">
                {cms.brandName}
              </h1>
              <p className="text-xs text-slate-400">{cms.tagline}</p>
            </div>

            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition"
                >
                  Sair da área restrita
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setActivePage("portal")}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition"
                >
                  Login / Área Restrita
                </button>
              )}
            </div>
          </div>

          <nav
            aria-label="Navegação principal de 10 páginas"
            className="flex gap-1.5 overflow-x-auto pb-1"
          >
            {NAV_PAGES.map((page) => {
              const isActive = activePage === page.id;
              return (
                <button
                  key={page.id}
                  type="button"
                  onClick={() => setActivePage(page.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {page.label}
                  {page.restricted ? (isAuthenticated ? " • Aberto" : " • Privado") : ""}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {/* 01. HOME */}
        {activePage === "home" && (
          <section className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-4">
              <span className="inline-block text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded bg-blue-950 text-blue-300 border border-blue-800">
                Página 01 · Visão Geral
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                {cms.heroTitle}
              </h2>
              <p className="text-slate-300 max-w-3xl leading-relaxed">
                {cms.heroSubtitle}
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActivePage("milestones")}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-semibold text-white"
                >
                  Ver Cronograma (Milestones)
                </button>
                <button
                  type="button"
                  onClick={() => setActivePage("portal")}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-semibold text-slate-100 border border-slate-700"
                >
                  Acessar Portal Restrito
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <p className="text-xs text-slate-400">Estrutura Completa</p>
                <p className="text-2xl font-bold text-white mt-1">10 Páginas</p>
                <p className="text-xs text-slate-400 mt-2">
                  Institucional, processos, cronograma, CMS e portal privado num só projeto.
                </p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <p className="text-xs text-slate-400">Controlo de Acesso</p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">Restrito</p>
                <p className="text-xs text-slate-400 mt-2">
                  Dados salariais e lançamentos protegidos por sessão de utilizador autorizado.
                </p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <p className="text-xs text-slate-400">Atualização Rápida</p>
                <p className="text-2xl font-bold text-blue-400 mt-1">CMS Integrado</p>
                <p className="text-xs text-slate-400 mt-2">
                  Edite títulos, avisos e textos institucionais com persistência local.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* 02. ABOUT US */}
        {activePage === "about" && (
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              Página 02 · About Us
            </span>
            <h2 className="text-2xl font-bold text-white">Sobre a Operação</h2>
            <p className="text-slate-300 leading-relaxed">{cms.aboutText}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <h3 className="font-semibold text-white">Foco em equipas técnicas</h3>
                <p className="text-sm text-slate-400 mt-1">
                  Organização por função (Frontend, Backend, Fullstack, DevOps) e ciclo de pagamento.
                </p>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <h3 className="font-semibold text-white">Previsibilidade para gestores</h3>
                <p className="text-sm text-slate-400 mt-1">
                  Visão clara entre valores pagos, pendentes e próximos marcos de entrega.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* 03. SERVICES */}
        {activePage === "services" && (
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-5">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              Página 03 · Products & Services
            </span>
            <h2 className="text-2xl font-bold text-white">Serviços de Gestão Salarial</h2>
            <p className="text-slate-300 leading-relaxed">{cms.servicesText}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-1">
                <h3 className="font-semibold text-white">Folha por Desenvolvedor</h3>
                <p className="text-sm text-slate-400">
                  Registo de remuneração base, função, data do ciclo e estado de pagamento.
                </p>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-1">
                <h3 className="font-semibold text-white">Revisão de Pendências</h3>
                <p className="text-sm text-slate-400">
                  Acompanhamento de valores pendentes antes da liquidação final do ciclo.
                </p>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-1">
                <h3 className="font-semibold text-white">Gestão de Conteúdo</h3>
                <p className="text-sm text-slate-400">
                  Atualização de comunicados e páginas sem necessidade de alterar código.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* 04. CYCLES */}
        {activePage === "cycles" && (
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              Página 04 · Payroll Cycles
            </span>
            <h2 className="text-2xl font-bold text-white">Fluxo dos Ciclos de Pagamento</h2>
            <ol className="space-y-3 text-sm text-slate-300">
              <li className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <strong className="text-white">1. Abertura do ciclo:</strong> confirmação da lista de desenvolvedores ativos e funções.
              </li>
              <li className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <strong className="text-white">2. Lançamento e validação:</strong> inserção de valores e conferência de itens pendentes.
              </li>
              <li className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <strong className="text-white">3. Liquidação e registo:</strong> alteração de status para Pago e arquivamento do histórico.
              </li>
            </ol>
          </section>
        )}

        {/* 05. SECURITY */}
        {activePage === "security" && (
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              Página 05 · Security & Restricted Access
            </span>
            <h2 className="text-2xl font-bold text-white">Segurança e Acesso Restrito</h2>
            <p className="text-slate-300 leading-relaxed">{cms.securityText}</p>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-300 space-y-2">
              <p>• Páginas públicas/institucionais separadas do módulo operacional restrito.</p>
              <p>• Verificação de sessão antes de exibir o livro de pagamentos e o formulário de lançamento.</p>
              <p>• Recomendação para produção: conectar provedor de identidade e base de dados remota criptografada.</p>
            </div>
          </section>
        )}

        {/* 06. MILESTONES */}
        {activePage === "milestones" && (
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-5">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              Página 06 · Project Timeline & Milestones
            </span>
            <h2 className="text-2xl font-bold text-white">Cronograma por Etapas (Milestones)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {INITIAL_MILESTONES.map((m) => (
                <div
                  key={m.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-blue-400">{m.phase}</span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                        m.status === "Concluído"
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          : m.status === "Em andamento"
                          ? "bg-amber-950 text-amber-300 border border-amber-800"
                          : "bg-slate-800 text-slate-300 border border-slate-700"
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>
                  <h3 className="font-semibold text-white">{m.title}</h3>
                  <p className="text-sm text-slate-400">{m.deliverable}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 07. RESOURCES */}
        {activePage === "resources" && (
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              Página 07 · Resources & FAQ
            </span>
            <h2 className="text-2xl font-bold text-white">Recursos e Perguntas Frequentes</h2>
            <div className="space-y-3 text-sm">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <h3 className="font-semibold text-white">Como atualizar textos sem mexer no código?</h3>
                <p className="text-slate-400 mt-1">
                  Abra a aba <strong>08. CMS Editor</strong>, altere os campos desejados e toque em guardar.
                </p>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <h3 className="font-semibold text-white">Onde ficam os registos de pagamentos?</h3>
                <p className="text-slate-400 mt-1">
                  Na aba <strong>10. Restricted Portal</strong> após iniciar sessão com utilizador autorizado.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* 08. CMS EDITOR */}
        {activePage === "cms" && (
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                  Página 08 · Content Management
                </span>
                <h2 className="text-2xl font-bold text-white">Editor Rápido de Conteúdo (CMS)</h2>
              </div>
              {cmsSavedNotice && (
                <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Alterações guardadas!
                </span>
              )}
            </div>

            <form onSubmit={handleSaveCms} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Nome da marca</label>
                  <input
                    type="text"
                    value={cms.brandName}
                    onChange={(e) => setCms({ ...cms, brandName: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Aviso do topo</label>
                  <input
                    type="text"
                    value={cms.announcement}
                    onChange={(e) => setCms({ ...cms, announcement: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Título principal (Home)</label>
                <input
                  type="text"
                  value={cms.heroTitle}
                  onChange={(e) => setCms({ ...cms, heroTitle: e.target.value })}
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Subtítulo (Home)</label>
                <textarea
                  rows={2}
                  value={cms.heroSubtitle}
                  onChange={(e) => setCms({ ...cms, heroSubtitle: e.target.value })}
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-semibold text-white"
                >
                  Guardar conteúdo
                </button>
                <button
                  type="button"
                  onClick={handleResetCms}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-semibold text-slate-200 border border-slate-700"
                >
                  Restaurar padrão
                </button>
              </div>
            </form>
          </section>
        )}

        {/* 09. CONTACT */}
        {activePage === "contact" && (
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-5 max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              Página 09 · Contact Form
            </span>
            <h2 className="text-2xl font-bold text-white">Fale Connosco</h2>

            {contactSent && (
              <div className="rounded-xl bg-emerald-950 border border-emerald-800 p-3 text-sm text-emerald-200">
                Mensagem registada com sucesso. Entraremos em contacto em breve.
              </div>
            )}

            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Nome</label>
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">E-mail corporativo</label>
                <input
                  type="email"
                  placeholder="nome@empresa.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Mensagem</label>
                <textarea
                  rows={4}
                  placeholder="Como podemos ajudar com a gestão salarial da sua equipa?"
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-semibold text-white"
              >
                Enviar mensagem
              </button>
            </form>
          </section>
        )}

        {/* 10. RESTRICTED PORTAL */}
        {activePage === "portal" && (
          <section className="space-y-6">
            {!isAuthenticated ? (
              <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                  Página 10 · Acesso Restrito
                </span>
                <h2 className="text-xl font-bold text-white">Login de Utilizador Autorizado</h2>
                <p className="text-xs text-slate-400">
                  Entre para visualizar os totais do ciclo e registar pagamentos de desenvolvedores.
                </p>

                {loginError && (
                  <p className="text-xs text-rose-400 bg-rose-950/60 border border-rose-800 rounded-lg p-2.5">
                    {loginError}
                  </p>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">E-mail</label>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Senha</label>
                    <input
                      type="password"
                      value={loginPass}
                      onChange={(e) => setLoginPass(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-semibold text-white"
                  >
                    Entrar no portal restrito
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                    <p className="text-xs text-slate-400">Total do ciclo</p>
                    <p className="text-2xl font-bold text-white mt-1">
                      ${totals.total.toLocaleString("en-US")}
                    </p>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                    <p className="text-xs text-slate-400">Pago</p>
                    <p className="text-2xl font-bold text-emerald-400 mt-1">
                      ${totals.paid.toLocaleString("en-US")}
                    </p>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                    <p className="text-xs text-slate-400">Pendente</p>
                    <p className="text-2xl font-bold text-amber-400 mt-1">
                      ${totals.pending.toLocaleString("en-US")}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <form
                    onSubmit={handleAddPayment}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 h-fit"
                  >
                    <h3 className="font-semibold text-white">Novo registo de pagamento</h3>
                    <input
                      type="text"
                      placeholder="Nome do desenvolvedor"
                      value={developer}
                      onChange={(e) => setDeveloper(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white"
                    />
                    <input
                      type="text"
                      placeholder="Função (ex.: Fullstack)"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white"
                    />
                    <input
                      type="number"
                      placeholder="Valor (ex.: 2500)"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white"
                    />
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as "Pago" | "Pendente")}
                      className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white"
                    >
                      <option value="Pendente">Pendente</option>
                      <option value="Pago">Pago</option>
                    </select>
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-semibold text-white"
                    >
                      Adicionar ao livro
                    </button>
                  </form>

                  <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                    <h3 className="font-semibold text-white">Livro de pagamentos da equipa</h3>
                    <div className="divide-y divide-slate-800">
                      {payments.map((item) => (
                        <div
                          key={item.id}
                          className="py-3 flex flex-wrap items-center justify-between gap-2 text-sm"
                        >
                          <div>
                            <p className="font-medium text-white">{item.developer}</p>
                            <p className="text-xs text-slate-400">
                              {item.role} · {item.date}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-white">
                              ${item.amount.toLocaleString("en-US")}
                            </span>
                            <button
                              type="button"
                              onClick={() => togglePaymentStatus(item.id)}
                              className={`text-xs px-2.5 py-1 rounded-lg font-medium ${
                                item.status === "Pago"
                                  ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                                  : "bg-amber-950 text-amber-300 border border-amber-800"
                              }`}
                            >
                              {item.status}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="bg-slate-900 border-t border-slate-800 px-4 py-4 text-center text-xs text-slate-400">
        {cms.brandName} · Plataforma integrada de 10 páginas para gestão de salários de desenvolvedores
      </footer>
    </div>
  );
}

export default App;
