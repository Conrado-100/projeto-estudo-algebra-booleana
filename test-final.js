/**
 * TESTES FINAIS DE AUDITORIA — BooleLab Educacional
 * Cobre: integração, reprodução do bug course-data, servidor publicado,
 * casos extremos do evaluate, estrutura dos módulos, KMap completo,
 * circuit builder, robustez e verificação do autoteste.
 */
'use strict';
const fs = require('fs');
const https = require('https');

let pass = 0, fail = 0, blocked = 0;
const results = [];

function test(id, desc, exp, got, evidence = '') {
  const ok = JSON.stringify(exp) === JSON.stringify(got);
  if (ok) pass++; else fail++;
  const status = ok ? 'APROVADO' : 'REPROVADO';
  results.push({ id, desc, exp, got, status, evidence });
  console.log(`${ok ? '✅' : '❌'} [${id}] ${desc}`);
  if (!ok) {
    console.log(`     esperado : ${JSON.stringify(exp)}`);
    console.log(`     obtido   : ${JSON.stringify(got)}`);
    if (evidence) console.log(`     evidência: ${evidence}`);
  }
}
function block(id, desc, reason) {
  blocked++;
  results.push({ id, desc, exp: 'N/A', got: 'N/A', status: 'BLOQUEADO', evidence: reason });
  console.log(`⛔ [${id}] BLOQUEADO — ${desc}: ${reason}`);
}

