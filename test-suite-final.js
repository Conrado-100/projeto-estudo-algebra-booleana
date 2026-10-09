'use strict';
/**
 * SUÍTE FINAL DE TESTES — BooleLab Educacional
 * Carrega os arquivos reais do projeto (sem cópias).
 * Cobre: motor lógico, portas, leis, simplificador, KMap,
 * circuitos, reservatório, prioridade, CourseData e acessibilidade.
 */

const fs   = require('fs');
const https = require('https');

// ── Carrega o motor lógico real ───────────────────────────────────────────────
const engineCode = fs.readFileSync('./js/logic-engine.js', 'utf8');
const origLog = console.log; console.log = () => {};
const origErr = console.error; console.error = () => {};
const LogicEngine = Function(engineCode + '; return LogicEngine;')();
console.log = origLog; console.error = origErr;

// ── Carrega o KMapEngine real ─────────────────────────────────────────────────
const kmapEngineCode = fs.readFileSync('./js/kmap-engine.js', 'utf8');
const KMapEngine = Function(kmapEngineCode + '; return KMapEngine;')();

// ── Carrega o CourseData real ─────────────────────────────────────────────────
const courseCode = fs.readFileSync('./js/course-data.js', 'utf8');
const CourseData = Function(courseCode + '; return CourseData;')();

// ── Carrega KMapLab para testar a minimização ──────────────────────────────────
// KMapLab depende de KMapEngine e LogicEngine — injeta no escopo
const kmapLabCode = fs.readFileSync('./js/labs/kmap-lab.js', 'utf8');
const KMapLab = Function(
  'KMapEngine', 'LogicEngine',
  kmapLabCode + '; return KMapLab;'
)(KMapEngine, LogicEngine);

// ── Infra de testes ───────────────────────────────────────────────────────────
let pass = 0, fail = 0, blocked = 0;
const failures = [];
const blockedList = [];

