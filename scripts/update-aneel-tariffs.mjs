import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const RESOURCE_ID = 'fcf2906c-7c32-4b9b-a637-054e7a5234f4';
export const SOURCE_URL = 'https://dadosabertos.aneel.gov.br/dataset/tarifas-distribuidoras-energia-eletrica';
export const LICENSE_URL = 'https://opendatacommons.org/licenses/odbl/1-0/';
export const FILTERS = Object.freeze({
  DscBaseTarifaria: 'Tarifa de Aplicação',
  DscSubGrupo: 'B1',
  DscModalidadeTarifaria: 'Convencional',
  DscClasse: 'Residencial',
  DscSubClasse: 'Residencial',
  DscDetalhe: 'Não se aplica'
});
const MAX_PAGE_SIZE = 1000;
const MIN_DISTRIBUTORS = 80;

export function parseBrazilNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : NaN;
  if (typeof value !== 'string' || !value.trim()) return NaN;
  const normalized = value.trim().replace(/\s/g, '').replace(/\.(?=\d{3}(?:\D|$))/g, '').replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : NaN;
}
export function parseDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(value + 'T00:00:00Z');
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value ? value : null;
}
function rehNumber(value) {
  const text = String(value ?? '');
  const firstNumber = text.match(/\d[\d.]*/);
  const year = text.match(/\b20\d{2}\b/);
  const number = firstNumber ? Number(firstNumber[0].replace(/\./g, '')) : 0;
  return (year ? Number(year[0]) : 0) * 1_000_000_000 + number;
}
function isNoPost(value) {
  const v = String(value ?? '').trim().toLocaleLowerCase('pt-BR');
  return v === '' || v === 'não se aplica' || v === 'nao se aplica';
}
function isMwh(value) {
  const v = String(value ?? '').replace(/\s/g, '').toLocaleLowerCase('pt-BR');
  return v === 'r$/mwh' || v === 'r$/mwh.' || v === 'r$/megawatt-hora';
}
export function normalizeRecord(row, today) {
  if (!row || typeof row !== 'object') return null;
  if (!isNoPost(row.NomPostoTarifario) || !isMwh(row.DscUnidadeTerciaria)) return null;
  const cnpj = String(row.NumCNPJDistribuidora ?? '').replace(/\D/g, '');
  const sigla = String(row.SigAgente ?? '').trim();
  const start = parseDate(row.DatInicioVigencia);
  const end = parseDate(row.DatFimVigencia);
  if (!/^\d{14}$/.test(cnpj) || !start || start > today || (row.DatFimVigencia && !end) || (end && end < today)) return null;
  const tusdMwh = parseBrazilNumber(row.VlrTUSD);
  const teMwh = parseBrazilNumber(row.VlrTE);
  if (![tusdMwh, teMwh].every(Number.isFinite) || tusdMwh < 0 || teMwh < 0 || tusdMwh > 3000 || teMwh > 3000) return null;
  const totalMwh = tusdMwh + teMwh;
  const rateKwh = totalMwh / 1000;
  if (totalMwh < 100 || totalMwh > 4000 || rateKwh < 0.1 || rateKwh > 4) return null;
  return {
    id: cnpj,
    sigla: sigla && sigla.toLocaleLowerCase('pt-BR') !== 'não informado' ? sigla : '',
    cnpj,
    startDate: start,
    endDate: end,
    reh: String(row.DscREH ?? ''),
    tusdMwh,
    teMwh,
    rateKwh: Number(rateKwh.toFixed(5))
  };
}
function sameRate(a, b) {
  return a.tusdMwh === b.tusdMwh && a.teMwh === b.teMwh;
}
export function selectCurrentTariffs(rows, today, previousIds = []) {
  const normalized = rows.map(row => normalizeRecord(row, today)).filter(Boolean);
  const byDistributor = new Map();
  for (const item of normalized) {
    const key = item.id + ':' + item.startDate;
    const existing = byDistributor.get(key);
    if (!existing) { byDistributor.set(key, item); continue; }
    if (sameRate(existing, item)) continue;
    if (rehNumber(item.reh) === rehNumber(existing.reh)) {
      throw new Error('Conflito de tarifas para o mesmo CNPJ e início de vigência: ' + item.id);
    }
    if (rehNumber(item.reh) > rehNumber(existing.reh)) byDistributor.set(key, item);
  }
  const latest = new Map();
  for (const item of byDistributor.values()) {
    const current = latest.get(item.id);
    if (!current || item.startDate > current.startDate ||
      (item.startDate === current.startDate && rehNumber(item.reh) > rehNumber(current.reh))) latest.set(item.id, item);
  }
  const result = [...latest.values()].sort((a, b) =>
    (a.sigla || 'ZZZ').localeCompare(b.sigla || 'ZZZ', 'pt-BR') || a.cnpj.localeCompare(b.cnpj)
  );
  if (result.length < MIN_DISTRIBUTORS) throw new Error('Apenas ' + result.length + ' distribuidoras passaram pelos filtros; lote recusado por segurança.');
  const present = new Set(result.map(item => item.id));
  const missing = previousIds.filter(id => !present.has(id));
  if (missing.length) throw new Error('Distribuidoras anteriormente publicadas desapareceram da vigência atual (' + missing.length + '). Revisão manual necessária; lote não será publicado.');
  return result;
}
async function requestPage(offset, fetchImpl) {
  const url = new URL('https://dadosabertos.aneel.gov.br/api/3/action/datastore_search');
  url.searchParams.set('resource_id', RESOURCE_ID);
  url.searchParams.set('limit', String(MAX_PAGE_SIZE));
  url.searchParams.set('offset', String(offset));
  url.searchParams.set('filters', JSON.stringify(FILTERS));
  let lastError;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetchImpl(url, { headers: { accept: 'application/json' } });
      if (!response.ok) throw new Error('ANEEL respondeu HTTP ' + response.status);
      const payload = await response.json();
      if (payload.success !== true || !payload.result || !Array.isArray(payload.result.records)) throw new Error('Resposta da API ANEEL fora do formato esperado.');
      return payload.result;
    } catch (error) {
      lastError = error;
      if (attempt < 2) await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
    }
  }
  throw lastError;
}
export async function fetchAllFilteredRecords(fetchImpl = fetch) {
  const all = [];
  let offset = 0;
  let expectedTotal = null;
  while (expectedTotal === null || offset < expectedTotal) {
    const page = await requestPage(offset, fetchImpl);
    if (expectedTotal === null) expectedTotal = page.total;
    if (!Number.isInteger(expectedTotal) || expectedTotal < 1) throw new Error('A API não informou um total válido.');
    if (!page.records.length) throw new Error('A paginação terminou antes do total informado pela ANEEL.');
    all.push(...page.records);
    offset += page.records.length;
    if (offset > expectedTotal) throw new Error('A API retornou mais registros do que o total anunciado.');
  }
  if (all.length !== expectedTotal) throw new Error('Lote incompleto: recebidos ' + all.length + ' de ' + expectedTotal + ' registros.');
  return { records: all, sourceRecordCount: expectedTotal };
}
export function buildDataset(rows, { today, generatedAt, previousIds = [], sourceRecordCount }) {
  const tariffs = selectCurrentTariffs(rows, today, previousIds);
  return {
    schemaVersion: 1, generatedAt, referenceDate: today, sourceRecordCount,
    distributorCount: tariffs.length, source: SOURCE_URL, license: 'ODbL-1.0',
    licenseUrl: LICENSE_URL,
    attribution: 'Fonte: ANEEL — Tarifas de aplicação das distribuidoras de energia elétrica. Base derivada sob ODbL 1.0.',
    notice: 'Tarifa homologada de referência (TE + TUSD), sem tributos, bandeiras tarifárias, iluminação pública ou outros itens da fatura. Não representa o valor final cobrado.',
    tariffs
  };
}
async function main() {
  const here = dirname(fileURLToPath(import.meta.url));
  const output = resolve(here, '../data/tarifas.json');
  let previousIds = [];
  try {
    const previous = JSON.parse(await readFile(output, 'utf8'));
    previousIds = Array.isArray(previous.tariffs) ? previous.tariffs.map(item => item.id) : [];
  } catch {}
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
  const { records, sourceRecordCount } = await fetchAllFilteredRecords();
  const dataset = buildDataset(records, { today, generatedAt: new Date().toISOString(), previousIds, sourceRecordCount });
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, JSON.stringify(dataset, null, 2) + '\n', 'utf8');
  console.log('Tarifas ANEEL atualizadas:', dataset.distributorCount, 'distribuidoras; data-base', today);
}
const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : '';
if (import.meta.url === invokedPath) main().catch(error => {
  console.error('Falha ao atualizar tarifas; arquivo anterior preservado:', error.message);
  process.exitCode = 1;
});
