import React, { useState } from "react";
import { API_BASE_URL } from "../api/baseUrl";

export interface ManagerDashboardProps {
  authToken: string;
  userName: string;
  lojaNome?: string | null;
  dateRange: { startDate: Date; endDate: Date };
  setDateRange: (range: { startDate: Date; endDate: Date }) => void;
  dashboard: any;
  loading: boolean;
  error?: string;
  onNavigate?: (tab: string) => void;
}

export default function ManagerDashboard({
  authToken,
  userName,
  lojaNome,
  dateRange,
  setDateRange,
  dashboard,
  loading,
  error,
  onNavigate,
}: ManagerDashboardProps) {
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [downloadingProposalId, setDownloadingProposalId] = useState<number | null>(null);
  const [actionNotice, setActionNotice] = useState("");
  const [actionError, setActionError] = useState("");
  const [filterSeller, setFilterSeller] = useState("ALL");

  // Meta da equipe (persistida localmente por gerente)
  const [teamGoal, setTeamGoal] = useState<number>(() => {
    const saved = localStorage.getItem(`vfc_team_goal_${userName}`);
    return saved ? Number(saved) : 300000;
  });
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(String(teamGoal));

  const money = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(val || 0);

  const moneyDecimals = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val || 0);

  const formatDate = (isoString: string) => {
    try {
      return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
      }).format(new Date(isoString));
    } catch {
      return isoString;
    }
  };

  const summary = dashboard?.summary || {
    simulations: 0,
    proposals: 0,
    pendingProposals: 0,
    rejectedProposals: 0,
    contracts: 0,
    salesVolume: 0,
    commissionAmount: 0,
  };

  const simulations = summary.simulations || 0;
  const contracts = summary.contracts || 0;
  const proposals = summary.proposals || 0;
  const pendingProposals = summary.pendingProposals || 0;
  const rejectedProposals = summary.rejectedProposals || 0;
  const salesVolume = summary.salesVolume || 0;
  const commissionAmount = summary.commissionAmount || 0;

  // Cálculos de inteligência comercial
  const conversionRate = simulations > 0 ? ((contracts / simulations) * 100).toFixed(1) : "0.0";
  const ticketMedio = contracts > 0 ? salesVolume / contracts : 0;
  const sellers: any[] = dashboard?.sellers || [];
  const timeline: any[] = dashboard?.timeline || [];
  const recentProposals: any[] = dashboard?.recentProposals || [];

  // Meta percentual e progresso do anel SVG
  const goalPercent = teamGoal > 0 ? Math.min(100, Math.round((salesVolume / teamGoal) * 100)) : 0;
  const circumference = 307.8; // raio ~49 no SVG
  const strokeOffset = circumference - (circumference * goalPercent) / 100;

  // Filtragem de propostas recentes por vendedor
  const filteredRecentProposals = recentProposals.filter((p) => {
    if (filterSeller === "ALL") return true;
    return p.vendedor === filterSeller;
  });

  // Download do Relatório Oficial de Comissões em PDF
  const downloadCommissionsPdf = async () => {
    try {
      setDownloadingReport(true);
      setActionError("");
      const startStr = dateRange.startDate.toISOString().slice(0, 10);
      const endStr = dateRange.endDate.toISOString().slice(0, 10);
      const response = await fetch(
        `${API_BASE_URL}/reports/commissions.pdf?startDate=${startStr}&endDate=${endStr}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      if (!response.ok) {
        const errPayload = await response.json().catch(() => null);
        throw new Error(errPayload?.message || "Erro ao gerar o relatório em PDF.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `relatorio-comissoes-${startStr}-${endStr}.pdf`;
      anchor.click();
      URL.revokeObjectURL(url);
      setActionNotice("Relatório de comissões exportado com sucesso.");
      setTimeout(() => setActionNotice(""), 4000);
    } catch (err: any) {
      setActionError(err.message || "Não foi possível baixar o relatório.");
      setTimeout(() => setActionError(""), 5000);
    } finally {
      setDownloadingReport(false);
    }
  };

  // Download do PDF da Proposta
  const downloadProposalPdf = async (id: number) => {
    try {
      setDownloadingProposalId(id);
      setActionError("");
      const response = await fetch(`${API_BASE_URL}/propostas/${id}/pdf`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!response.ok) throw new Error("Não foi possível gerar o PDF da proposta.");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `proposta-${id}.pdf`;
      anchor.click();
      URL.revokeObjectURL(url);
      setActionNotice(`PDF da proposta #${id} baixado com sucesso.`);
      setTimeout(() => setActionNotice(""), 4000);
    } catch (err: any) {
      setActionError(err.message || "Falha ao baixar o PDF.");
      setTimeout(() => setActionError(""), 5000);
    } finally {
      setDownloadingProposalId(null);
    }
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Number(goalInput.replace(/\D/g, ""));
    if (parsed > 0) {
      setTeamGoal(parsed);
      localStorage.setItem(`vfc_team_goal_${userName}`, String(parsed));
    }
    setEditingGoal(false);
  };

  // Maior valor para escalar gráfico de barras
  const maxTimelineVal = Math.max(
    1,
    ...timeline.map((item) => Math.max(item.simulations || 0, item.proposals || 0, item.contracts || 0))
  );

  const topSellerSales = sellers.length > 0 ? Math.max(1, sellers[0].sales || 0) : 1;

  const toInputDate = (d: Date) => (Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10));

  return (
    <div className="content module-content space-y-6">
      {/* 1. CABEÇALHO DA GERÊNCIA */}
      <section className="bg-gradient-to-r from-[#101d35] via-[#162a4a] to-[#1e3a64] rounded-xl p-6 text-white shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 bg-blue-900/40 px-2.5 py-0.5 rounded-full border border-blue-400/20">
                Gestão da Equipe Comercial
              </span>
              <span className="text-[10px] font-medium text-emerald-300 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Perfil Duplo: Gerente & Vendedor
              </span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              Painel da Gerência · <span className="text-blue-200 font-semibold">{userName}</span>
            </h1>
            <p className="text-xs text-blue-200/80 mt-1">
              {lojaNome ? `${lojaNome} — ` : ""}Acompanhe o funil de vendas, metas da equipe, comissões e performance individual em tempo real.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Seletor de Período Integrado */}
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 px-3 py-1.5 rounded-lg text-xs">
              <span className="text-blue-200 font-medium">De</span>
              <input
                type="date"
                className="bg-transparent text-white border-0 text-xs focus:ring-1 focus:ring-blue-400 rounded outline-none p-0 cursor-pointer"
                value={toInputDate(dateRange.startDate)}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) setDateRange({ ...dateRange, startDate: new Date(`${val}T00:00:00`) });
                }}
              />
              <span className="text-blue-200 font-medium">até</span>
              <input
                type="date"
                className="bg-transparent text-white border-0 text-xs focus:ring-1 focus:ring-blue-400 rounded outline-none p-0 cursor-pointer"
                value={toInputDate(dateRange.endDate)}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) setDateRange({ ...dateRange, endDate: new Date(`${val}T23:59:59`) });
                }}
              />
            </div>

            {/* Ações Rápidas no Cabeçalho */}
            <button
              type="button"
              onClick={downloadCommissionsPdf}
              disabled={downloadingReport}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 active:bg-white/25 text-white border border-white/20 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
              title="Baixar Relatório de Comissões da Equipe em PDF"
            >
              {downloadingReport ? (
                <>Gerando PDF...</>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Relatório PDF
                </>
              )}
            </button>

            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate("Simulações")}
                className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs transition shadow-sm"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
                Nova Simulação
              </button>
            )}
          </div>
        </div>
      </section>

      {/* NOTIFICAÇÕES E ALERTAS */}
      {actionNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{actionNotice}</span>
          <button onClick={() => setActionNotice("")} className="text-emerald-600 hover:text-emerald-900 font-bold">✕</button>
        </div>
      )}
      {actionError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{actionError}</span>
          <button onClick={() => setActionError("")} className="text-rose-600 hover:text-rose-900 font-bold">✕</button>
        </div>
      )}
      {error && <div className="auth-notice">{error}</div>}

      {/* 2. CARDS DE KPIS DA EQUIPE */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Volume de Vendas */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Volume Vendido</span>
            <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 grid place-items-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <div className="my-2">
            <h2 className="text-xl font-bold text-slate-800">{loading ? "…" : money(salesVolume)}</h2>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>Ticket médio:</span>
            <strong className="text-slate-700">{contracts > 0 ? money(ticketMedio) : "—"}</strong>
          </div>
        </div>

        {/* Card 2: Contratos Fechados & Conversão */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Contratos Fechados</span>
            <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 grid place-items-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <div className="my-2">
            <h2 className="text-xl font-bold text-slate-800">{loading ? "…" : contracts} <span className="text-xs font-normal text-slate-400">vendas</span></h2>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>Conversão:</span>
            <strong className="text-emerald-600 font-bold">{loading ? "…" : `${conversionRate}%`}</strong>
          </div>
        </div>

        {/* Card 3: Propostas em Andamento */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Em Análise / Tramitando</span>
            <span className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 grid place-items-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <div className="my-2">
            <h2 className="text-xl font-bold text-slate-800">{loading ? "…" : proposals} <span className="text-xs font-normal text-slate-400">ativas</span></h2>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>Total simulações:</span>
            <strong className="text-slate-700">{loading ? "…" : simulations}</strong>
          </div>
        </div>

        {/* Card 4: Comissões Acumuladas */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Comissões da Equipe</span>
            <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 grid place-items-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </span>
          </div>
          <div className="my-2">
            <h2 className="text-xl font-bold text-amber-700">{loading ? "…" : money(commissionAmount)}</h2>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>Inclui override:</span>
            <strong className="text-amber-800">Direta + Equipe</strong>
          </div>
        </div>

        {/* Card 5: Oportunidades de Recuperação de Crédito */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Crédito Recusado</span>
            <span className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 grid place-items-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <div className="my-2">
            <h2 className="text-xl font-bold text-rose-600">{loading ? "…" : rejectedProposals} <span className="text-xs font-normal text-slate-400">recusas</span></h2>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>Potencial:</span>
            {onNavigate ? (
              <button
                type="button"
                onClick={() => onNavigate("Recuperação de crédito")}
                className="text-blue-600 hover:text-blue-800 font-bold hover:underline"
              >
                Fichas de Score →
              </button>
            ) : (
              <strong className="text-slate-600">Recuperação</strong>
            )}
          </div>
        </div>
      </section>

      {/* 3. EVOLUÇÃO TEMPORAL & META DA EQUIPE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Gráfico de Evolução (Timeline) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Evolução de Negociações</h3>
              <p className="text-xs text-slate-500">Distribuição ao longo dos 6 intervalos do período selecionado</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Simulações
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Propostas
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Contratos
              </span>
            </div>
          </div>

          {timeline.length === 0 || loading ? (
            <div className="h-44 flex items-center justify-center text-xs text-slate-400">
              {loading ? "Carregando evolução..." : "Sem dados temporais disponíveis no intervalo."}
            </div>
          ) : (
            <div className="pt-4 pb-2">
              <div className="grid grid-cols-6 gap-3 items-end h-36 border-b border-slate-100 pb-2">
                {timeline.map((bucket, idx) => {
                  const simHeight = Math.max(4, Math.round((bucket.simulations / maxTimelineVal) * 100));
                  const propHeight = Math.max(4, Math.round((bucket.proposals / maxTimelineVal) * 100));
                  const contHeight = Math.max(4, Math.round((bucket.contracts / maxTimelineVal) * 100));
                  return (
                    <div key={idx} className="flex flex-col items-center gap-1 h-full justify-end group">
                      <div className="w-full flex items-end justify-center gap-1 h-full px-1">
                        {/* Barra Simulações */}
                        <div
                          className="w-2.5 bg-blue-500/80 hover:bg-blue-600 rounded-t transition-all relative"
                          style={{ height: `${bucket.simulations > 0 ? simHeight : 4}%` }}
                          title={`Simulações: ${bucket.simulations}`}
                        />
                        {/* Barra Propostas */}
                        <div
                          className="w-2.5 bg-purple-500/80 hover:bg-purple-600 rounded-t transition-all relative"
                          style={{ height: `${bucket.proposals > 0 ? propHeight : 4}%` }}
                          title={`Propostas: ${bucket.proposals}`}
                        />
                        {/* Barra Contratos */}
                        <div
                          className="w-2.5 bg-emerald-500/80 hover:bg-emerald-600 rounded-t transition-all relative"
                          style={{ height: `${bucket.contracts > 0 ? contHeight : 4}%` }}
                          title={`Contratos: ${bucket.contracts}`}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 truncate max-w-full text-center mt-1" title={bucket.label}>
                        {bucket.label.split("–")[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mini-Funil Resumo */}
          <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
            <div className="p-2 rounded bg-slate-50">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">1. Simulações</span>
              <strong className="text-sm text-slate-800">{simulations}</strong>
            </div>
            <div className="p-2 rounded bg-slate-50">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">2. Tramitando</span>
              <strong className="text-sm text-purple-700">{proposals}</strong>
            </div>
            <div className="p-2 rounded bg-slate-50">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">3. Vendas Efetivadas</span>
              <strong className="text-sm text-emerald-700">{contracts}</strong>
            </div>
            <div className="p-2 rounded bg-slate-50">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">4. Recusas</span>
              <strong className="text-sm text-rose-700">{rejectedProposals}</strong>
            </div>
          </div>
        </div>

        {/* Meta da Equipe & Ring SVG */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Meta da Equipe</h3>
              <p className="text-xs text-slate-500">Acompanhamento do objetivo mensal</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setGoalInput(String(teamGoal));
                setEditingGoal(!editingGoal);
              }}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
            >
              {editingGoal ? "Cancelar" : "Ajustar"}
            </button>
          </div>

          {editingGoal ? (
            <form onSubmit={handleSaveGoal} className="my-4 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
              <label className="block text-slate-600 font-medium mb-1">Nova Meta da Equipe (R$):</label>
              <input
                type="number"
                step="5000"
                className="w-full border border-slate-300 rounded p-1.5 text-xs text-slate-800 bg-white mb-2"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                placeholder="Ex: 300000"
              />
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-1 rounded font-bold transition"
              >
                Salvar Meta
              </button>
            </form>
          ) : (
            <div className="my-3 flex flex-col items-center">
              {/* SVG Ring Progress */}
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 110 110">
                  <circle
                    cx="55"
                    cy="55"
                    r="49"
                    className="text-slate-100"
                    strokeWidth="9"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  <circle
                    cx="55"
                    cy="55"
                    r="49"
                    className="text-blue-600 transition-all duration-700"
                    strokeWidth="9"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeOffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-extrabold text-slate-800">{goalPercent}%</span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Atingido</span>
                </div>
              </div>

              <div className="text-center mt-2">
                <span className="text-xs text-slate-500">Realizado: </span>
                <strong className="text-xs text-slate-800">{money(salesVolume)}</strong>
                <span className="text-xs text-slate-400"> de {money(teamGoal)}</span>
              </div>
            </div>
          )}

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Consultores com atividade:</span>
              <strong className="text-slate-800">{sellers.length}</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Falta para a meta:</span>
              <strong className="text-slate-800">
                {salesVolume >= teamGoal ? (
                  <span className="text-emerald-600 font-bold">Meta batida! 🎉</span>
                ) : (
                  money(teamGoal - salesVolume)
                )}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* 4. RANKING & PERFORMANCE DOS VENDEDORES */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Performance Individual dos Consultores</h3>
            <p className="text-xs text-slate-500">Ranking de produção, conversão e faturamento da equipe no período</p>
          </div>
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate("Minha equipe")}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 self-start sm:self-auto"
            >
              Gerenciar Equipe →
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                <th className="py-2.5 px-3 w-14 text-center">Pos.</th>
                <th className="py-2.5 px-3">Consultor / Vendedor</th>
                <th className="py-2.5 px-3 text-center">Simulações</th>
                <th className="py-2.5 px-3 text-center">Em Análise</th>
                <th className="py-2.5 px-3 text-center">Contratos</th>
                <th className="py-2.5 px-3 text-center">Conversão</th>
                <th className="py-2.5 px-3 text-right">Volume Vendido</th>
                <th className="py-2.5 px-3 w-40">Proporção</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Carregando produção dos vendedores...
                  </td>
                </tr>
              ) : sellers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Nenhuma produção registrada para os vendedores neste período.
                  </td>
                </tr>
              ) : (
                sellers.map((seller, index) => {
                  const sSim = seller.simulations || 0;
                  const sCont = seller.contracts || 0;
                  const sConv = sSim > 0 ? ((sCont / sSim) * 100).toFixed(1) : "0.0";
                  const pct = Math.max(4, Math.round(((seller.sales || 0) / topSellerSales) * 100));
                  const initials = seller.name
                    ? seller.name
                        .split(" ")
                        .slice(0, 2)
                        .map((n: string) => n[0] || "")
                        .join("")
                        .toUpperCase()
                    : "VD";

                  return (
                    <tr key={seller.id || seller.name || index} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-grid place-items-center w-6 h-6 rounded-md font-bold text-[11px] ${
                            index === 0
                              ? "bg-amber-100 text-amber-800"
                              : index === 1
                              ? "bg-slate-200 text-slate-700"
                              : index === 2
                              ? "bg-amber-800/15 text-amber-900"
                              : "text-slate-400"
                          }`}
                        >
                          {index + 1}º
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] grid place-items-center flex-shrink-0">
                            {initials}
                          </div>
                          <div>
                            <strong className="text-slate-800 font-semibold block">{seller.name}</strong>
                            <small className="text-slate-400 text-[10px]">Consultor Comercial</small>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center font-medium text-slate-600">{sSim}</td>
                      <td className="py-3 px-3 text-center font-medium text-purple-700">{seller.proposals || 0}</td>
                      <td className="py-3 px-3 text-center">
                        <strong className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                          {sCont}
                        </strong>
                      </td>
                      <td className="py-3 px-3 text-center font-semibold text-slate-700">{sConv}%</td>
                      <td className="py-3 px-3 text-right">
                        <strong className="text-slate-900 font-bold">{money(seller.sales || 0)}</strong>
                      </td>
                      <td className="py-3 px-3">
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. ÚLTIMAS PROPOSTAS DA EQUIPE (TEMPO REAL) */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Últimas Propostas da Equipe</h3>
            <p className="text-xs text-slate-500">Acompanhamento das negociações recém-geradas pelos consultores</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              aria-label="Filtrar por vendedor"
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 bg-white outline-none focus:ring-1 focus:ring-blue-500"
              value={filterSeller}
              onChange={(e) => setFilterSeller(e.target.value)}
            >
              <option value="ALL">Todos os consultores</option>
              {sellers.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate("Propostas")}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
              >
                Ver todas →
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                <th className="py-2.5 px-3">Proposta</th>
                <th className="py-2.5 px-3">Cliente</th>
                <th className="py-2.5 px-3">Veículo Negociado</th>
                <th className="py-2.5 px-3">Consultor</th>
                <th className="py-2.5 px-3 text-right">Valor</th>
                <th className="py-2.5 px-3 text-center">Data</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Documento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-400">
                    Carregando propostas recentes...
                  </td>
                </tr>
              ) : filteredRecentProposals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-400">
                    Nenhuma proposta encontrada para o filtro selecionado.
                  </td>
                </tr>
              ) : (
                filteredRecentProposals.map((prop) => {
                  const s = String(prop.status || "").toLowerCase();
                  const isApproved = ["approved", "aprovada", "contract_effective"].includes(s);
                  const isRejected = ["rejected", "recusada", "credit_rejected", "cancelled"].includes(s);

                  return (
                    <tr key={prop.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-700">
                        #{String(prop.id).padStart(4, "0")}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">{prop.cliente || "Cliente"}</td>
                      <td className="py-2.5 px-3 text-slate-600">{prop.veiculo || "—"}</td>
                      <td className="py-2.5 px-3">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                          {prop.vendedor || "Vendedor"}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                        {moneyDecimals(prop.valor)}
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-400 text-[11px]">
                        {formatDate(prop.createdAt)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isApproved
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : isRejected
                              ? "bg-rose-100 text-rose-800 border border-rose-200"
                              : "bg-blue-100 text-blue-800 border border-blue-200"
                          }`}
                        >
                          {prop.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => downloadProposalPdf(prop.id)}
                          disabled={downloadingProposalId === prop.id}
                          className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded transition disabled:opacity-50"
                        >
                          {downloadingProposalId === prop.id ? "Baixando..." : "Baixar PDF"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 6. ATALHOS RÁPIDOS DA GERÊNCIA */}
      {onNavigate && (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <div
            onClick={() => onNavigate("Simulações")}
            className="p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-xs transition cursor-pointer flex items-center gap-3.5 group"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 grid place-items-center group-hover:bg-blue-600 group-hover:text-white transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <strong className="text-xs font-bold text-slate-800 block group-hover:text-blue-600 transition">
                Venda Direta
              </strong>
              <small className="text-slate-400 text-[11px]">Simular proposta pelo gerente</small>
            </div>
          </div>

          <div
            onClick={() => onNavigate("Minha equipe")}
            className="p-4 bg-white border border-slate-200 rounded-xl hover:border-purple-300 hover:shadow-xs transition cursor-pointer flex items-center gap-3.5 group"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 grid place-items-center group-hover:bg-purple-600 group-hover:text-white transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <strong className="text-xs font-bold text-slate-800 block group-hover:text-purple-600 transition">
                Minha Equipe
              </strong>
              <small className="text-slate-400 text-[11px]">Cadastrar e gerenciar consultores</small>
            </div>
          </div>

          <div
            onClick={() => onNavigate("Recuperação de crédito")}
            className="p-4 bg-white border border-slate-200 rounded-xl hover:border-emerald-300 hover:shadow-xs transition cursor-pointer flex items-center gap-3.5 group"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 grid place-items-center group-hover:bg-emerald-600 group-hover:text-white transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <strong className="text-xs font-bold text-slate-800 block group-hover:text-emerald-600 transition">
                Recuperação de Crédito
              </strong>
              <small className="text-slate-400 text-[11px]">Elevar score de clientes recusados</small>
            </div>
          </div>

          <div
            onClick={() => onNavigate("Equipes e comissões")}
            className="p-4 bg-white border border-slate-200 rounded-xl hover:border-amber-300 hover:shadow-xs transition cursor-pointer flex items-center gap-3.5 group"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 grid place-items-center group-hover:bg-amber-600 group-hover:text-white transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <strong className="text-xs font-bold text-slate-800 block group-hover:text-amber-600 transition">
                Regras e Comissões
              </strong>
              <small className="text-slate-400 text-[11px]">Percentuais e extrato da equipe</small>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
