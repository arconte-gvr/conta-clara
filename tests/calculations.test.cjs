const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const assert = require('node:assert/strict');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(scriptMatch, 'index.html deve conter o script principal');
const script = scriptMatch[1];

test('script da aplicação tem sintaxe JavaScript válida', () => {
  assert.doesNotThrow(() => new vm.Script(script));
});

const start = script.indexOf('// BEGIN pure calculations');
const end = script.indexOf('// END pure calculations');
assert.ok(start >= 0 && end > start, 'bloco de cálculos puros deve existir');
const pureSource = script.slice(start, end + '// END pure calculations'.length);
const sandbox = { module: { exports: {} } };
vm.runInNewContext(
  pureSource + '\nmodule.exports = { normalizeDays, normalizeTariff, deviceMonthlyKwh, monthlySavings, csvCell };',
  sandbox
);
const { normalizeDays, normalizeTariff, deviceMonthlyKwh, monthlySavings, csvCell } = sandbox.module.exports;

test('normaliza dias vazios, inválidos e fora dos limites', () => {
  assert.equal(normalizeDays(''), 30);
  assert.equal(normalizeDays('abc'), 30);
  assert.equal(normalizeDays('0'), 1);
  assert.equal(normalizeDays('32'), 31);
  assert.equal(normalizeDays('14.6'), 15);
  assert.equal(normalizeDays('10'), 10);
});

test('normaliza tarifa sem aceitar valores negativos ou não finitos', () => {
  assert.equal(normalizeTariff('0.90'), 0.9);
  assert.equal(normalizeTariff('-2'), 0);
  assert.equal(normalizeTariff(''), 0);
  assert.equal(normalizeTariff('abc'), 0);
});

test('calcula consumo mensal com potência, horas, dias e quantidade', () => {
  assert.equal(deviceMonthlyKwh({ watts: 100, hours: 8, qty: 2 }, 30), 48);
  assert.equal(deviceMonthlyKwh({ watts: 1000, hours: 24, qty: 1 }, 31), 744);
  assert.equal(deviceMonthlyKwh({ watts: 60, hours: 24, qty: 1 }, 30), 43.2);
});

test('rejeita dados inválidos e resultados não finitos no consumo', () => {
  assert.equal(deviceMonthlyKwh({ watts: 100, hours: 25, qty: 1 }, 30), 0);
  assert.equal(deviceMonthlyKwh({ watts: -1, hours: 8, qty: 1 }, 30), 0);
  assert.equal(deviceMonthlyKwh({ watts: 100, hours: 8, qty: 0 }, 30), 0);
  assert.equal(deviceMonthlyKwh({ watts: Infinity, hours: 8, qty: 1 }, 30), 0);
  assert.equal(deviceMonthlyKwh({ watts: 1e308, hours: 24, qty: 100 }, 31), 0);
});

test('calcula economia mensal e representa corretamente a ausência de economia', () => {
  assert.ok(Math.abs(monthlySavings(150, 90, 8, 30, 0.9) - 12.96) < 1e-10);
  assert.ok(Math.abs(monthlySavings(90, 150, 8, 30, 0.9) + 12.96) < 1e-10);
  assert.equal(monthlySavings(100, 90, 25, 30, 0.9), 0);
  assert.equal(monthlySavings(100, 90, 8, 30, -1), 0);
});

test('protege células CSV contra fórmulas após espaços e controles', () => {
  assert.equal(csvCell('Ventilador'), '"Ventilador"');
  assert.equal(csvCell('=1+1'), '"\'=1+1"');
  assert.equal(csvCell('   @SUM(A1:A2)'), '"\'   @SUM(A1:A2)"');
  assert.equal(csvCell('\t-2'), '"\\'\\t-2"');
});

test('escapa aspas e mantém separadores dentro de células CSV', () => {
  assert.equal(csvCell('Ar-condicionado; sala'), '"Ar-condicionado; sala"');
  assert.equal(csvCell('Marca "A"'), '"Marca ""A"""');
});
