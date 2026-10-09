/**
 * SCRIPT DE AUDITORIA COMPLETA — BooleLab Educacional
 * Executa todos os testes lógicos sem navegador (Node.js puro)
 */

// ─── Reprodução dos módulos sem DOM ──────────────────────────────────────────

// ── LogicEngine (copiado de logic-engine.js) ─────────────────────────────────
const LogicEngine = {
  evaluate(expression, inputs) {
    let sanitized = expression
      .replace(/\s+/g, '')
      .replace(/AND|\./g, '&&')
      .replace(/OR|\+/g, '||')
      .replace(/XOR|\^/g, '!==')
      .replace(/NOT|!/g, '!');

    Object.keys(inputs).forEach(varName => {
      const val = inputs[varName] ? 1 : 0;
      const regexNot = new RegExp(`~${varName}|${varName}'`, 'g');
      sanitized = sanitized.replace(regexNot, val ? '0' : '1');
    });

    Object.keys(inputs).forEach(varName => {
      const val = inputs[varName] ? 1 : 0;
      const regexVar = new RegExp(`\\b${varName}\\b`, 'g');
      sanitized = sanitized.replace(regexVar, val.toString());
    });

    try {
      return Function(`"use strict"; return (${sanitized}) ? 1 : 0;`)();
    } catch (e) {
      return { error: e.message, sanitized };
    }
  },

  generateTruthTable(variables, evalFn) {
    const numVars = variables.length;
    const rowsCount = Math.pow(2, numVars);
    const table = [];
    for (let i = 0; i < rowsCount; i++) {
      const inputs = {};
      for (let j = 0; j < numVars; j++) {
        const bit = (i >> (numVars - 1 - j)) & 1;
        inputs[variables[j]] = bit;
      }
      const output = evalFn(inputs);
      table.push({ inputs, output });
    }
    return table;
  },

  areEquivalent(expr1, expr2, variables) {
    const table1 = this.generateTruthTable(variables, (inputs) => this.evaluate(expr1, inputs));
    const table2 = this.generateTruthTable(variables, (inputs) => this.evaluate(expr2, inputs));
    return table1.every((row, idx) => row.output === table2[idx].output);
  }
};

// ── Funções das portas lógicas (de gates-lab.js) ─────────────────────────────
function calcGate(gate, a, b) {
  switch (gate) {
    case 'NOT':  return a ? 0 : 1;
    case 'AND':  return (a && b) ? 1 : 0;
    case 'OR':   return (a || b) ? 1 : 0;
    case 'NAND': return !(a && b) ? 1 : 0;
    case 'NOR':  return !(a || b) ? 1 : 0;
    case 'XOR':  return (a !== b) ? 1 : 0;
    case 'XNOR': return (a === b) ? 1 : 0;
    default: return -1;
  }
}

// ── Funções das simulações industriais ───────────────────────────────────────
function reservoirCalc(sA, sB, sC) {
  const valveX = sB ? 0 : 1;          // X = ~B
  const pumpY  = (sA && !sC) ? 1 : 0; // Y = A . ~C
  return { valveX, pumpY };
}

function priorityCalc(b1, b2, b3, b4) {
  const requests = [b1, b2, b3, b4];
  const activeMachines = [0, 0, 0, 0];
  let count = 0;
  for (let i = 3; i >= 0; i--) {
    if (requests[i] && count < 2) {
      activeMachines[i] = 1;
      count++;
    }
  }
  return activeMachines; // índice 0 = M1, 3 = M4
}