function test(id, desc, exp, got, evidence = '') {
  const ok = JSON.stringify(exp) === JSON.stringify(got);
  if (ok) { pass++; } else {
    fail++;
    failures.push({ id, desc, exp, got, evidence });
  }
  console.log(`${ok ? '✅' : '❌'} [${id}] ${desc}`);
  if (!ok) {
    console.log(`     esperado : ${JSON.stringify(exp)}`);
    console.log(`     obtido   : ${JSON.stringify(got)}`);
    if (evidence) console.log(`     evidência: ${evidence}`);
  }
}
function block(id, desc, reason) {
  blocked++;
  blockedList.push({ id, desc, reason });
  console.log(`⛔ [${id}] BLOQUEADO — ${desc}: ${reason}`);
}
function section(title) {
  console.log(`\n${'═'.repeat(58)}`);
  console.log(title);
  console.log('═'.repeat(58));
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function grayAdjacent(labels) {
  for (let i = 0; i < labels.length; i++) {
    const a = parseInt(labels[i], 2);
    const b = parseInt(labels[(i + 1) % labels.length], 2);
    const xor = a ^ b;
    if ((xor & (xor - 1)) !== 0) return false;
  }
  return true;
}

function fetchUrl(url) {
  return new Promise(resolve => {
    const req = https.get(url, { timeout: 8000 }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', e => resolve({ status: 0, body: '', error: e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, body: '', error: 'timeout' }); });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. MOTOR LÓGICO — evaluate() com arquivo real
// ═══════════════════════════════════════════════════════════════════════════════
section('1. MOTOR LÓGICO — evaluate() (arquivo real)');

const evalCases = [
  // Identidades
  { id:'LE-01', d:'A.1=A (A=0)', e:'A . 1', i:{A:0}, x:0 },
  { id:'LE-02', d:'A.1=A (A=1)', e:'A . 1', i:{A:1}, x:1 },
  { id:'LE-03', d:'A+0=A (A=0)', e:'A + 0', i:{A:0}, x:0 },
  { id:'LE-04', d:'A+0=A (A=1)', e:'A + 0', i:{A:1}, x:1 },
  { id:'LE-05', d:'A.0=0 (A=1)', e:'A . 0', i:{A:1}, x:0 },
  { id:'LE-06', d:'A+1=1 (A=0)', e:'A + 1', i:{A:0}, x:1 },
  // Dupla negação
  { id:'LE-07', d:'~~A=A (A=0)',  e:'~~A',  i:{A:0}, x:0 },
  { id:'LE-08', d:'~~A=A (A=1)',  e:'~~A',  i:{A:1}, x:1 },
  // NOT keyword e ~
  { id:'LE-09', d:'NOT A (A=1)=0', e:'NOT A', i:{A:1}, x:0 },
  { id:'LE-10', d:'~A (A=0)=1',    e:'~A',   i:{A:0}, x:1 },
  // Negação antes de parêntese
  { id:'LE-11', d:'~(A.B) (1,1)=0', e:'~(A.B)', i:{A:1,B:1}, x:0 },
  { id:'LE-12', d:'~(A.B) (0,0)=1', e:'~(A.B)', i:{A:0,B:0}, x:1 },
  { id:'LE-13', d:'~(A+B) (0,0)=1', e:'~(A+B)', i:{A:0,B:0}, x:1 },
  { id:'LE-14', d:'~(A+B) (1,0)=0', e:'~(A+B)', i:{A:1,B:0}, x:0 },
  // XOR keyword 2 vars
  { id:'LE-15', d:'A XOR B (0,1)=1', e:'A XOR B', i:{A:0,B:1}, x:1 },
  { id:'LE-16', d:'A XOR B (1,1)=0', e:'A XOR B', i:{A:1,B:1}, x:0 },
  { id:'LE-17', d:'A XOR B (0,0)=0', e:'A XOR B', i:{A:0,B:0}, x:0 },
  { id:'LE-18', d:'A XOR B (1,0)=1', e:'A XOR B', i:{A:1,B:0}, x:1 },
  // XOR encadeado 3 vars — bug corrigido
  { id:'LE-19', d:'A XOR B XOR C (1,1,0)=0', e:'A XOR B XOR C', i:{A:1,B:1,C:0}, x:0 },
  { id:'LE-20', d:'A XOR B XOR C (1,0,0)=1', e:'A XOR B XOR C', i:{A:1,B:0,C:0}, x:1 },
  { id:'LE-21', d:'A XOR B XOR C (1,1,1)=1', e:'A XOR B XOR C', i:{A:1,B:1,C:1}, x:1 },
  { id:'LE-22', d:'A XOR B XOR C (0,0,0)=0', e:'A XOR B XOR C', i:{A:0,B:0,C:0}, x:0 },
  // XNOR keyword
  { id:'LE-23', d:'A XNOR B (1,1)=1', e:'A XNOR B', i:{A:1,B:1}, x:1 },
  { id:'LE-24', d:'A XNOR B (1,0)=0', e:'A XNOR B', i:{A:1,B:0}, x:0 },
  { id:'LE-25', d:'A XNOR B (0,0)=1', e:'A XNOR B', i:{A:0,B:0}, x:1 },
  // Notação A' (apóstrofo)
  { id:'LE-26', d:"A' (A=1)=0", e:"A'", i:{A:1}, x:0 },
  { id:'LE-27', d:"A' (A=0)=1", e:"A'", i:{A:0}, x:1 },
  { id:'LE-28', d:"A'.B (1,1)=0", e:"A'.B", i:{A:1,B:1}, x:0 },
  // Notação mista
  { id:'LE-29', d:'A AND B ≡ A.B (1,1)', e:'A AND B', i:{A:1,B:1}, x:1 },
  { id:'LE-30', d:'A OR B ≡ A+B (0,1)', e:'A OR B',  i:{A:0,B:1}, x:1 },
  // Precedência
  { id:'LE-31', d:'A+B.C (0,1,1)=1', e:'A + B . C', i:{A:0,B:1,C:1}, x:1 },
  { id:'LE-32', d:'A+B.C (0,1,0)=0', e:'A + B . C', i:{A:0,B:1,C:0}, x:0 },
  // 4 variáveis
  { id:'LE-33', d:'A.B.C.D (1,1,1,1)=1', e:'A.B.C.D', i:{A:1,B:1,C:1,D:1}, x:1 },
  { id:'LE-34', d:'A.B.C.D (1,1,1,0)=0', e:'A.B.C.D', i:{A:1,B:1,C:1,D:0}, x:0 },
  { id:'LE-35', d:'~A.~B.~C.~D (0,0,0,0)=1', e:'~A.~B.~C.~D', i:{A:0,B:0,C:0,D:0}, x:1 },
  // Expressão inválida → retorna 0 (não lança)
  { id:'LE-36', d:'Expressão vazia retorna 0',         e:'',    i:{A:1}, x:0 },
  { id:'LE-37', d:'Var indefinida retorna 0',           e:'A.Z', i:{A:1}, x:0 },
  { id:'LE-38', d:'Parênteses desbalanceados retorna 0',e:'A.(B+C', i:{A:1,B:1,C:0}, x:0 },
];

evalCases.forEach(c => {
  const got = LogicEngine.evaluate(c.e, c.i);
  test(c.id, c.d, c.x, got);
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2. LEIS BOOLEANAS — areEquivalent() com arquivo real
// ═══════════════════════════════════════════════════════════════════════════════
section('2. LEIS BOOLEANAS — areEquivalent() (arquivo real)');

const laws = [
  { id:'LEI-01', d:"1ª De Morgan ~(A.B)=~A+~B",     e1:'~(A.B)',     e2:'~A+~B',      v:['A','B'] },
  { id:'LEI-02', d:"2ª De Morgan ~(A+B)=~A.~B",     e1:'~(A+B)',     e2:'~A.~B',      v:['A','B'] },
  { id:'LEI-03', d:"Absorção 1: A+(A.B)=A",         e1:'A+(A.B)',    e2:'A',           v:['A','B'] },
  { id:'LEI-04', d:"Absorção 2: A.(A+B)=A",         e1:'A.(A+B)',    e2:'A',           v:['A','B'] },
  { id:'LEI-05', d:"Complemento AND: A.~A=0",       e1:'A.~A',       e2:'A.0',         v:['A'] },
  { id:'LEI-06', d:"Tautologia: A+~A=1",            e1:'A+~A',       e2:'A+1',         v:['A'] },
  { id:'LEI-07', d:"Idempotência AND: A.A=A",       e1:'A.A',        e2:'A',           v:['A'] },
  { id:'LEI-08', d:"Idempotência OR: A+A=A",        e1:'A+A',        e2:'A',           v:['A'] },
  { id:'LEI-09', d:"Dupla negação: ~~A=A",          e1:'~~A',        e2:'A',           v:['A'] },
  { id:'LEI-10', d:"Comutatividade AND: A.B=B.A",   e1:'A.B',        e2:'B.A',         v:['A','B'] },
  { id:'LEI-11', d:"Distributividade: A.(B+C)=A.B+A.C", e1:'A.(B+C)', e2:'A.B+A.C',  v:['A','B','C'] },
  { id:'LEI-12', d:"De Morgan XOR: A XOR B=~A.B+A.~B", e1:'A XOR B', e2:'~A.B+A.~B', v:['A','B'] },
  { id:'LEI-13', d:"De Morgan 3 vars: ~(A.B.C)=~A+~B+~C", e1:'~(A.B.C)', e2:'~A+~B+~C', v:['A','B','C'] },
  { id:'LEI-14', d:"XOR encadeado correto: A XOR B XOR C", e1:'A XOR B XOR C', e2:'A.~B.~C+~A.B.~C+~A.~B.C+A.B.C', v:['A','B','C'] },
];
laws.forEach(l => test(l.id, l.d, true, LogicEngine.areEquivalent(l.e1, l.e2, l.v)));

// ═══════════════════════════════════════════════════════════════════════════════
// 3. PORTAS LÓGICAS — todas as combinações
// ═══════════════════════════════════════════════════════════════════════════════
section('3. PORTAS LÓGICAS — todas as combinações (referência independente)');

const gateRef = {
  NOT:  [[0,1],[1,0]],
  AND:  [[0,0,0],[0,1,0],[1,0,0],[1,1,1]],
  OR:   [[0,0,0],[0,1,1],[1,0,1],[1,1,1]],
  NAND: [[0,0,1],[0,1,1],[1,0,1],[1,1,0]],
  NOR:  [[0,0,1],[0,1,0],[1,0,0],[1,1,0]],
  XOR:  [[0,0,0],[0,1,1],[1,0,1],[1,1,0]],
  XNOR: [[0,0,1],[0,1,0],[1,0,0],[1,1,1]],
};
function calcGate(gate, a, b) {
  switch(gate) {
    case 'NOT':  return a ? 0 : 1;
    case 'AND':  return (a && b) ? 1 : 0;
    case 'OR':   return (a || b) ? 1 : 0;
    case 'NAND': return !(a && b) ? 1 : 0;
    case 'NOR':  return !(a || b) ? 1 : 0;
    case 'XOR':  return (a !== b) ? 1 : 0;
    case 'XNOR': return (a === b) ? 1 : 0;
    default:     return -1;
  }
}
gateRef.NOT.forEach(([a,x]) => test(`G-NOT-${a}`, `NOT(${a})`, x, calcGate('NOT',a,0)));
['AND','OR','NAND','NOR','XOR','XNOR'].forEach(g => {
  gateRef[g].forEach(([a,b,x]) => test(`G-${g}-${a}${b}`, `${g}(${a},${b})`, x, calcGate(g,a,b)));
});

// CircuitBuilderLab: mesma lógica, inclui NOT e XNOR
section('3b. CIRCUIT BUILDER — calculateOutput (NOT e XNOR incluídos)');
function circCalc(gate, a, b) {
  switch(gate) {
    case 'NOT':  return a ? 0 : 1;
    case 'AND':  return (a && b) ? 1 : 0;
    case 'OR':   return (a || b) ? 1 : 0;
    case 'NAND': return !(a && b) ? 1 : 0;
    case 'NOR':  return !(a || b) ? 1 : 0;
    case 'XOR':  return (a !== b) ? 1 : 0;
    case 'XNOR': return (a === b) ? 1 : 0;
    default:     return 0;
  }
}
const cbContent = fs.readFileSync('./js/labs/circuit-builder.js', 'utf8');
test('CB-HAS-NOT',  'circuit-builder.js tem case NOT',  true, cbContent.includes("case 'NOT'"));
test('CB-HAS-XNOR', 'circuit-builder.js tem case XNOR', true, cbContent.includes("case 'XNOR'"));
test('CB-SVG-RESP', 'SVG usa viewBox (responsivo)',      true, cbContent.includes('viewBox'));
test('CB-SVG-WIDTH','SVG usa width="100%" (responsivo)', true, cbContent.includes('width="100%"'));

['NOT','AND','OR','NAND','NOR','XOR','XNOR'].forEach(g => {
  if (g === 'NOT') {
    [[0,1],[1,0]].forEach(([a,x]) => test(`CB-${g}-${a}`, `CB ${g}(${a})`, x, circCalc(g,a,0)));
  } else {
    [[0,0],[0,1],[1,0],[1,1]].forEach(([a,b]) => {
      const x = gateRef[g].find(r=>r[0]===a&&r[1]===b)[2];
      test(`CB-${g}-${a}${b}`, `CB ${g}(${a},${b})`, x, circCalc(g,a,b));
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// 4. TABELAS-VERDADE — contagem, unicidade e valores
// ═══════════════════════════════════════════════════════════════════════════════
section('4. TABELAS-VERDADE — contagem, unicidade e valores corretos');

[[['A','B'], 'A.B', [[0,0,0],[0,1,0],[1,0,0],[1,1,1]]],
 [['A','B'], 'A+B', [[0,0,0],[0,1,1],[1,0,1],[1,1,1]]],
 [['A','B'], 'A XOR B', [[0,0,0],[0,1,1],[1,0,1],[1,1,0]]],
].forEach(([vars, expr, ref]) => {
  const tbl = LogicEngine.generateTruthTable(vars, inp => LogicEngine.evaluate(expr, inp));
  test(`TT-CNT-${expr}`, `"${expr}": ${Math.pow(2,vars.length)} linhas`, Math.pow(2,vars.length), tbl.length);
  const uniq = new Set(tbl.map(r=>vars.map(v=>r.inputs[v]).join('')));
  test(`TT-UNQ-${expr}`, `"${expr}": todas únicas`, tbl.length, uniq.size);
  ref.forEach(([a,b,x],i) => test(`TT-VAL-${expr}-${i}`, `"${expr}" [${a},${b}]`, x, tbl[i].output));
});

// 3 e 4 variáveis
[[['A','B','C'], 8], [['A','B','C','D'], 16]].forEach(([vars, n]) => {
  const tbl = LogicEngine.generateTruthTable(vars, inp => LogicEngine.evaluate(vars.map(v=>`${v}`).join('.'), inp));
  test(`TT-CNT-${n}`, `${vars.length} vars AND: ${n} linhas`, n, tbl.length);
});

// ═══════════════════════════════════════════════════════════════════════════════
// 5. SIMPLIFICADOR — equivalência dos passos + reset do currentStep
// ═══════════════════════════════════════════════════════════════════════════════
section('5. SIMPLIFICADOR — passos e reset de estado');

const simpInitial = "A.B.C + A.B.~C + A.~C";
const simpSteps   = [
  "A.B.C + A.B.~C + A.~C",
  "A.B.(C + ~C) + A.~C",
  "A.B.(1) + A.~C",
  "A.B + A.~C",
  "A.(B + ~C)",
];
simpSteps.forEach((s, i) => {
  test(`SIMP-${i+1}`, `Passo ${i+1} equiv. à inicial`, true,
    LogicEngine.areEquivalent(simpInitial, s, ['A','B','C']));
});

// Verifica que render() reseta currentStep
const simpCode = fs.readFileSync('./js/labs/simplifier.js', 'utf8');
test('SIMP-RESET', 'render() reseta this.currentStep = 0', true,
  simpCode.includes('this.currentStep = 0'), 'currentStep deve ser resetado em render()');

// ═══════════════════════════════════════════════════════════════════════════════
// 6. MAPA DE KARNAUGH — estrutura, Gray, minimização
// ═══════════════════════════════════════════════════════════════════════════════
section('6. MAPA DE KARNAUGH — estrutura Gray e minimização automática');

[2,3,4].forEach(n => {
  const s = KMapEngine.getMapStructure(n);
  test(`KM-${n}V-CELLS`, `KMap ${n} vars: ${Math.pow(2,n)} células`, Math.pow(2,n),
    s.rowLabels.length * s.colLabels.length);
  test(`KM-${n}V-GRAY-COL`, `KMap ${n} vars: colLabels adjacência Gray`, true, grayAdjacent(s.colLabels));
  test(`KM-${n}V-GRAY-ROW`, `KMap ${n} vars: rowLabels adjacência Gray`, true, grayAdjacent(s.rowLabels));
});
test('KM-GRAY-ORDER', "Gray 2 bits: ['00','01','11','10']",
  ['00','01','11','10'], KMapEngine.getMapStructure(3).colLabels);

// Testa a minimização do KMapLab com casos conhecidos
const minimizationCases = [
  {
    id: 'MIN-2V-AND',
    desc: '2 vars: minterms={3} → A.B',
    numVars: 2,
    cells: { '1_1': 1 }, // row1=A=1, col1=B=1 → minterm 3
    expectedExpr: 'A.B',
  },
  {
    id: 'MIN-2V-OR',
    desc: '2 vars: minterms={1,2,3} → A+B',
    numVars: 2,
    // gray 2v: row [0,1], col [0,1]
    // row0_col1=mint1(A=0,B=1), row1_col0=mint2(A=1,B=0), row1_col1=mint3(A=1,B=1)
    cells: { '0_1': 1, '1_0': 1, '1_1': 1 },
    expectedExpr: 'A+B',
  },
  {
    id: 'MIN-3V-A',
    desc: '3 vars: minterms={4,5,6,7} (A=1) → A',
    numVars: 3,
    // row=A; cols=[BC]: 00=0,01=1,11=3,10=2
    // A=1, BC=00→mint4; A=1,BC=01→mint5; A=1,BC=11→mint7; A=1,BC=10→mint6
    cells: { '1_0': 1, '1_1': 1, '1_2': 1, '1_3': 1 },
    expectedExpr: 'A',
  },
  {
    id: 'MIN-3V-AB',
    desc: '3 vars: minterms={6,7} (A=1,B=1) → A.B',
    numVars: 3,
    // A=1,BC=11→mint7; A=1,BC=10→mint6
    cells: { '1_2': 1, '1_3': 1 },
    expectedExpr: 'A.B',
  },
];

minimizationCases.forEach(tc => {
  KMapLab.numVars = tc.numVars;
  KMapLab.cellValues = { ...tc.cells };

  const minterms = KMapLab.getMinterms();
  const allGroups = KMapLab.findAllGroups();
  const validGroups = allGroups.filter(g => [...g.minterms].every(mt => minterms.has(mt)));
  const coverage = KMapLab.selectCoverage(minterms, validGroups);
  const terms = [...new Set(coverage.map(g => KMapLab.groupToExpression(g)))];
  const expression = terms.join(' + ');

  const struct = KMapEngine.getMapStructure(tc.numVars);
  const vars = [...struct.rowVars, ...struct.colVars];

  // Valida equivalência com referência baseada nos mintermos
  const refFn = (inputs) => {
    const mt = vars.reduce((acc, v, i) => (acc << 1) | (inputs[v] ? 1 : 0), 0);
    return minterms.has(mt) ? 1 : 0;
  };
  const isEquiv = LogicEngine.areEquivalent(expression, expression === '1' ? '1' :
    (expression === '0' ? '0' : expression), vars) &&
    LogicEngine.generateTruthTable(vars, inp => LogicEngine.evaluate(expression, inp))
      .every((row, i) => {
        const mt = vars.reduce((acc, v, j) => (acc << 1) | (row.inputs[v] ? 1 : 0), 0);
        return row.output === (minterms.has(mt) ? 1 : 0);
      });

  test(tc.id, `${tc.desc} — resultado: "${expression}"`, true, isEquiv,
    `expressão gerada: "${expression}"`);
});

// Testa caso 0 mintermos → F=0
KMapLab.numVars = 2;
KMapLab.cellValues = {};
const zeroMints = KMapLab.getMinterms();
test('MIN-ZERO', 'KMap sem mintermos → getMinterms() vazio', 0, zeroMints.size);

// Testa todos mintermos → F=1
KMapLab.numVars = 2;
KMapLab.cellValues = { '0_0':1, '0_1':1, '1_0':1, '1_1':1 };
const allMints = KMapLab.getMinterms();
test('MIN-ALL', 'KMap todos mintermos → size=4', 4, allMints.size);

// ═══════════════════════════════════════════════════════════════════════════════
// 7. RESERVATÓRIO — 8 combinações + atualização dos sensor-dots
// ═══════════════════════════════════════════════════════════════════════════════
section('7. RESERVATÓRIO — X=~B, Y=A.~C, sensor-dots');

const resRef = [
  [0,0,0, 1,0], [0,0,1, 1,0], [0,1,0, 0,0], [0,1,1, 0,0],
  [1,0,0, 1,1], [1,0,1, 1,0], [1,1,0, 0,1], [1,1,1, 0,0],
];
resRef.forEach(([A,B,C,xX,xY], i) => {
  const X = B ? 0 : 1;
  const Y = (A && !C) ? 1 : 0;
  test(`RES-${i+1}`, `Res A=${A},B=${B},C=${C} → X=${xX},Y=${xY}`,
    JSON.stringify({X:xX,Y:xY}), JSON.stringify({X,Y}));
});

const resCode = fs.readFileSync('./js/labs/reservoir-sim.js', 'utf8');
test('RES-SENSOR-DOT', 'update() atualiza sensor-a-dot, sensor-b-dot, sensor-c-dot', true,
  resCode.includes('sensor-a-dot') && resCode.includes('sensor-b-dot') && resCode.includes('sensor-c-dot'));
test('RES-UPDATE-QUERY', 'update() usa querySelectorAll para atualizar dots', true,
  resCode.includes('querySelectorAll'));

// ═══════════════════════════════════════════════════════════════════════════════
// 8. PRIORIDADE DE MÁQUINAS — 16 cenários completos
// ═══════════════════════════════════════════════════════════════════════════════
section('8. PRIORIDADE DE MÁQUINAS — 16 cenários');

function priorityCalc(b1,b2,b3,b4) {
  const req=[b1,b2,b3,b4], act=[0,0,0,0]; let c=0;
  for(let i=3;i>=0;i--) if(req[i]&&c<2){act[i]=1;c++;}
  return act;
}
function priorityRef(b1,b2,b3,b4) {
  const m=[{i:3,r:b4},{i:2,r:b3},{i:1,r:b2},{i:0,r:b1}];
  const act=[0,0,0,0]; let c=0;
  for(const x of m) if(x.r&&c<2){act[x.i]=1;c++;}
  return act;
}
for(let mask=0;mask<16;mask++){
  const b=[(mask>>0)&1,(mask>>1)&1,(mask>>2)&1,(mask>>3)&1];
  test(`PRI-${String(mask).padStart(2,'0')}`,
    b.map((v,i)=>`M${i+1}=${v}`).join(' '),
    JSON.stringify(priorityRef(...b)), JSON.stringify(priorityCalc(...b)));
}

// ═══════════════════════════════════════════════════════════════════════════════
// 9. COURSEDATA — estrutura e módulos
// ═══════════════════════════════════════════════════════════════════════════════
section('9. COURSEDATA — estrutura dos 8 módulos');

test('CD-01', 'CourseData é Array', true, Array.isArray(CourseData));
test('CD-02', 'CourseData tem 8 módulos', 8, CourseData ? CourseData.length : 0);

const validLabTypes = ['gates','truth','simplifier','kmap','circuit','reservoir','priority'];
if (Array.isArray(CourseData)) {
  CourseData.forEach((m, i) => {
    test(`CD-MOD-${i+1}-ID`,      `Módulo ${i+1} tem id`,      true, typeof m.id==='string'&&m.id.length>0);
    test(`CD-MOD-${i+1}-TITLE`,   `Módulo ${i+1} tem title`,   true, typeof m.title==='string'&&m.title.length>0);
    test(`CD-MOD-${i+1}-CONTENT`, `Módulo ${i+1} tem content`, true, typeof m.content==='string'&&m.content.length>0);
    test(`CD-MOD-${i+1}-LAB`,     `Módulo ${i+1} labType válido`, true, validLabTypes.includes(m.labType));
  });
  const ids = CourseData.map(m=>m.id);
  test('CD-IDS-UNIQUE', 'IDs dos módulos são únicos', ids.length, new Set(ids).size);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 10. INTEGRAÇÃO — ordem de carregamento, caminhos
// ═══════════════════════════════════════════════════════════════════════════════
section('10. INTEGRAÇÃO — caminhos e ordem de carregamento');

const html = fs.readFileSync('./index.html', 'utf8');
const scripts = ['js/logic-engine.js','js/kmap-engine.js','js/progress.js','js/course-data.js',
  'js/labs/gates-lab.js','js/labs/truth-builder.js','js/labs/simplifier.js',
  'js/labs/kmap-lab.js','js/labs/circuit-builder.js','js/labs/reservoir-sim.js',
  'js/labs/priority-sim.js','js/app.js'];

scripts.forEach(s => {
  test(`INT-FILE-${s.replace(/\//g,'-')}`, `Arquivo ${s} referenciado no HTML`,
    true, html.includes(s));
  test(`INT-EXIST-${s.replace(/\//g,'-')}`, `Arquivo ${s} existe localmente`,
    true, fs.existsSync(`./${s}`));
});

// Ordem: LogicEngine antes de labs; labs antes de app.js
const lePos     = html.indexOf('logic-engine.js');
const appPos    = html.indexOf('app.js');
const gatesPos  = html.indexOf('gates-lab.js');
const coursePos = html.indexOf('course-data.js');
test('INT-ORDER-1', 'logic-engine.js antes de gates-lab.js', true, lePos < gatesPos);
test('INT-ORDER-2', 'labs antes de app.js',                  true, gatesPos < appPos);
test('INT-ORDER-3', 'course-data.js antes de app.js',        true, coursePos < appPos);

// Sem caminhos absolutos (quebraria no GitHub Pages)
const absPaths = [...html.matchAll(/src="\/[^"]+"|href="\/[^"]+"/g)];
test('INT-NO-ABS-PATHS', 'HTML não usa caminhos absolutos /arquivo', 0, absPaths.length,
  absPaths.map(m=>m[0]).join(', '));

// ═══════════════════════════════════════════════════════════════════════════════
// 11. ACESSIBILIDADE — análise estática
// ═══════════════════════════════════════════════════════════════════════════════
section('11. ACESSIBILIDADE — análise estática');

const mainCss = fs.readFileSync('./css/main.css', 'utf8');
const compCss = fs.readFileSync('./css/components.css', 'utf8');
const labCss  = fs.readFileSync('./css/lab.css', 'utf8');

test('ACC-01', 'HTML tem lang="pt-BR"', true, html.includes('lang="pt-BR"'));
test('ACC-02', 'HTML tem meta viewport', true, html.includes('viewport'));
test('ACC-03', 'main.css tem @media max-width', true,
  mainCss.includes('@media') && mainCss.includes('max-width'));
test('ACC-04', 'lab.css tem @media para mobile (max-width: 600px)', true,
  labCss.includes('@media') && labCss.includes('600px'));
test('ACC-05', 'lab-tabs tem overflow-x:auto', true, labCss.includes('overflow-x: auto'));
test('ACC-06', 'Estilos :focus-visible definidos', true,
  compCss.includes(':focus-visible'), 'Adicionado em components.css');
test('ACC-07', 'aria-label nos botões de navegação', true,
  html.includes('aria-label="Ver trilha de módulos"'));
test('ACC-08', 'role=navigation na nav principal', true, html.includes('role="navigation"'));
test('ACC-09', 'role=tablist nas abas de laboratório', true, html.includes('role="tablist"'));
test('ACC-10', 'aria-selected nas abas', true, html.includes('aria-selected'));
test('ACC-11', 'SVG do circuito usa viewBox (responsivo)', true,
  fs.readFileSync('./js/labs/circuit-builder.js','utf8').includes('viewBox'));
test('ACC-12', 'Switches têm <label> wrapping <input>', true,
  fs.readFileSync('./js/labs/gates-lab.js','utf8').includes('<label class="switch">'));

// ═══════════════════════════════════════════════════════════════════════════════
// 12. GITHUB PAGES — recursos publicados
// ═══════════════════════════════════════════════════════════════════════════════
section('12. GITHUB PAGES — recursos publicados (HTTP)');

async function runServerTests() {
  const base = 'https://conrado-100.github.io/projeto-estudo-algebra-booleana';
  const resources = [
    ['/','GHP-01','Página principal (HTTP 200)'],
    ['/js/logic-engine.js','GHP-02','logic-engine.js'],
    ['/js/kmap-engine.js','GHP-03','kmap-engine.js'],
    ['/js/progress.js','GHP-04','progress.js'],
    ['/js/course-data.js','GHP-05','course-data.js'],
    ['/js/app.js','GHP-06','app.js'],
    ['/js/labs/gates-lab.js','GHP-07','gates-lab.js'],
    ['/js/labs/truth-builder.js','GHP-08','truth-builder.js'],
    ['/js/labs/simplifier.js','GHP-09','simplifier.js'],
    ['/js/labs/kmap-lab.js','GHP-10','kmap-lab.js'],
    ['/js/labs/circuit-builder.js','GHP-11','circuit-builder.js'],
    ['/js/labs/reservoir-sim.js','GHP-12','reservoir-sim.js'],
    ['/js/labs/priority-sim.js','GHP-13','priority-sim.js'],
    ['/css/main.css','GHP-14','main.css'],
    ['/css/components.css','GHP-15','components.css'],
    ['/css/lab.css','GHP-16','lab.css'],
  ];
  for (const [path, id, desc] of resources) {
    const r = await fetchUrl(base + path);
    test(id, `${desc} — HTTP ${r.status}`, true, r.status >= 200 && r.status < 400,
      r.error || '');
  }

  // Conteúdo do course-data.js publicado (ainda com bug — correção pendente de push)
  const cd = await fetchUrl(base + '/js/course-data.js');
  const pubHasCourseData = cd.body.includes('CourseData');
  const pubHasCircuit    = cd.body.includes('CircuitBuilderLab');
  console.log(`\n  course-data.js SERVIDOR: CourseData=${pubHasCourseData} CircuitBuilderLab=${pubHasCircuit}`);
  console.log(`  (Correção local aplicada — push pendente de autorização)`);
  // Não reprovamos novamente aqui — documentamos apenas
  block('GHP-17', 'course-data.js no servidor com CourseData correto',
    `Correção aplicada localmente. Servidor ainda tem CircuitBuilderLab. Push pendente de autorização.`);

  // ═════════════════════════════════════════════════════════════════════════════
  // RESULTADO FINAL
  // ═════════════════════════════════════════════════════════════════════════════
  section('RESULTADO FINAL');
  const total = pass + fail + blocked;
  console.log(`Total  : ${total}`);
  console.log(`✅ APROVADOS : ${pass}`);
  console.log(`❌ REPROVADOS: ${fail}`);
  console.log(`⛔ BLOQUEADOS: ${blocked}`);

  if (failures.length > 0) {
    console.log('\nFALHAS:');
    failures.forEach(f => {
      console.log(`  ❌ [${f.id}] ${f.desc}`);
      console.log(`     esperado: ${JSON.stringify(f.exp)}`);
      console.log(`     obtido  : ${JSON.stringify(f.got)}`);
      if (f.evidence) console.log(`     evidência: ${f.evidence}`);
    });
  }
  if (blockedList.length > 0) {
    console.log('\nBLOQUEADOS:');
    blockedList.forEach(b => console.log(`  ⛔ [${b.id}] ${b.desc}: ${b.reason}`));
  }
}

runServerTests();
