import type { Estimation, EstimationVersion, RfqPipeline, Company, Plant, AuditEntry, DashboardStats, EstimationData } from '../types';

const BASE = '/api';

async function req<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json', ...opts?.headers },
    ...opts,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? res.statusText);
  }
  return res.json();
}

export const api = {
  // Estimations
  listEstimations: () => req<Estimation[]>('/estimations'),
  getEstimation: (id: number) => req<Estimation & { versions: EstimationVersion[]; latestVersion: EstimationVersion | null }>(`/estimations/${id}`),
  createEstimation: (body: { rfqNo: string; itemCode: string; plantCode: string; companyCode: string; customer: string; materialType: string; data: EstimationData }) =>
    req<Estimation>('/estimations', { method: 'POST', body: JSON.stringify(body) }),
  saveVersion: (id: number, body: { label: string; createdBy: string; notes?: string; data: EstimationData }) =>
    req<EstimationVersion>(`/estimations/${id}/versions`, { method: 'POST', body: JSON.stringify(body) }),
  getVersion: (id: number, ver: number) =>
    req<EstimationVersion>(`/estimations/${id}/versions/${ver}`),
  approveVersion: (id: number, ver: number, approver: string) =>
    req(`/estimations/${id}/versions/${ver}/approve`, { method: 'PATCH', body: JSON.stringify({ approver }) }),

  // Pipeline
  listPipeline: () => req<RfqPipeline[]>('/pipeline'),
  advanceStage: (id: number, stage: string, actor?: string) =>
    req(`/pipeline/${id}/stage`, { method: 'PATCH', body: JSON.stringify({ stage, actor }) }),
  createRfq: (body: { rfqNo: string; item: string; companyCode: string; plantCode: string; customer: string; amountDisplay?: string }) =>
    req<RfqPipeline>('/pipeline', { method: 'POST', body: JSON.stringify(body) }),

  // Master data
  listCompanies: () => req<Company[]>('/master/companies'),
  listPlants: () => req<Plant[]>('/master/plants'),
  getPlant: (code: string) => req<Plant>(`/master/plants/${code}`),
  updatePlantRates: (code: string, data: Partial<Plant>) =>
    req(`/master/plants/${code}`, { method: 'PATCH', body: JSON.stringify(data) }),
  listAudit: () => req<AuditEntry[]>('/master/audit'),

  // Analytics
  getDashboard: () => req<DashboardStats>('/analytics/dashboard'),
  getPlantComparison: () => req<Plant[]>('/analytics/plant-comparison'),
};