// ── KMapEngine (copiado de kmap-engine.js) ───────────────────────────────────
const KMapEngine = {
  grayCodes: {
    1: ['0', '1'],
    2: ['00', '01', '11', '10']
  },
  getMapStructure(numVars) {
    if (numVars === 2) return { rowVars:['A'], colVars:['B'], rowLabels:this.grayCodes[1], colLabels:this.grayCodes[1] };
    if (numVars === 3) return { rowVars:['A'], colVars:['B','C'], rowLabels:this.grayCodes[1], colLabels:this.grayCodes[2] };
    if (numVars === 4) return { rowVars:['A','B'], colVars:['C','D'], rowLabels:this.grayCodes[2], colLabels:this.grayCodes[2] };
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// EXECUTOR DE TESTES
// ═══════════════════════════════════════════════════════════════════════════════
let passed = 0, failed = 0, blocked = 0;
const results = [];
let testId = 1;

function test(id, description, expected, actual, evidence='') {
  const ok = JSON.stringify(expected) === JSON.stringify(actual);
  const status = ok ? 'APROVADO' : 'REPROVADO';
  if (ok) passed++; else failed++;
  results.push({ id, description, expected, actual, status, evidence });
  const mark = ok ? '✅' : '❌';
  console.log(`${mark} [${id}] ${description}`);
  if (!ok) console.log(`     esperado: ${JSON.stringify(expected)}  obtido: ${JSON.stringify(actual)}  ${evidence}`);
}

function testBlock(id, description, reason) {
  blocked++;
  results.push({ id, description, expected:'N/A', actual:'N/A', status:'BLOQUEADO', evidence:reason });
  console.log(`⛔ [${id}] BLOQUEADO — ${description}: ${reason}`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCO 1 — INVESTIGAÇÃO DO course-data.js
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n══════════════════════════════════════════════════════');
console.log('BLOCO 1 — Investigação do course-data.js');
console.log('══════════════════════════════════════════════════════');

// Lê o conteúdo real do arquivo course-data.js para avaliar se contém CourseData
const fs = require('fs');
const courseDataContent = fs.readFileSync('./js/course-data.js', 'utf8');
const circuitBuilderContent = fs.readFileSync('./js/labs/circuit-builder.js', 'utf8');

const hasCourseDataArray = courseDataContent.includes('const CourseData') || courseDataContent.includes('var CourseData') || courseDataContent.includes('let CourseData');
const hasCourseDataObject = courseDataContent.includes('CourseData');
const hasCircuitBuilderLab = courseDataContent.includes('CircuitBuilderLab');
const circuitBuilderHasCircuitBuilderLab = circuitBuilderContent.includes('CircuitBuilderLab');

console.log(`course-data.js contém "const CourseData": ${hasCourseDataArray}`);
console.log(`course-data.js contém "CourseData":        ${hasCourseDataObject}`);
console.log(`course-data.js contém "CircuitBuilderLab": ${hasCircuitBuilderLab}`);
console.log(`circuit-builder.js contém "CircuitBuilderLab": ${circuitBuilderHasCircuitBuilderLab}`);
console.log(`Primeiros 80 chars de course-data.js: "${courseDataContent.substring(0, 120).replace(/\n/g,' ')}"`);

// Verifica se course-data.js e circuit-builder.js são idênticos
const areIdentical = courseDataContent.trim() === circuitBuilderContent.trim();
console.log(`course-data.js é idêntico a circuit-builder.js: ${areIdentical}`);

test('BUG-01', 'course-data.js deve definir CourseData (array de módulos)',
  true, hasCourseDataArray,
  'course-data.js não declara const CourseData — declara CircuitBuilderLab duplicado'
);

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCO 2 — PORTAS LÓGICAS
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n══════════════════════════════════════════════════════');
console.log('BLOCO 2 — Portas Lógicas (todas as combinações)');
console.log('══════════════════════════════════════════════════════');

// Tabela de referência independente
const expectedGates = {
  NOT:  [[0,1],[1,0]],
  AND:  [[0,0,0],[0,1,0],[1,0,0],[1,1,1]],
  OR:   [[0,0,0],[0,1,1],[1,0,1],[1,1,1]],
  NAND: [[0,0,1],[0,1,1],[1,0,1],[1,1,0]],
  NOR:  [[0,0,1],[0,1,0],[1,0,0],[1,1,0]],
  XOR:  [[0,0,0],[0,1,1],[1,0,1],[1,1,0]],
  XNOR: [[0,0,1],[0,1,0],[1,0,0],[1,1,1]]
};

expectedGates.NOT.forEach(([a, exp]) => {
  test(`P-NOT-${a}`, `NOT(${a})`, exp, calcGate('NOT', a, 0));
});
['AND','OR','NAND','NOR','XOR','XNOR'].forEach(gate => {
  expectedGates[gate].forEach(([a, b, exp]) => {
    test(`P-${gate}-${a}${b}`, `${gate}(${a},${b})`, exp, calcGate(gate, a, b));
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCO 3 — MOTOR LÓGICO (evaluate)
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n══════════════════════════════════════════════════════');
console.log('BLOCO 3 — Motor Lógico (LogicEngine.evaluate)');
console.log('══════════════════════════════════════════════════════');

// Notação do projeto: AND=. OR=+ NOT=~ ou NOT
const evalTests = [
  // Identidades
  { id:'LE-01', desc:'A AND 1 = A (A=0)', expr:'A . 1', vars:{A:0}, exp:0 },
  { id:'LE-02', desc:'A AND 1 = A (A=1)', expr:'A . 1', vars:{A:1}, exp:1 },
  { id:'LE-03', desc:'A OR 0 = A (A=0)',  expr:'A + 0', vars:{A:0}, exp:0 },
  { id:'LE-04', desc:'A OR 0 = A (A=1)',  expr:'A + 0', vars:{A:1}, exp:1 },
  { id:'LE-05', desc:'A AND 0 = 0 (A=0)', expr:'A . 0', vars:{A:0}, exp:0 },
  { id:'LE-06', desc:'A AND 0 = 0 (A=1)', expr:'A . 0', vars:{A:1}, exp:0 },
  { id:'LE-07', desc:'A OR 1 = 1 (A=0)',  expr:'A + 1', vars:{A:0}, exp:1 },
  { id:'LE-08', desc:'A OR 1 = 1 (A=1)',  expr:'A + 1', vars:{A:1}, exp:1 },
  // Dupla negação
  { id:'LE-09', desc:'NOT(NOT(A)) = A (A=0)', expr:'!!A', vars:{A:0}, exp:0 },
  { id:'LE-10', desc:'NOT(NOT(A)) = A (A=1)', expr:'!!A', vars:{A:1}, exp:1 },
  // XOR via . e +
  { id:'LE-11', desc:'A XOR B via operadores (A=0,B=1)', expr:'A XOR B', vars:{A:0,B:1}, exp:1 },
  { id:'LE-12', desc:'A XOR B via operadores (A=1,B=1)', expr:'A XOR B', vars:{A:1,B:1}, exp:0 },
];
evalTests.forEach(t => {
  const got = LogicEngine.evaluate(t.expr, t.vars);
  test(t.id, t.desc, t.exp, got);
});

// Testa parse de notação ~ (tilde) para NOT
console.log('\n--- Testes de notação negação ~var ---');
const negTests = [
  { id:'LE-N1', desc:'~A quando A=1 deve ser 0', expr:'~A', vars:{A:1}, exp:0 },
  { id:'LE-N2', desc:'~A quando A=0 deve ser 1', expr:'~A', vars:{A:0}, exp:1 },
  { id:'LE-N3', desc:'A.~B A=1 B=0 deve ser 1',  expr:'A.~B', vars:{A:1,B:0}, exp:1 },
  { id:'LE-N4', desc:'A.~B A=1 B=1 deve ser 0',  expr:'A.~B', vars:{A:1,B:1}, exp:0 },
];
negTests.forEach(t => {
  const got = LogicEngine.evaluate(t.expr, t.vars);
  test(t.id, t.desc, t.exp, got);
});

// Testa precedência: A + B.C  deve ser A OR (B AND C)
console.log('\n--- Precedência de operadores ---');
// Em JS, && tem maior precedência que ||, então A + B.C -> A || B && C -> correto
const precTests = [
  { id:'LE-P1', desc:'A+B.C A=0,B=1,C=1 → 1', expr:'A + B . C', vars:{A:0,B:1,C:1}, exp:1 },
  { id:'LE-P2', desc:'A+B.C A=0,B=1,C=0 → 0', expr:'A + B . C', vars:{A:0,B:1,C:0}, exp:0 },
  { id:'LE-P3', desc:'A+B.C A=1,B=0,C=0 → 1', expr:'A + B . C', vars:{A:1,B:0,C:0}, exp:1 },
];
precTests.forEach(t => {
  const got = LogicEngine.evaluate(t.expr, t.vars);
  test(t.id, t.desc, t.exp, got);
});

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCO 4 — LEIS BOOLEANAS (areEquivalent)
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n══════════════════════════════════════════════════════');
console.log('BLOCO 4 — Leis Booleanas (areEquivalent)');
console.log('══════════════════════════════════════════════════════');

const lawTests = [
  { id:'LEI-01', desc:'1ª De Morgan: ~(A.B) = ~A+~B',        e1:'~(A.B)',    e2:'~A+~B',    vars:['A','B'] },
  { id:'LEI-02', desc:'2ª De Morgan: ~(A+B) = ~A.~B',        e1:'~(A+B)',    e2:'~A.~B',    vars:['A','B'] },
  { id:'LEI-03', desc:'Absorção 1: A+(A.B) = A',             e1:'A+(A.B)',   e2:'A',         vars:['A','B'] },
  { id:'LEI-04', desc:'Absorção 2: A.(A+B) = A',             e1:'A.(A+B)',   e2:'A',         vars:['A','B'] },
  { id:'LEI-05', desc:'Complemento: A.~A = 0',               e1:'A.~A',      e2:'A.0',       vars:['A']     },
  { id:'LEI-06', desc:'Tautologia: A+~A = 1',                e1:'A+~A',      e2:'A+1',       vars:['A']     },
  { id:'LEI-07', desc:'Idempotência: A.A = A',               e1:'A.A',       e2:'A',         vars:['A']     },
  { id:'LEI-08', desc:'Idempotência: A+A = A',               e1:'A+A',       e2:'A',         vars:['A']     },
  { id:'LEI-09', desc:'Dupla negação: ~~A = A',              e1:'~~A',       e2:'A',         vars:['A']     },
  { id:'LEI-10', desc:'Comutatividade AND: A.B = B.A',       e1:'A.B',       e2:'B.A',       vars:['A','B'] },
  { id:'LEI-11', desc:'Distributividade: A.(B+C) = A.B+A.C', e1:'A.(B+C)',  e2:'A.B+A.C',   vars:['A','B','C'] },
];

lawTests.forEach(t => {
  const got = LogicEngine.areEquivalent(t.e1, t.e2, t.vars);
  test(t.id, t.desc, true, got);
});

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCO 5 — SIMPLIFICADOR (verificação das etapas)
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n══════════════════════════════════════════════════════');
console.log('BLOCO 5 — Simplificador (equivalência de cada passo)');
console.log('══════════════════════════════════════════════════════');

const simpSteps = [
  { expr: "A.B.C + A.B.~C + A.~C", rule: "Expressão inicial" },
  { expr: "A.B.(C + ~C) + A.~C",   rule: "Fatoração A.B" },
  { expr: "A.B.(1) + A.~C",         rule: "Complemento C+~C=1" },
  { expr: "A.B + A.~C",             rule: "Neutro .1" },
  { expr: "A.(B + ~C)",             rule: "Colocar A em evidência" }
];
const simpVars = ['A','B','C'];
const simpInitial = simpSteps[0].expr;
simpSteps.forEach((s, i) => {
  const eq = LogicEngine.areEquivalent(simpInitial, s.expr, simpVars);
  test(`SIMP-0${i+1}`, `Passo ${i+1} equivalente à inicial: "${s.rule}"`, true, eq);
});

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCO 6 — TABELAS-VERDADE
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n══════════════════════════════════════════════════════');
console.log('BLOCO 6 — Tabelas-Verdade');
console.log('══════════════════════════════════════════════════════');

function testTruthTable(vars, expr, description) {
  const table = LogicEngine.generateTruthTable(vars, (inputs) => LogicEngine.evaluate(expr, inputs));
  const expectedRows = Math.pow(2, vars.length);
  test(`TT-${vars.length}V-COUNT`, `${description}: ${expectedRows} linhas geradas`, expectedRows, table.length);
  // Verifica unicidade
  const keys = table.map(r => vars.map(v => r.inputs[v]).join(''));
  const uniqueKeys = new Set(keys);
  test(`TT-${vars.length}V-UNIQ`, `${description}: todas as combinações únicas`, true, keys.length === uniqueKeys.size);
  // Imprime tabela para inspeção
  console.log(`  Tabela ${description} (${vars.join(',')} | ${expr}):`);
  table.forEach(r => {
    const row = vars.map(v => r.inputs[v]).join(' ') + ' | ' + r.output;
    console.log(`    ${row}`);
  });
  return table;
}

testTruthTable(['A','B'], 'A + B', '2 vars A+B');
testTruthTable(['A','B','C'], 'A + B . C', '3 vars A+B.C');
testTruthTable(['A','B','C','D'], 'A . B + C . D', '4 vars A.B+C.D');

// Verificação manual da tabela AND 2 variáveis
const andTable2 = LogicEngine.generateTruthTable(['A','B'], (inp) => LogicEngine.evaluate('A . B', inp));
const expectedAND = [0,0,0,1];
andTable2.forEach((row, i) => {
  test(`TT-AND-${i}`, `AND tabela linha ${i} (A=${row.inputs.A},B=${row.inputs.B})`, expectedAND[i], row.output);
});

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCO 7 — MAPAS DE KARNAUGH
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n══════════════════════════════════════════════════════');
console.log('BLOCO 7 — Mapas de Karnaugh (estrutura e ordem Gray)');
console.log('══════════════════════════════════════════════════════');

const kmap2 = KMapEngine.getMapStructure(2);
const kmap3 = KMapEngine.getMapStructure(3);
const kmap4 = KMapEngine.getMapStructure(4);

// Ordem Gray esperada
test('KM-01', 'KMap 2 vars: rowLabels = [0,1]',    ['0','1'],              kmap2.rowLabels);
test('KM-02', 'KMap 2 vars: colLabels = [0,1]',    ['0','1'],              kmap2.colLabels);
test('KM-03', 'KMap 3 vars: colLabels Gray [00,01,11,10]', ['00','01','11','10'], kmap3.colLabels);
test('KM-04', 'KMap 3 vars: rowLabels = [0,1]',    ['0','1'],              kmap3.rowLabels);
test('KM-05', 'KMap 4 vars: rowLabels Gray [00,01,11,10]', ['00','01','11','10'], kmap4.rowLabels);
test('KM-06', 'KMap 4 vars: colLabels Gray [00,01,11,10]', ['00','01','11','10'], kmap4.colLabels);

// Dimensões corretas
const cells2 = kmap2.rowLabels.length * kmap2.colLabels.length;
const cells3 = kmap3.rowLabels.length * kmap3.colLabels.length;
const cells4 = kmap4.rowLabels.length * kmap4.colLabels.length;
test('KM-07', 'KMap 2 vars: 4 células (2^2)',  4, cells2);
test('KM-08', 'KMap 3 vars: 8 células (2^3)',  8, cells3);
test('KM-09', 'KMap 4 vars: 16 células (2^4)', 16, cells4);

// Verifica adjacência Gray (cada label difere do anterior em 1 bit)
function grayAdjacent(labels) {
  for (let i = 0; i < labels.length; i++) {
    const a = parseInt(labels[i], 2);
    const b = parseInt(labels[(i + 1) % labels.length], 2);
    const xor = a ^ b;
    if ((xor & (xor - 1)) !== 0) return false; // mais de 1 bit diferente
  }
  return true;
}
test('KM-10', 'KMap 3 vars colLabels adjacência Gray (incluso wrap-around)', true, grayAdjacent(kmap3.colLabels));
test('KM-11', 'KMap 4 vars rowLabels adjacência Gray', true, grayAdjacent(kmap4.rowLabels));
test('KM-12', 'KMap 4 vars colLabels adjacência Gray', true, grayAdjacent(kmap4.colLabels));

// ─── Testa se KMapEngine consegue gerar mapa para 5 variáveis (deve retornar undefined) ───
const kmap5 = KMapEngine.getMapStructure(5);
test('KM-13', 'KMap 5 vars retorna undefined (não implementado)', undefined, kmap5);

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCO 8 — SIMULAÇÃO DO RESERVATÓRIO
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n══════════════════════════════════════════════════════');
console.log('BLOCO 8 — Simulação do Reservatório (X=~B, Y=A.~C)');
console.log('══════════════════════════════════════════════════════');

// Referência independente: X = NOT B, Y = A AND NOT C
function reservoirRef(A, B, C) {
  return { valveX: B ? 0 : 1, pumpY: (A && !C) ? 1 : 0 };
}

let combo = 0;
for (let A = 0; A <= 1; A++) {
  for (let B = 0; B <= 1; B++) {
    for (let C = 0; C <= 1; C++) {
      const got = reservoirCalc(A, B, C);
      const exp = reservoirRef(A, B, C);
      combo++;
      test(`RES-${combo}`, `Reservatório A=${A} B=${B} C=${C} → X=${exp.valveX} Y=${exp.pumpY}`,
        JSON.stringify(exp), JSON.stringify(got));
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCO 9 — SIMULAÇÃO DE PRIORIDADE DE MÁQUINAS
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n══════════════════════════════════════════════════════');
console.log('BLOCO 9 — Prioridade de Máquinas (M4>M3>M2>M1, max 2)');
console.log('══════════════════════════════════════════════════════');

const priorTests = [
  { id:'PRI-01', desc:'Nenhuma solicitação',           b:[0,0,0,0], exp:[0,0,0,0] },
  { id:'PRI-02', desc:'Apenas M1',                     b:[1,0,0,0], exp:[1,0,0,0] },
  { id:'PRI-03', desc:'Apenas M4',                     b:[0,0,0,1], exp:[0,0,0,1] },
  { id:'PRI-04', desc:'M1 e M2',                       b:[1,1,0,0], exp:[1,1,0,0] },
  { id:'PRI-05', desc:'M1 e M4 → M4 ativa, M1 ativa (cap=2)', b:[1,0,0,1], exp:[1,0,0,1] },
  { id:'PRI-06', desc:'M1 M2 M3 → M3 M2 (cap atingida, M1 excluída)', b:[1,1,1,0], exp:[0,1,1,0] },
  { id:'PRI-07', desc:'M1 M2 M3 M4 → M4 M3 (cap atingida)', b:[1,1,1,1], exp:[0,0,1,1] },
  { id:'PRI-08', desc:'M2 M4',                         b:[0,1,0,1], exp:[0,1,0,1] },
  { id:'PRI-09', desc:'M3 M4',                         b:[0,0,1,1], exp:[0,0,1,1] },
  { id:'PRI-10', desc:'M1 M3',                         b:[1,0,1,0], exp:[1,0,1,0] },
  { id:'PRI-11', desc:'M2 M3 M4 → M4 M3 (cap atingida)', b:[0,1,1,1], exp:[0,0,1,1] },
];

priorTests.forEach(t => {
  const got = priorityCalc(...t.b);
  test(t.id, t.desc, t.exp, got);
});

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCO 10 — TESTES DO AUTOTESTE EXISTENTE (runSelfTest)
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n══════════════════════════════════════════════════════');
console.log('BLOCO 10 — Autoteste existente (runSelfTest expandido)');
console.log('══════════════════════════════════════════════════════');

// Teste 1 original: AND
const andValid = LogicEngine.evaluate("A . B", {A:1, B:1}) === 1 && LogicEngine.evaluate("A . B", {A:1, B:0}) === 0;
test('AUTO-01', 'runSelfTest: AND(1,1)=1 AND AND(1,0)=0', true, andValid);

// Teste 2 original: De Morgan ~(A.B) = ~A+~B
const deMorganValid = LogicEngine.areEquivalent("~(A . B)", "~A + ~B", ['A', 'B']);
test('AUTO-02', 'runSelfTest: 1ª De Morgan ~(A.B)=~A+~B', true, deMorganValid);

// Teste 3 original: Absorção A+A.B = A
const absorptionValid = LogicEngine.areEquivalent("A + A . B", "A", ['A', 'B']);
test('AUTO-03', 'runSelfTest: Absorção A+A.B=A', true, absorptionValid);

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCO 11 — TESTES DE EXPRESSÕES INVÁLIDAS / ROBUSTEZ
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n══════════════════════════════════════════════════════');
console.log('BLOCO 11 — Robustez e entradas inválidas');
console.log('══════════════════════════════════════════════════════');

// Expressão vazia
const emptyResult = LogicEngine.evaluate('', {A:1});
console.log(`  Expressão vazia → ${JSON.stringify(emptyResult)}`);
const emptyOk = emptyResult === 0 || typeof emptyResult === 'number';
test('ROB-01', 'Expressão vazia retorna número (0 ou erro tratado)', true, emptyOk,
  `retornou: ${JSON.stringify(emptyResult)}`);

// Variável não substituída (Z não definida)
const undefinedVar = LogicEngine.evaluate('A . Z', {A:1});
console.log(`  Variável Z não definida em A.Z → ${JSON.stringify(undefinedVar)}`);
// Esperamos que retorne um valor numérico (mesmo que 0) sem lançar exceção
const undefinedOk = typeof undefinedVar === 'number' || (typeof undefinedVar === 'object' && undefinedVar !== null && undefinedVar.error);
test('ROB-02', 'Variável não definida não lança exceção', true, undefinedOk,
  `retornou: ${JSON.stringify(undefinedVar)}`);

// Parênteses desbalanceados
const unbalanced = LogicEngine.evaluate('A . (B + C', {A:1, B:1, C:0});
console.log(`  Parênteses desbalanceados → ${JSON.stringify(unbalanced)}`);
const unbalancedOk = typeof unbalanced === 'number' || (unbalanced && unbalanced.error);
test('ROB-03', 'Parênteses desbalanceados não travam', true, unbalancedOk,
  `retornou: ${JSON.stringify(unbalanced)}`);

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCO 12 — VERIFICAÇÃO DO circuit-builder.js vs course-data.js
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n══════════════════════════════════════════════════════');
console.log('BLOCO 12 — Verificação de conteúdo duplicado / faltante');
console.log('══════════════════════════════════════════════════════');

// course-data.js deveria ter CourseData (array de módulos)
// circuit-builder.js deveria ter CircuitBuilderLab
console.log(`\ncourse-data.js (${courseDataContent.length} chars):`);
console.log(`  Define CircuitBuilderLab: ${courseDataContent.includes('const CircuitBuilderLab')}`);
console.log(`  Define CourseData:        ${courseDataContent.includes('const CourseData') || courseDataContent.includes('CourseData =')}`);
console.log(`\ncircuit-builder.js (${circuitBuilderContent.length} chars):`);
console.log(`  Define CircuitBuilderLab: ${circuitBuilderContent.includes('const CircuitBuilderLab')}`);
console.log(`  Conteúdo idêntico a course-data.js: ${areIdentical}`);

// Verifica se app.js usa CourseData
const appContent = fs.readFileSync('./js/app.js', 'utf8');
const appUsesCourseData = appContent.includes('CourseData');
console.log(`\napp.js usa CourseData: ${appUsesCourseData}`);
console.log(`Contextos em app.js:`);
const lines = appContent.split('\n');
lines.forEach((l, i) => { if (l.includes('CourseData')) console.log(`  Linha ${i+1}: ${l.trim()}`); });

test('BUG-02', 'CircuitBuilderLab NÃO deve estar em course-data.js', false, courseDataContent.includes('const CircuitBuilderLab'));
test('BUG-03', 'CourseData (array de módulos) deve existir em course-data.js', true,
  courseDataContent.includes('const CourseData') || courseDataContent.includes('CourseData ='));

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCO 13 — VERIFICAÇÃO DE PATHS HTML (GitHub Pages)
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n══════════════════════════════════════════════════════');
console.log('BLOCO 13 — Verificação de paths no HTML');
console.log('══════════════════════════════════════════════════════');

const htmlContent = fs.readFileSync('./index.html', 'utf8');
// Verifica caminhos absolutos que quebrariam no GitHub Pages (subpasta do repo)
const absolutePaths = [...htmlContent.matchAll(/src="\/[^"]+"|href="\/[^"]+"/g)];
console.log(`Caminhos absolutos encontrados no HTML: ${absolutePaths.length}`);
absolutePaths.forEach(m => console.log(`  ${m[0]}`));
test('GHP-01', 'HTML não usa caminhos absolutos /arquivo (quebra no GitHub Pages)',
  0, absolutePaths.length, absolutePaths.map(m => m[0]).join(', '));

// Verifica se todos os scripts src existem como arquivos
const scriptSrcs = [...htmlContent.matchAll(/src="([^"]+)"/g)].map(m => m[1]);
console.log('\nScripts referenciados no HTML:');
scriptSrcs.forEach(src => {
  const exists = fs.existsSync(`./${src}`);
  console.log(`  ${src} → ${exists ? 'EXISTE' : 'NÃO ENCONTRADO'}`);
  test(`GHP-FILE-${src.replace(/[\/\.]/g,'_')}`, `Arquivo ${src} existe`, true, exists);
});

// Verifica CSS
const cssSrcs = [...htmlContent.matchAll(/href="([^"]+\.css)"/g)].map(m => m[1]);
console.log('\nCSS referenciados:');
cssSrcs.forEach(src => {
  const exists = fs.existsSync(`./${src}`);
  console.log(`  ${src} → ${exists ? 'EXISTE' : 'NÃO ENCONTRADO'}`);
  test(`GHP-CSS-${src.replace(/[\/\.]/g,'_')}`, `CSS ${src} existe`, true, exists);
});

// ═══════════════════════════════════════════════════════════════════════════════
// RESULTADO FINAL
// ═══════════════════════════════════════════════════════════════════════════════
const total = passed + failed + blocked;
console.log('\n══════════════════════════════════════════════════════');
console.log('RESULTADO FINAL DA AUDITORIA');
console.log('══════════════════════════════════════════════════════');
console.log(`Total de testes: ${total}`);
console.log(`✅ APROVADOS:  ${passed}`);
console.log(`❌ REPROVADOS: ${failed}`);
console.log(`⛔ BLOQUEADOS: ${blocked}`);
console.log('\nTestes REPROVADOS:');
results.filter(r => r.status === 'REPROVADO').forEach(r => {
  console.log(`  [${r.id}] ${r.description}`);
  console.log(`    esperado: ${JSON.stringify(r.expected)}`);
  console.log(`    obtido:   ${JSON.stringify(r.actual)}`);
  if (r.evidence) console.log(`    evidência: ${r.evidence}`);
});