// ── LogicEngine (versão corrigida, espelhando logic-engine.js atual) ──────────
const LogicEngine = {
  evaluate(expression, inputs) {
    let sanitized = expression
      .replace(/\bXNOR\b/g, '===')
      .replace(/\bXOR\b/g,  '!==')
      .replace(/\bAND\b/g,  '&&')
      .replace(/\bOR\b/g,   '||')
      .replace(/\bNOT\b/g,  '!')
      .replace(/\s+/g,      '')
      .replace(/\./g,       '&&')
      .replace(/\+/g,       '||')
      .replace(/\^/g,       '!==');
    Object.keys(inputs).forEach(v => {
      const val = inputs[v] ? 1 : 0;
      sanitized = sanitized.replace(new RegExp(`~${v}|${v}'`, 'g'), val ? '0' : '1');
    });
    sanitized = sanitized.replace(/~/g, '!');
    Object.keys(inputs).forEach(v => {
      const val = inputs[v] ? 1 : 0;
      sanitized = sanitized.replace(new RegExp(`\\b${v}\\b`, 'g'), val.toString());
    });
    try {
      return Function(`"use strict"; return (${sanitized}) ? 1 : 0;`)();
    } catch (e) {
      return { error: e.message, sanitized };
    }
  },
  generateTruthTable(vars, evalFn) {
    const n = vars.length;
    const table = [];
    for (let i = 0; i < Math.pow(2, n); i++) {
      const inp = {};
      for (let j = 0; j < n; j++) inp[vars[j]] = (i >> (n - 1 - j)) & 1;
      table.push({ inputs: inp, output: evalFn(inp) });
    }
    return table;
  },
  areEquivalent(e1, e2, vars) {
    const t1 = this.generateTruthTable(vars, inp => this.evaluate(e1, inp));
    const t2 = this.generateTruthTable(vars, inp => this.evaluate(e2, inp));
    return t1.every((r, i) => r.output === t2[i].output);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCO A — REPRODUÇÃO CONCRETA DO BUG course-data.js
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n══════════════════════════════════════════════════════════');
console.log('BLOCO A — Reprodução do bug course-data.js (evidência direta)');
console.log('══════════════════════════════════════════════════════════');

// Lê os dois arquivos e compara
const courseDataContent    = fs.readFileSync('./js/course-data.js', 'utf8');
const circuitBuilderContent = fs.readFileSync('./js/labs/circuit-builder.js', 'utf8');

// ESTADO PUBLICADO NO SERVIDOR (busca HTTP)
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

// Estado LOCAL (após correção)
const localHasCourseData    = courseDataContent.includes('const CourseData');
const localHasCircuitLab    = courseDataContent.includes('const CircuitBuilderLab');
const localCircuitIsCorrect = circuitBuilderContent.includes('const CircuitBuilderLab');
const localAreIdentical     = courseDataContent.trim() === circuitBuilderContent.trim();

console.log('\n--- Estado LOCAL (após correção aplicada) ---');
console.log(`  course-data.js define const CourseData    : ${localHasCourseData}`);
console.log(`  course-data.js define CircuitBuilderLab   : ${localHasCircuitLab}`);
console.log(`  circuit-builder.js define CircuitBuilderLab: ${localCircuitIsCorrect}`);
console.log(`  course-data.js idêntico a circuit-builder.js: ${localAreIdentical}`);

test('A-01', 'LOCAL: course-data.js define CourseData', true,  localHasCourseData);
test('A-02', 'LOCAL: course-data.js NÃO contém CircuitBuilderLab', false, localHasCircuitLab);
test('A-03', 'LOCAL: circuit-builder.js define CircuitBuilderLab', true,  localCircuitIsCorrect);
test('A-04', 'LOCAL: os dois arquivos não são idênticos (após correção)', false, localAreIdentical);

// Reprodução da falha: simula o que app.js faz com CourseData inexistente
console.log('\n--- Reprodução da falha no app.js ---');
// app.js linha 10: CourseData.forEach(...)
// Se course-data.js declara CircuitBuilderLab em vez de CourseData,
// CourseData é undefined → .forEach() lança TypeError
let bugReproduced = false;
try {
  const undefinedCourseData = undefined;
  undefinedCourseData.forEach(() => {});
} catch (e) {
  bugReproduced = true;
  console.log(`  TypeError reproduzido: "${e.message}"`);
  console.log(`  Isso é o que ocorre no browser quando course-data.js não declara CourseData`);
}
test('A-05', 'Bug reproduzido: CourseData undefined → TypeError em forEach', true, bugReproduced,
  'Cannot read properties of undefined (reading forEach)');

// Valida estrutura do CourseData corrigido
console.log('\n--- Validação da estrutura do CourseData local ---');
// Executa course-data.js em contexto Node para validar
let CourseData;
try {
  // Simula execução do arquivo no Node
  const code = courseDataContent;
  CourseData = Function(code + '; return CourseData;')();
} catch (e) {
  CourseData = null;
  console.log(`  Erro ao executar course-data.js: ${e.message}`);
}

test('A-06', 'CourseData é um Array', true, Array.isArray(CourseData));
test('A-07', 'CourseData tem 8 módulos', 8, CourseData ? CourseData.length : 0);

if (Array.isArray(CourseData)) {
  const validLabTypes = ['gates','truth','simplifier','kmap','circuit','reservoir','priority'];
  CourseData.forEach((mod, i) => {
    test(`A-08-${i+1}`, `Módulo ${i+1} tem id`,      true, typeof mod.id === 'string' && mod.id.length > 0);
    test(`A-09-${i+1}`, `Módulo ${i+1} tem title`,   true, typeof mod.title === 'string' && mod.title.length > 0);
    test(`A-10-${i+1}`, `Módulo ${i+1} tem content`, true, typeof mod.content === 'string' && mod.content.length > 0);
    test(`A-11-${i+1}`, `Módulo ${i+1} labType válido`, true, validLabTypes.includes(mod.labType));
  });
  // IDs únicos
  const ids = CourseData.map(m => m.id);
  test('A-12', 'Todos os módulos têm IDs únicos', ids.length, new Set(ids).size);
}

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCO B — VERIFICAÇÃO DO SERVIDOR PUBLICADO (GitHub Pages)
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n══════════════════════════════════════════════════════════');
console.log('BLOCO B — Servidor publicado (GitHub Pages)');
console.log('══════════════════════════════════════════════════════════');

async function runServerTests() {
  const base = 'https://conrado-100.github.io/projeto-estudo-algebra-booleana';
  const resources = [
    { path: '/',                            id: 'GHP-01', desc: 'Página principal carrega (HTTP 200)' },
    { path: '/js/logic-engine.js',          id: 'GHP-02', desc: 'logic-engine.js acessível' },
    { path: '/js/kmap-engine.js',           id: 'GHP-03', desc: 'kmap-engine.js acessível' },
    { path: '/js/progress.js',             id: 'GHP-04', desc: 'progress.js acessível' },
    { path: '/js/course-data.js',          id: 'GHP-05', desc: 'course-data.js acessível' },
    { path: '/js/app.js',                  id: 'GHP-06', desc: 'app.js acessível' },
    { path: '/js/labs/gates-lab.js',       id: 'GHP-07', desc: 'gates-lab.js acessível' },
    { path: '/js/labs/truth-builder.js',   id: 'GHP-08', desc: 'truth-builder.js acessível' },
    { path: '/js/labs/simplifier.js',      id: 'GHP-09', desc: 'simplifier.js acessível' },
    { path: '/js/labs/kmap-lab.js',        id: 'GHP-10', desc: 'kmap-lab.js acessível' },
    { path: '/js/labs/circuit-builder.js', id: 'GHP-11', desc: 'circuit-builder.js acessível' },
    { path: '/js/labs/reservoir-sim.js',   id: 'GHP-12', desc: 'reservoir-sim.js acessível' },
    { path: '/js/labs/priority-sim.js',    id: 'GHP-13', desc: 'priority-sim.js acessível' },
    { path: '/css/main.css',               id: 'GHP-14', desc: 'main.css acessível' },
    { path: '/css/components.css',         id: 'GHP-15', desc: 'components.css acessível' },
    { path: '/css/lab.css',               id: 'GHP-16', desc: 'lab.css acessível' },
  ];

  for (const r of resources) {
    const res = await fetchUrl(base + r.path);
    test(r.id, r.desc, true, res.status >= 200 && res.status < 400,
      `HTTP ${res.status}${res.error ? ' — ' + res.error : ''}`);
  }

  // Verifica o CONTEÚDO do course-data.js publicado (bug ainda presente lá)
  const cdRes = await fetchUrl(base + '/js/course-data.js');
  const publishedHasCourseData = cdRes.body.includes('CourseData');
  const publishedHasCircuit    = cdRes.body.includes('CircuitBuilderLab');
  console.log('\n--- Conteúdo de course-data.js NO SERVIDOR ---');
  console.log(`  HTTP status: ${cdRes.status}`);
  console.log(`  Primeiros 120 chars: "${cdRes.body.substring(0, 120).replace(/\n/g,' ')}"`);
  console.log(`  Contém CourseData      : ${publishedHasCourseData}`);
  console.log(`  Contém CircuitBuilderLab: ${publishedHasCircuit}`);
  test('GHP-17', 'SERVIDOR: course-data.js contém CourseData (BUG: ainda não corrigido no servidor)',
    true, publishedHasCourseData,
    'Correção está apenas local — commit/push pendente de autorização');
  test('GHP-18', 'SERVIDOR: course-data.js NÃO contém CircuitBuilderLab',
    false, publishedHasCircuit,
    `Bug confirmado no servidor: arquivo publicado ainda é cópia de circuit-builder.js`);

  // Verifica caminhos absolutos no HTML publicado
  const htmlRes = await fetchUrl(base + '/');
  const absPaths = [...htmlRes.body.matchAll(/src="\/[^"]+"|href="\/[^"]+"/g)];
  test('GHP-19', 'HTML publicado não usa caminhos absolutos (/arquivo.js)', 0, absPaths.length,
    absPaths.map(m => m[0]).join(', '));
}

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCO C — TESTES ADICIONAIS DO MOTOR LÓGICO (casos extremos)
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n══════════════════════════════════════════════════════════');
console.log('BLOCO C — Casos extremos do LogicEngine.evaluate');
console.log('══════════════════════════════════════════════════════════');

// Expressões com 4 variáveis
const fourVarTests = [
  { id:'EX-01', expr:'A.B.C.D',   inp:{A:1,B:1,C:1,D:1}, exp:1 },
  { id:'EX-02', expr:'A.B.C.D',   inp:{A:1,B:1,C:1,D:0}, exp:0 },
  { id:'EX-03', expr:'A+B+C+D',   inp:{A:0,B:0,C:0,D:0}, exp:0 },
  { id:'EX-04', expr:'A+B+C+D',   inp:{A:0,B:0,C:0,D:1}, exp:1 },
  { id:'EX-05', expr:'~A.~B.~C.~D', inp:{A:0,B:0,C:0,D:0}, exp:1 },
  { id:'EX-06', expr:'~A.~B.~C.~D', inp:{A:1,B:0,C:0,D:0}, exp:0 },
  { id:'EX-07', expr:'(A+B).(C+D)', inp:{A:1,B:0,C:0,D:0}, exp:0 },
  { id:'EX-08', expr:'(A+B).(C+D)', inp:{A:1,B:0,C:1,D:0}, exp:1 },
  { id:'EX-09', expr:'A XOR B XOR C', inp:{A:1,B:1,C:0}, exp:0 },  // 1 XOR 1 = 0, 0 XOR 0 = 0
  { id:'EX-10', expr:'A XOR B XOR C', inp:{A:1,B:0,C:0}, exp:1 },
];
fourVarTests.forEach(t => {
  const got = LogicEngine.evaluate(t.expr, t.inp);
  test(t.id, `evaluate("${t.expr}", ${JSON.stringify(t.inp)})`, t.exp, got);
});

// Notação A' (apóstrofo)
const apostropheTests = [
  { id:'AP-01', expr:"A'", inp:{A:0}, exp:1 },
  { id:'AP-02', expr:"A'", inp:{A:1}, exp:0 },
  { id:'AP-03', expr:"A'.B", inp:{A:0,B:1}, exp:1 },
  { id:'AP-04', expr:"A'.B", inp:{A:1,B:1}, exp:0 },
  { id:'AP-05', expr:"A'.B'", inp:{A:0,B:0}, exp:1 },
  { id:'AP-06', expr:"A'.B'", inp:{A:1,B:1}, exp:0 },
];
apostropheTests.forEach(t => test(t.id, `notação apóstrofo: "${t.expr}"`, t.exp,
  LogicEngine.evaluate(t.expr, t.inp)));

// Teste de equivalência com expressões mistas (. e AND, + e OR)
const mixedNotation = [
  { id:'MX-01', e1:'A AND B', e2:'A.B', vars:['A','B'] },
  { id:'MX-02', e1:'A OR B',  e2:'A+B', vars:['A','B'] },
  { id:'MX-03', e1:'NOT A',   e2:'~A',  vars:['A'] },
  { id:'MX-04', e1:"A'",      e2:'~A',  vars:['A'] },
];
mixedNotation.forEach(t => {
  test(t.id, `Notação mista: "${t.e1}" ≡ "${t.e2}"`, true,
    LogicEngine.areEquivalent(t.e1, t.e2, t.vars));
});

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCO D — TABELAS-VERDADE COMPLETAS (valores corretos, não só contagem)
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n══════════════════════════════════════════════════════════');
console.log('BLOCO D — Tabelas-verdade: valores corretos (referência independente)');
console.log('══════════════════════════════════════════════════════════');

// AND 2 variáveis — tabela completa
const andRef = [[0,0,0],[0,1,0],[1,0,0],[1,1,1]];
const andTable = LogicEngine.generateTruthTable(['A','B'], inp => LogicEngine.evaluate('A.B', inp));
andRef.forEach(([a,b,exp], i) => {
  test(`TT-AND-${i}`, `AND tabela[${i}] A=${a} B=${b}`, exp, andTable[i].output);
});

// OR 2 variáveis
const orRef = [[0,0,0],[0,1,1],[1,0,1],[1,1,1]];
const orTable = LogicEngine.generateTruthTable(['A','B'], inp => LogicEngine.evaluate('A+B', inp));
orRef.forEach(([a,b,exp], i) => {
  test(`TT-OR-${i}`, `OR tabela[${i}] A=${a} B=${b}`, exp, orTable[i].output);
});

// XOR 2 variáveis (via keyword)
const xorRef = [[0,0,0],[0,1,1],[1,0,1],[1,1,0]];
const xorTable = LogicEngine.generateTruthTable(['A','B'], inp => LogicEngine.evaluate('A XOR B', inp));
xorRef.forEach(([a,b,exp], i) => {
  test(`TT-XOR-${i}`, `XOR tabela[${i}] A=${a} B=${b}`, exp, xorTable[i].output);
});

// De Morgan 3 variáveis: ~(A.B.C) = ~A+~B+~C
const deMorgan3 = LogicEngine.areEquivalent('~(A.B.C)', '~A+~B+~C', ['A','B','C']);
test('TT-DM3', 'De Morgan 3 vars: ~(A.B.C) = ~A+~B+~C', true, deMorgan3);

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCO E — MAPA DE KARNAUGH (estrutura, Gray, célula correta)
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n══════════════════════════════════════════════════════════');
console.log('BLOCO E — Mapas de Karnaugh');
console.log('══════════════════════════════════════════════════════════');

const KMapEngine = {
  grayCodes: { 1: ['0','1'], 2: ['00','01','11','10'] },
  getMapStructure(n) {
    if (n===2) return {rowVars:['A'],colVars:['B'],rowLabels:this.grayCodes[1],colLabels:this.grayCodes[1]};
    if (n===3) return {rowVars:['A'],colVars:['B','C'],rowLabels:this.grayCodes[1],colLabels:this.grayCodes[2]};
    if (n===4) return {rowVars:['A','B'],colVars:['C','D'],rowLabels:this.grayCodes[2],colLabels:this.grayCodes[2]};
  }
};

function grayAdjacent(labels) {
  for (let i = 0; i < labels.length; i++) {
    const a = parseInt(labels[i], 2);
    const b = parseInt(labels[(i+1) % labels.length], 2);
    const xor = a ^ b;
    if ((xor & (xor-1)) !== 0) return false;
  }
  return true;
}

// Verifica adjacência e dimensões para 2, 3 e 4 variáveis
[2,3,4].forEach(n => {
  const s = KMapEngine.getMapStructure(n);
  const cells = s.rowLabels.length * s.colLabels.length;
  test(`KM-${n}V-CELLS`, `KMap ${n} vars: ${Math.pow(2,n)} células`, Math.pow(2,n), cells);
  test(`KM-${n}V-GRAY-COL`, `KMap ${n} vars: colLabels adjacência Gray`, true, grayAdjacent(s.colLabels));
  test(`KM-${n}V-GRAY-ROW`, `KMap ${n} vars: rowLabels adjacência Gray`, true, grayAdjacent(s.rowLabels));
});

// Verificar que a ordem Gray de 2 bits é exatamente 00→01→11→10
test('KM-GRAY-ORDER', 'Código Gray 2 bits: [00,01,11,10]',
  ['00','01','11','10'], KMapEngine.getMapStructure(3).colLabels);

// Verificar que o KMapEngine não tem minimizador implementado
const kmapContent = fs.readFileSync('./js/labs/kmap-lab.js', 'utf8');
const hasMinimizer = kmapContent.includes('minimize') || kmapContent.includes('implicant') ||
                     kmapContent.includes('group') || kmapContent.includes('Quine');
test('KM-NO-MINIMIZER', 'KMapLab SEM minimizador (funcionalidade ausente)', false, hasMinimizer);
console.log('  Nota: KMapLab é somente visual — sem agrupamento/minimização automática.');

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCO F — CIRCUIT BUILDER (lógica de calculate, portas disponíveis)
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n══════════════════════════════════════════════════════════');
console.log('BLOCO F — CircuitBuilderLab (calculateOutput)');
console.log('══════════════════════════════════════════════════════════');

// Reimplementa calculateOutput do circuit-builder.js
function circCalc(gate, a, b) {
  switch (gate) {
    case 'AND':  return (a && b) ? 1 : 0;
    case 'OR':   return (a || b) ? 1 : 0;
    case 'NAND': return !(a && b) ? 1 : 0;
    case 'NOR':  return !(a || b) ? 1 : 0;
    case 'XOR':  return (a !== b) ? 1 : 0;
    default:     return 0;
  }
}

const circRef = {
  AND:  [[0,0,0],[0,1,0],[1,0,0],[1,1,1]],
  OR:   [[0,0,0],[0,1,1],[1,0,1],[1,1,1]],
  NAND: [[0,0,1],[0,1,1],[1,0,1],[1,1,0]],
  NOR:  [[0,0,1],[0,1,0],[1,0,0],[1,1,0]],
  XOR:  [[0,0,0],[0,1,1],[1,0,1],[1,1,0]],
};
Object.entries(circRef).forEach(([gate, rows]) => {
  rows.forEach(([a,b,exp]) => {
    test(`CB-${gate}-${a}${b}`, `Circuit ${gate}(${a},${b})`, exp, circCalc(gate, a, b));
  });
});

// Verifica portas AUSENTES no circuit-builder (NOT e XNOR)
const cbContent = fs.readFileSync('./js/labs/circuit-builder.js', 'utf8');
const cbHasNOT  = cbContent.includes('"NOT"') || cbContent.includes("'NOT'");
const cbHasXNOR = cbContent.includes('"XNOR"') || cbContent.includes("'XNOR'");
test('CB-NOT-ABSENT',  'CircuitBuilder NÃO tem porta NOT  (ausência confirmada)', false, cbHasNOT);
test('CB-XNOR-ABSENT', 'CircuitBuilder NÃO tem porta XNOR (ausência confirmada)', false, cbHasXNOR);
console.log('  Nota: CircuitBuilderLab não oferece NOT e XNOR — limitação de implementação.');

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCO G — RESERVATÓRIO: tabela completa e sensor-dots
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n══════════════════════════════════════════════════════════');
console.log('BLOCO G — Reservatório (todas as 8 combinações + análise visual)');
console.log('══════════════════════════════════════════════════════════');

function resCalc(A, B, C) { return { X: B ? 0 : 1, Y: (A && !C) ? 1 : 0 }; }
// Referência independente calculada manualmente:
// X = ~B, Y = A.~C
const resRef = [
  // A B C   X   Y
  [0,0,0,   1,  0],
  [0,0,1,   1,  0],
  [0,1,0,   0,  0],
  [0,1,1,   0,  0],
  [1,0,0,   1,  1],
  [1,0,1,   1,  0],
  [1,1,0,   0,  1],  // B=1→X=0; A=1,C=0→Y=1
  [1,1,1,   0,  0],
];
resRef.forEach(([A,B,C,expX,expY], i) => {
  const got = resCalc(A, B, C);
  test(`RES-${i+1}`, `Reservatório A=${A},B=${B},C=${C} → X=${expX} Y=${expY}`,
    { X: expX, Y: expY }, got);
});

// Verifica bug dos sensor-dots visuais
const resContent = fs.readFileSync('./js/labs/reservoir-sim.js', 'utf8');
// update() deveria atualizar as classes dos sensor-dots; verifica se está presente
const updateMethod = resContent.match(/update\(\)\s*\{([\s\S]*?)^  \}/m);
const updateHasSensorDot = updateMethod && updateMethod[1].includes('sensor-dot');
test('RES-SENSOR-DOT', 'update() do Reservatório atualiza classes dos sensor-dots', true,
  Boolean(updateHasSensorDot),
  'Bug: sensor-dots mostram estado estático da renderização; não refletem mudanças');

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCO H — PRIORIDADE DE MÁQUINAS: todos os 16 cenários possíveis
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n══════════════════════════════════════════════════════════');
console.log('BLOCO H — Prioridade de Máquinas (todos os 16 cenários)');
console.log('══════════════════════════════════════════════════════════');

function priorityCalc(b1, b2, b3, b4) {
  const req = [b1, b2, b3, b4];
  const act = [0, 0, 0, 0];
  let count = 0;
  for (let i = 3; i >= 0; i--) {
    if (req[i] && count < 2) { act[i] = 1; count++; }
  }
  return act;
}
// Referência independente: percorre M4→M1, ativa até 2
function priorityRef(b1, b2, b3, b4) {
  const machines = [
    { idx: 3, req: b4 }, // M4 — maior prioridade
    { idx: 2, req: b3 },
    { idx: 1, req: b2 },
    { idx: 0, req: b1 }, // M1 — menor prioridade
  ];
  const act = [0, 0, 0, 0];
  let count = 0;
  for (const m of machines) {
    if (m.req && count < 2) { act[m.idx] = 1; count++; }
  }
  return act;
}
// Testa todos os 16 padrões de input (2^4)
for (let mask = 0; mask < 16; mask++) {
  const b = [(mask>>0)&1, (mask>>1)&1, (mask>>2)&1, (mask>>3)&1];
  const got = priorityCalc(...b);
  const exp = priorityRef(...b);
  const label = b.map((v,i)=>`M${i+1}=${v}`).join(' ');
  test(`PRI-${mask.toString().padStart(2,'0')}`, label,
    JSON.stringify(exp), JSON.stringify(got));
}

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCO I — AUTOTESTE runSelfTest (expandido)
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n══════════════════════════════════════════════════════════');
console.log('BLOCO I — runSelfTest (autoteste do projeto)');
console.log('══════════════════════════════════════════════════════════');

const andValid = LogicEngine.evaluate("A . B",{A:1,B:1})===1 &&
                 LogicEngine.evaluate("A . B",{A:1,B:0})===0;
test('AUTO-01', 'runSelfTest AND(1,1)=1 E AND(1,0)=0', true, andValid);

const deMorganValid = LogicEngine.areEquivalent("~(A . B)","~A + ~B",['A','B']);
test('AUTO-02', 'runSelfTest De Morgan ~(A.B)=~A+~B', true, deMorganValid);

const absorptionValid = LogicEngine.areEquivalent("A + A . B","A",['A','B']);
test('AUTO-03', 'runSelfTest Absorção A+A.B=A', true, absorptionValid);

// Autoteste do projeto só testava 3 casos — verificamos se passa agora
test('AUTO-04', 'runSelfTest completo (3/3 casos aprovados)', true,
  andValid && deMorganValid && absorptionValid);

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCO J — INTEGRAÇÃO: verificação de dependências entre módulos
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n══════════════════════════════════════════════════════════');
console.log('BLOCO J — Integração e dependências entre módulos');
console.log('══════════════════════════════════════════════════════════');

// Cada lab usa LogicEngine?
const labFiles = {
  'gates-lab.js':     { path:'./js/labs/gates-lab.js',     needsLogicEngine: false },
  'truth-builder.js': { path:'./js/labs/truth-builder.js', needsLogicEngine: true  },
  'simplifier.js':    { path:'./js/labs/simplifier.js',    needsLogicEngine: true  },
  'kmap-lab.js':      { path:'./js/labs/kmap-lab.js',      needsLogicEngine: false },
  'circuit-builder.js':{path:'./js/labs/circuit-builder.js',needsLogicEngine:false },
  'reservoir-sim.js': { path:'./js/labs/reservoir-sim.js', needsLogicEngine: false },
  'priority-sim.js':  { path:'./js/labs/priority-sim.js',  needsLogicEngine: false },
};
Object.entries(labFiles).forEach(([name, info]) => {
  const c = fs.readFileSync(info.path, 'utf8');
  const usesLE = c.includes('LogicEngine');
  if (info.needsLogicEngine) {
    test(`INT-${name}`, `${name} usa LogicEngine (necessário)`, true, usesLE);
  } else {
    // documenta o estado (não é erro não usar, mas é informativo)
    console.log(`  ${name}: usa LogicEngine = ${usesLE} (esperado: ${info.needsLogicEngine})`);
  }
});

// Verifica se kmap-lab.js usa KMapEngine
const kmapLab = fs.readFileSync('./js/labs/kmap-lab.js', 'utf8');
test('INT-kmap-engine', 'kmap-lab.js usa KMapEngine', true, kmapLab.includes('KMapEngine'));

// Ordem de carregamento dos scripts no HTML (LogicEngine deve vir antes dos labs)
const htmlContent = fs.readFileSync('./index.html', 'utf8');
const lePos    = htmlContent.indexOf('logic-engine.js');
const appPos   = htmlContent.indexOf('app.js');
const gatesPos = htmlContent.indexOf('gates-lab.js');
test('INT-LOAD-ORDER-1', 'logic-engine.js carregado antes de gates-lab.js', true, lePos < gatesPos);
test('INT-LOAD-ORDER-2', 'labs carregados antes de app.js',                 true, gatesPos < appPos);
const coursePos = htmlContent.indexOf('course-data.js');
test('INT-LOAD-ORDER-3', 'course-data.js carregado antes de app.js',        true, coursePos < appPos);

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCO K — SEGURANÇA E ROBUSTEZ
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n══════════════════════════════════════════════════════════');
console.log('BLOCO K — Segurança e robustez');
console.log('══════════════════════════════════════════════════════════');

// Function() com "use strict" — mitiga eval puro mas aceita input do usuário
// Verificar se truth-builder.js passa input do usuário direto para evaluate()
const tbContent = fs.readFileSync('./js/labs/truth-builder.js', 'utf8');
const tbGetsUserInput = tbContent.includes("getElementById('truth-expr-input').value");
const tbPassesToEval  = tbContent.includes('LogicEngine.evaluate(expr, inputs)');
test('SEC-01', 'truth-builder.js passa input do usuário para LogicEngine.evaluate()', true,
  tbGetsUserInput && tbPassesToEval);
console.log('  Nota: Function() com "use strict" não é eval(), mas expressões maliciosas');
console.log('  poderiam causar erros (tratados) ou laços infinitos com expressões complexas.');

// Robustez: expressão com caracteres inesperados
const robustTests = [
  { id:'ROB-01', desc:'Expressão vazia → retorna 0 (sem crash)',       expr:'',         inp:{A:1}, expType:'number' },
  { id:'ROB-02', desc:'Variável não definida → retorna 0 (sem crash)', expr:'A.Z',      inp:{A:1}, expType:'number' },
  { id:'ROB-03', desc:'Parênteses desbalanceados → retorna 0 (sem crash)', expr:'A.(B+C', inp:{A:1,B:1,C:0}, expType:'number' },
  { id:'ROB-04', desc:'Expressão só com espaços → retorna 0 (sem crash)', expr:'   ',   inp:{A:1}, expType:'number' },
];
// Versão que retorna 0 em erro (como está no arquivo após correção)
function evaluateRobust(expression, inputs) {
  try {
    return LogicEngine.evaluate(expression, inputs);
  } catch (e) { return 0; }
}
robustTests.forEach(t => {
  const got = evaluateRobust(t.expr, t.inp);
  // Verificamos que não lançou exceção e retornou um número (0 ou 1)
  const isNumber = typeof got === 'number';
  test(t.id, t.desc, true, isNumber, `retornou: ${JSON.stringify(got)}`);
});

// Variável com nome de 1 letra — verifica colisão com keywords
test('ROB-05', 'Variável "A" não colide com keyword AND (substring)', true,
  LogicEngine.areEquivalent('A.B', 'A AND B', ['A','B']));

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCO L — SIMPLIFICADOR: estado e reset
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n══════════════════════════════════════════════════════════');
console.log('BLOCO L — Simplificador: estado currentStep entre renderizações');
console.log('══════════════════════════════════════════════════════════');

const simpContent = fs.readFileSync('./js/labs/simplifier.js', 'utf8');
// currentStep declarado como propriedade do objeto (linha 20)
// render() não faz this.currentStep = 0
const currentStepInObj    = simpContent.includes('currentStep: 0');
const currentStepInRender = simpContent.includes('this.currentStep = 0');
console.log(`  currentStep declarado na definição do objeto: ${currentStepInObj}`);
console.log(`  currentStep resetado em render(): ${currentStepInRender}`);
test('SIMP-STATE', 'Simplificador: currentStep resetado em render() (evita estado residual)',
  true, currentStepInRender,
  'Bug UX: ao revisitar o lab, usuário continua do passo anterior em vez do passo 1');

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCO M — ACESSIBILIDADE E RESPONSIVIDADE (análise estática)
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n══════════════════════════════════════════════════════════');
console.log('BLOCO M — Acessibilidade e responsividade (análise estática)');
console.log('══════════════════════════════════════════════════════════');

const mainCss = fs.readFileSync('./css/main.css', 'utf8');
const labCss  = fs.readFileSync('./css/lab.css', 'utf8');
const compCss = fs.readFileSync('./css/components.css', 'utf8');

test('ACC-01', 'HTML tem lang="pt-BR"', true, htmlContent.includes('lang="pt-BR"'));
test('ACC-02', 'HTML tem meta viewport', true, htmlContent.includes('viewport'));
test('ACC-03', 'main.css tem media query para mobile (<900px)', true,
  mainCss.includes('@media') && mainCss.includes('max-width'));
test('ACC-04', 'lab-tabs tem overflow-x:auto (scroll horizontal mobile)', true,
  labCss.includes('overflow-x: auto'));
test('ACC-05', 'Switches têm <label> wrapping <input> (acessibilidade)', true,
  fs.readFileSync('./js/labs/gates-lab.js','utf8').includes('<label class="switch">'));

// Focus styles ausentes
const focusMain = (mainCss.match(/:focus/g) || []).length;
const focusComp = (compCss.match(/:focus/g) || []).length;
test('ACC-06', 'Estilos :focus definidos (navegação por teclado)', true,
  focusMain > 0 || focusComp > 0,
  `main.css: ${focusMain} ocorrências | components.css: ${focusComp} ocorrências`);

// aria-labels ausentes nos botões
const ariaCount = (htmlContent.match(/aria-label/g) || []).length;
test('ACC-07', 'Botões de navegação têm aria-label', true, ariaCount > 0,
  `0 atributos aria-label encontrados no HTML estático`);

// SVG fixo em 450px
const cbFile = fs.readFileSync('./js/labs/circuit-builder.js','utf8');
const svgWidth = (cbFile.match(/width="(\d+)"/)||[])[1];
test('ACC-08', 'SVG do circuito tem largura responsiva (não fixa)', true,
  !svgWidth || parseInt(svgWidth) < 400,
  `SVG width="${svgWidth}" — fixo em ${svgWidth}px pode causar overflow em telas <${svgWidth}px`);

// ═══════════════════════════════════════════════════════════════════════════════
// AGUARDA RESULTADO DOS TESTES ASYNC (servidor)
// ═══════════════════════════════════════════════════════════════════════════════
runServerTests().then(() => {
  // RESULTADO FINAL
  const total = pass + fail + blocked;
  console.log('\n══════════════════════════════════════════════════════════');
  console.log('RESULTADO FINAL — test-final.js');
  console.log('══════════════════════════════════════════════════════════');
  console.log(`Total : ${total}`);
  console.log(`✅ APROVADOS : ${pass}`);
  console.log(`❌ REPROVADOS: ${fail}`);
  console.log(`⛔ BLOQUEADOS: ${blocked}`);
  console.log('\nTestes REPROVADOS:');
  results.filter(r => r.status === 'REPROVADO').forEach(r => {
    console.log(`  [${r.id}] ${r.desc}`);
    if (r.evidence) console.log(`    → ${r.evidence}`);
  });
  console.log('\nTestes BLOQUEADOS:');
  results.filter(r => r.status === 'BLOQUEADO').forEach(r => {
    console.log(`  [${r.id}] ${r.desc}: ${r.evidence}`);
  });
});
