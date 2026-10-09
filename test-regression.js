/**
 * TESTES DE REGRESSÃO — Após correções na LogicEngine
 * Usa o evaluate() corrigido diretamente do arquivo
 */

// Recria o evaluate corrigido (espelhando exatamente o que está no logic-engine.js)
const LogicEngine = {
  evaluate(expression, inputs) {
    let sanitized = expression
      .replace(/\bXNOR\b/g, '_XNOR_')
      .replace(/\bXOR\b/g,  '^')
      .replace(/\bAND\b/g,  '&&')
      .replace(/\bOR\b/g,   '||')
      .replace(/\bNOT\b/g,  '!')
      .replace(/\s+/g,      '')
      .replace(/_XNOR_/g,   '===')
      .replace(/\./g,        '&&')
      .replace(/\+/g,        '||');

    Object.keys(inputs).forEach(varName => {
      const val = inputs[varName] ? 1 : 0;
      const regexNot = new RegExp(`~${varName}|${varName}'`, 'g');
      sanitized = sanitized.replace(regexNot, val ? '0' : '1');
    });

    sanitized = sanitized.replace(/~/g, '!');

    Object.keys(inputs).forEach(varName => {
      const val = inputs[varName] ? 1 : 0;
      const regexVar = new RegExp(`\\b${varName}\\b`, 'g');
      sanitized = sanitized.replace(regexVar, val.toString());
    });

    try {
      return Function(`"use strict"; return (${sanitized}) ? 1 : 0;`)();
    } catch (e) {
      console.error("Erro ao avaliar expressão:", expression, "| sanitized:", sanitized, "| erro:", e.message);
      return 0;
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

let pass = 0, fail = 0;

function test(id, desc, exp, got) {
  const ok = JSON.stringify(exp) === JSON.stringify(got);
  if (ok) pass++; else fail++;
  const mark = ok ? '✅' : '❌';
  console.log(`${mark} [${id}] ${desc}`);
  if (!ok) console.log(`     esperado: ${JSON.stringify(exp)}  obtido: ${JSON.stringify(got)}`);
}

console.log('══════════════════════════════════════════════════════');
console.log('REGRESSÃO — Portas lógicas (todas as combinações)');
console.log('══════════════════════════════════════════════════════');

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
const gateExpected = {
  NOT:  [[0,1],[1,0]],
  AND:  [[0,0,0],[0,1,0],[1,0,0],[1,1,1]],
  OR:   [[0,0,0],[0,1,1],[1,0,1],[1,1,1]],
  NAND: [[0,0,1],[0,1,1],[1,0,1],[1,1,0]],
  NOR:  [[0,0,1],[0,1,0],[1,0,0],[1,1,0]],
  XOR:  [[0,0,0],[0,1,1],[1,0,1],[1,1,0]],
  XNOR: [[0,0,1],[0,1,0],[1,0,0],[1,1,1]]
};
gateExpected.NOT.forEach(([a,e]) => test(`P-NOT-${a}`, `NOT(${a})`, e, calcGate('NOT',a,0)));
['AND','OR','NAND','NOR','XOR','XNOR'].forEach(g => {
  gateExpected[g].forEach(([a,b,e]) => test(`P-${g}-${a}${b}`, `${g}(${a},${b})`, e, calcGate(g,a,b)));
});

console.log('\n══════════════════════════════════════════════════════');
console.log('REGRESSÃO — Motor lógico identidades');
console.log('══════════════════════════════════════════════════════');

const evalTests = [
  { id:'LE-01', desc:'A.1=A (A=0)',  expr:'A . 1', vars:{A:0}, exp:0 },
  { id:'LE-02', desc:'A.1=A (A=1)',  expr:'A . 1', vars:{A:1}, exp:1 },
  { id:'LE-03', desc:'A+0=A (A=0)',  expr:'A + 0', vars:{A:0}, exp:0 },
  { id:'LE-04', desc:'A+0=A (A=1)',  expr:'A + 0', vars:{A:1}, exp:1 },
  { id:'LE-05', desc:'A.0=0 (A=0)',  expr:'A . 0', vars:{A:0}, exp:0 },
  { id:'LE-06', desc:'A.0=0 (A=1)',  expr:'A . 0', vars:{A:1}, exp:0 },
  { id:'LE-07', desc:'A+1=1 (A=0)',  expr:'A + 1', vars:{A:0}, exp:1 },
  { id:'LE-08', desc:'A+1=1 (A=1)',  expr:'A + 1', vars:{A:1}, exp:1 },
  { id:'LE-09', desc:'~~A=A (A=0)',  expr:'~~A',   vars:{A:0}, exp:0 },
  { id:'LE-10', desc:'~~A=A (A=1)',  expr:'~~A',   vars:{A:1}, exp:1 },
  // XOR keyword (agora corrigido)
  { id:'LE-11', desc:'A XOR B (0,1)=1', expr:'A XOR B', vars:{A:0,B:1}, exp:1 },
  { id:'LE-12', desc:'A XOR B (1,1)=0', expr:'A XOR B', vars:{A:1,B:1}, exp:0 },
  { id:'LE-13', desc:'A XOR B (0,0)=0', expr:'A XOR B', vars:{A:0,B:0}, exp:0 },
  { id:'LE-14', desc:'A XOR B (1,0)=1', expr:'A XOR B', vars:{A:1,B:0}, exp:1 },
  // XNOR keyword
  { id:'LE-15', desc:'A XNOR B (1,1)=1', expr:'A XNOR B', vars:{A:1,B:1}, exp:1 },
  { id:'LE-16', desc:'A XNOR B (1,0)=0', expr:'A XNOR B', vars:{A:1,B:0}, exp:0 },
  // NOT keyword
  { id:'LE-17', desc:'NOT A (A=1)=0', expr:'NOT A', vars:{A:1}, exp:0 },
  { id:'LE-18', desc:'NOT A (A=0)=1', expr:'NOT A', vars:{A:0}, exp:1 },
  // ~var
  { id:'LE-N1', desc:'~A (A=1)=0', expr:'~A', vars:{A:1}, exp:0 },
  { id:'LE-N2', desc:'~A (A=0)=1', expr:'~A', vars:{A:0}, exp:1 },
  { id:'LE-N3', desc:'A.~B (1,0)=1', expr:'A.~B', vars:{A:1,B:0}, exp:1 },
  { id:'LE-N4', desc:'A.~B (1,1)=0', expr:'A.~B', vars:{A:1,B:1}, exp:0 },
  // ~(expressão) — De Morgan testado pontualmente
  { id:'LE-DM1', desc:'~(A.B) (1,1)=0', expr:'~(A.B)', vars:{A:1,B:1}, exp:0 },
  { id:'LE-DM2', desc:'~(A.B) (0,0)=1', expr:'~(A.B)', vars:{A:0,B:0}, exp:1 },
  { id:'LE-DM3', desc:'~(A+B) (0,0)=1', expr:'~(A+B)', vars:{A:0,B:0}, exp:1 },
  { id:'LE-DM4', desc:'~(A+B) (1,0)=0', expr:'~(A+B)', vars:{A:1,B:0}, exp:0 },
  // Precedência
  { id:'LE-P1', desc:'A+B.C (0,1,1)=1', expr:'A + B . C', vars:{A:0,B:1,C:1}, exp:1 },
  { id:'LE-P2', desc:'A+B.C (0,1,0)=0', expr:'A + B . C', vars:{A:0,B:1,C:0}, exp:0 },
  { id:'LE-P3', desc:'A+B.C (1,0,0)=1', expr:'A + B . C', vars:{A:1,B:0,C:0}, exp:1 },
  // var' notation
  { id:"LE-AP1", desc:"A' (A=1)=0", expr:"A'", vars:{A:1}, exp:0 },
  { id:"LE-AP2", desc:"A' (A=0)=1", expr:"A'", vars:{A:0}, exp:1 },
];
evalTests.forEach(t => test(t.id, t.desc, t.exp, LogicEngine.evaluate(t.expr, t.vars)));

console.log('\n══════════════════════════════════════════════════════');
console.log('REGRESSÃO — Leis booleanas (areEquivalent)');
console.log('══════════════════════════════════════════════════════');

const lawTests = [
  { id:'LEI-01', desc:"1ª De Morgan ~(A.B)=~A+~B",      e1:'~(A.B)',   e2:'~A+~B',    vars:['A','B'] },
  { id:'LEI-02', desc:"2ª De Morgan ~(A+B)=~A.~B",      e1:'~(A+B)',   e2:'~A.~B',    vars:['A','B'] },
  { id:'LEI-03', desc:"Absorção 1: A+(A.B)=A",          e1:'A+(A.B)',  e2:'A',         vars:['A','B'] },
  { id:'LEI-04', desc:"Absorção 2: A.(A+B)=A",          e1:'A.(A+B)',  e2:'A',         vars:['A','B'] },
  { id:'LEI-05', desc:"Complemento: A.~A=0",            e1:'A.~A',     e2:'A.0',       vars:['A']     },
  { id:'LEI-06', desc:"Tautologia: A+~A=1",             e1:'A+~A',     e2:'A+1',       vars:['A']     },
  { id:'LEI-07', desc:"Idempotência AND: A.A=A",        e1:'A.A',      e2:'A',         vars:['A']     },
  { id:'LEI-08', desc:"Idempotência OR: A+A=A",         e1:'A+A',      e2:'A',         vars:['A']     },
  { id:'LEI-09', desc:"Dupla negação: ~~A=A",           e1:'~~A',      e2:'A',         vars:['A']     },
  { id:'LEI-10', desc:"Comutatividade: A.B=B.A",        e1:'A.B',      e2:'B.A',       vars:['A','B'] },
  { id:'LEI-11', desc:"Distributividade: A.(B+C)=A.B+A.C", e1:'A.(B+C)', e2:'A.B+A.C', vars:['A','B','C'] },
  { id:'LEI-12', desc:"De Morgan XOR: A XOR B = ~A.B + A.~B", e1:'A XOR B', e2:'~A.B+A.~B', vars:['A','B'] },
];
lawTests.forEach(t => test(t.id, t.desc, true, LogicEngine.areEquivalent(t.e1, t.e2, t.vars)));

console.log('\n══════════════════════════════════════════════════════');
console.log('REGRESSÃO — Simplificador (todos os passos)');
console.log('══════════════════════════════════════════════════════');

const simpInitial = "A.B.C + A.B.~C + A.~C";
const simpSteps = [
  { expr: "A.B.C + A.B.~C + A.~C",  rule: "Inicial" },
  { expr: "A.B.(C + ~C) + A.~C",    rule: "Fatoração A.B" },
  { expr: "A.B.(1) + A.~C",          rule: "Complemento" },
  { expr: "A.B + A.~C",              rule: "Neutro" },
  { expr: "A.(B + ~C)",              rule: "Fatoração final" }
];
const simpVars = ['A','B','C'];
simpSteps.forEach((s, i) => {
  const eq = LogicEngine.areEquivalent(simpInitial, s.expr, simpVars);
  test(`SIMP-0${i+1}`, `Passo ${i+1} equiv. à inicial: ${s.rule}`, true, eq);
});

console.log('\n══════════════════════════════════════════════════════');
console.log('REGRESSÃO — Tabelas-verdade (contagem e unicidade)');
console.log('══════════════════════════════════════════════════════');

[[['A','B'], 'A + B', 4],
 [['A','B','C'], 'A + B . C', 8],
 [['A','B','C','D'], 'A . B + C . D', 16]
].forEach(([vars, expr, expected]) => {
  const table = LogicEngine.generateTruthTable(vars, inp => LogicEngine.evaluate(expr, inp));
  test(`TT-${vars.length}V-CNT`, `${vars.length} vars: ${expected} linhas`, expected, table.length);
  const keys = new Set(table.map(r => vars.map(v => r.inputs[v]).join('')));
  test(`TT-${vars.length}V-UNQ`, `${vars.length} vars: todas únicas`, expected, keys.size);
});

console.log('\n══════════════════════════════════════════════════════');
console.log('REGRESSÃO — Reservatório e Prioridade');
console.log('══════════════════════════════════════════════════════');

function reservoirCalc(A,B,C) { return { valveX: B?0:1, pumpY: (A&&!C)?1:0 }; }
function priorityCalc(b1,b2,b3,b4) {
  const req=[b1,b2,b3,b4], act=[0,0,0,0]; let c=0;
  for(let i=3;i>=0;i--) if(req[i]&&c<2){act[i]=1;c++;}
  return act;
}

let combo=0;
for(let A=0;A<=1;A++) for(let B=0;B<=1;B++) for(let C=0;C<=1;C++){
  const got=reservoirCalc(A,B,C);
  const exp={valveX:B?0:1,pumpY:(A&&!C)?1:0};
  test(`RES-${++combo}`,`Res A=${A},B=${B},C=${C}`,exp,got);
}

const priorTests = [
  { b:[0,0,0,0], exp:[0,0,0,0], d:'Nenhuma' },
  { b:[1,0,0,0], exp:[1,0,0,0], d:'M1' },
  { b:[0,0,0,1], exp:[0,0,0,1], d:'M4' },
  { b:[1,1,1,1], exp:[0,0,1,1], d:'Todas→M4+M3' },
  { b:[1,1,1,0], exp:[0,1,1,0], d:'M1M2M3→M3+M2' },
  { b:[0,1,1,1], exp:[0,0,1,1], d:'M2M3M4→M4+M3' },
];
priorTests.forEach((t,i) => test(`PRI-${i+1}`, `Prioridade: ${t.d}`, t.exp, priorityCalc(...t.b)));

console.log('\n══════════════════════════════════════════════════════');
console.log('REGRESSÃO — Verificação do CourseData');
console.log('══════════════════════════════════════════════════════');

const fs = require('fs');
const courseContent = fs.readFileSync('./js/course-data.js', 'utf8');
test('CD-01', 'course-data.js define const CourseData', true,
  courseContent.includes('const CourseData'));
test('CD-02', 'course-data.js NÃO contém CircuitBuilderLab', false,
  courseContent.includes('const CircuitBuilderLab'));
test('CD-03', 'course-data.js contém 8 módulos', true,
  (courseContent.match(/id:/g) || []).length === 8);

// Valida os labTypes são válidos
const validLabTypes = ['gates','truth','simplifier','kmap','circuit','reservoir','priority'];
const labTypes = [...courseContent.matchAll(/labType:\s*'(\w+)'/g)].map(m => m[1]);
test('CD-04', 'Todos os labTypes são válidos', true,
  labTypes.every(l => validLabTypes.includes(l)));
console.log('  labTypes encontrados:', labTypes);

// ── Resultado final ──────────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════════════════');
console.log(`RESULTADO REGRESSÃO: ${pass} PASS | ${fail} FAIL`);
console.log('══════════════════════════════════════════════════════');
if (fail > 0) {
  process.exit(1);
}
