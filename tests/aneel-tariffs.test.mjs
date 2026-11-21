import test from 'node:test';
import assert from 'node:assert/strict';
import { FILTERS, parseBrazilNumber, parseDate, normalizeRecord, selectCurrentTariffs, buildDataset } from '../scripts/update-aneel-tariffs.mjs';
const today = '2026-11-20';
function row(overrides = {}) {
  return {
    DscBaseTarifaria:'Tarifa de Aplicação', DscSubGrupo:'B1',
    DscModalidadeTarifaria:'Convencional', DscClasse:'Residencial',
    DscSubClasse:'Residencial', DscDetalhe:'Não se aplica',
    NomPostoTarifario:'Não se aplica', DscUnidadeTerciaria:'R$/MWh',
    NumCNPJDistribuidora:'12345678000190', SigAgente:'TESTE',
    DatInicioVigencia:'2026-01-01', DatFimVigencia:'2026-12-31',
    DscREH:'REH 123', VlrTUSD:'500,00', VlrTE:'300,00', ...overrides
  };
}
function manyRows(count = 80) {
  return Array.from({length:count},(_,i)=>row({
    NumCNPJDistribuidora:String(10000000000000+i), SigAgente:'D'+String(i).padStart(3,'0')
  }));
}
test('filters only conventional B1 residential application tariff with no special detail',()=>{
  assert.deepEqual(FILTERS,{DscBaseTarifaria:'Tarifa de Aplicação',DscSubGrupo:'B1',DscModalidadeTarifaria:'Convencional',DscClasse:'Residencial',DscSubClasse:'Residencial',DscDetalhe:'Não se aplica'});
});
test('parses Brazilian numeric values accurately',()=>{
  assert.equal(parseBrazilNumber('1.234,56'),1234.56);
  assert.equal(parseBrazilNumber('500,00'),500);
  assert.equal(parseBrazilNumber('500.25'),500.25);
  assert.ok(Number.isNaN(parseBrazilNumber('')));
});
test('validates ISO calendar dates',()=>{
  assert.equal(parseDate('2026-02-28'),'2026-02-28');
  assert.equal(parseDate('2026-02-30'),null);
  assert.equal(parseDate('20/11/2026'),null);
});
test('converts TE plus TUSD from R$/MWh to R$/kWh',()=>{
  assert.equal(normalizeRecord(row(),today).rateKwh,0.8);
});
test('rejects expired, SCEE, time-of-use and non-energy-unit records',()=>{
  assert.equal(normalizeRecord(row({DatFimVigencia:'2026-11-19'}),today),null);
  assert.equal(normalizeRecord(row({DscDetalhe:'SCEE'}),today),null);
  assert.equal(normalizeRecord(row({NomPostoTarifario:'Ponta'}),today),null);
  assert.equal(normalizeRecord(row({DscUnidadeTerciaria:'R$/kW'}),today),null);
});
test('uses the latest homologation for overlapping records',()=>{
  const rows=manyRows(); rows.push({...rows[0],DscREH:'REH 999',VlrTUSD:'600,00'});
  const selected=selectCurrentTariffs(rows,today);
  assert.equal(selected.length,80);
  assert.equal(selected.find(item=>item.id==='12345678000190').tusdMwh,600);
});
test('rejects a previously published distributor disappearing silently',()=>{
  assert.throws(()=>selectCurrentTariffs(manyRows(),today,['99999999000199']),/desapareceram/);
});
test('rejects conflicting duplicate without a later homologation number',()=>{
  const rows=manyRows(); rows.push({...rows[0],VlrTUSD:'700,00'});
  assert.throws(()=>selectCurrentTariffs(rows,today),/Conflito/);
});
test('dataset includes attribution, ODbL and tariff caveat',()=>{
  const data=buildDataset(manyRows(),{today,generatedAt:'2026-11-20T12:00:00.000Z',sourceRecordCount:80});
  assert.equal(data.distributorCount,80);
  assert.match(data.attribution,/ANEEL/);
  assert.equal(data.license,'ODbL-1.0');
  assert.match(data.notice,/sem tributos/);
});
