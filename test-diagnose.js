/**
 * Diagnóstico dos bugs encontrados no LogicEngine
 */

// ── Bug 1: XOR keyword destruído pela substituição de OR ──────────────────────
console.log('=== BUG DIAGNÓSTICO: XOR keyword ===');
function applyTransforms(expr) {
  let s = expr;
  s = s.replace(/\s+/g, '');
  console.log('  1. Remove espaços:', s);
  s = s.replace(/AND|\./g, '&&');
  console.log('  2. AND/. → &&  :', s);
  s = s.replace(/OR|\+/g, '||');
  console.log('  3. OR/+ → ||   :', s);  // BUG: captura OR dentro de XOR
  s = s.replace(/XOR|\^/g, '!==');
  console.log('  4. XOR/^ → !== :', s);
  s = s.replace(/NOT|!/g, '!');
  console.log('  5. NOT/! → !   :', s);
  return s;
}

console.log('Expressão "A XOR B":');
applyTransforms('A XOR B');
// Resultado: 'A' + XOR se torna AX||RB - XOR nunca é reconhecido

// ── Bug 2: ~(A.B) — tilde não é convertida para ! antes de parênteses ─────────
console.log('\n=== BUG DIAGNÓSTICO: ~(expressão) — De Morgan ===');
let expr2 = '~(A.B)';
console.log('Expressão:', expr2);
let s2 = applyTransforms(expr2);
console.log('Após transforms:', s2);
// Agora substitui variáveis
let inp = {A:1, B:0};
Object.keys(inp).forEach(v => {
  const val = inp[v] ? 1 : 0;
  s2 = s2.replace(new RegExp('~' + v + '|' + v + "'", 'g'), val ? '0' : '1');
});
console.log('Após sub ~var:', s2);
Object.keys(inp).forEach(v => {
  const val = inp[v] ? 1 : 0;
  s2 = s2.replace(new RegExp('\\b' + v + '\\b', 'g'), val.toString());
});
console.log('Após sub var:', s2);
try {
  const r = Function('"use strict"; return (' + s2 + ') ? 1 : 0;')();
  console.log('Resultado:', r, '(esperado para A=1,B=0: ~(1&&0) = ~0 = 1)');
} catch(e) {
  console.log('ERRO na execução:', e.message, '| sanitized:', s2);
}

// ── Bug 3: dupla negação ~~A ──────────────────────────────────────────────────
console.log('\n=== BUG DIAGNÓSTICO: dupla negação ~~A ===');
let expr3 = '~~A';
console.log('Expressão:', expr3);
let s3 = applyTransforms(expr3);
console.log('Após transforms:', s3);
let inp3 = {A:1};
Object.keys(inp3).forEach(v => {
  const val = inp3[v] ? 1 : 0;
  s3 = s3.replace(new RegExp('~' + v + '|' + v + "'", 'g'), val ? '0' : '1');
});
console.log('Após sub ~var:', s3);
// ~ antes de letra substitui, mas ~ antes de ~ não é capturada
Object.keys(inp3).forEach(v => {
  const val = inp3[v] ? 1 : 0;
  s3 = s3.replace(new RegExp('\\b' + v + '\\b', 'g'), val.toString());
});
console.log('Após sub var:', s3);
try {
  const r = Function('"use strict"; return (' + s3 + ') ? 1 : 0;')();
  console.log('Resultado:', r, '(esperado para A=1: ~~1 = 1)');
} catch(e) {
  console.log('ERRO na execução:', e.message, '| sanitized:', s3);
}

// ── Teste da solução proposta ─────────────────────────────────────────────────
console.log('\n=== SOLUÇÃO PROPOSTA ===');
function evaluateFixed(expression, inputs) {
  let sanitized = expression
    .replace(/\s+/g, '')
    // Ordem crítica: XOR antes de OR para evitar captura errada
    .replace(/XNOR/g, '_XNOR_')
    .replace(/XOR/g, '_XOR_')
    .replace(/AND|\./g, '&&')
    .replace(/OR|\+/g, '||')
    .replace(/_XNOR_/g, '===')
    .replace(/_XOR_|\^/g, '!==')
    .replace(/NOT/g, '!')
    // ~ antes de parêntese ou de ~ precisa virar !
    .replace(/~/g, '!');

  Object.keys(inputs).forEach(varName => {
    const val = inputs[varName] ? 1 : 0;
    const regexNot = new RegExp(`~${varName}|${varName}'`, 'g');
    sanitized = sanitized.replace(regexNot, val ? '0' : '1');
  });

  Object.keys(inputs).forEach(varName => {
    const val = inputs[varName] ? 1 : 0;
    const regexVar = new RegExp('\\b' + varName + '\\b', 'g');
    sanitized = sanitized.replace(regexVar, val.toString());
  });

  try {
    return Function('"use strict"; return (' + sanitized + ') ? 1 : 0;')();
  } catch (e) {
    return { error: e.message, sanitized };
  }
}

// Mas há um problema na solução acima: ~ já foi convertida para ! antes de substituir ~var
// Solução correta: substituir ~var ANTES de converter ~ para !
function evaluateCorrect(expression, inputs) {
  let sanitized = expression
    .replace(/\s+/g, '')
    .replace(/XNOR/g, '___XNOR___')
    .replace(/XOR/g, '___XOR___')
    .replace(/AND/g, '&&')
    .replace(/OR/g, '||')
    .replace(/NOT/g, '!')
    .replace(/___XNOR___/g, '===')
    .replace(/___XOR___|\^/g, '!==')
    .replace(/\./g, '&&')
    .replace(/\+/g, '||');

  // Substitui ~var e var' ANTES de converter ~ para !
  Object.keys(inputs).forEach(varName => {
    const val = inputs[varName] ? 1 : 0;
    sanitized = sanitized.replace(new RegExp('~' + varName + '|' + varName + "'", 'g'), val ? '0' : '1');
  });

  // Converte ~ restante (que estava antes de parênteses ou ~) para !
  sanitized = sanitized.replace(/~/g, '!');

  // Substitui variáveis normais
  Object.keys(inputs).forEach(varName => {
    const val = inputs[varName] ? 1 : 0;
    sanitized = sanitized.replace(new RegExp('\\b' + varName + '\\b', 'g'), val.toString());
  });

  try {
    return Function('"use strict"; return (' + sanitized + ') ? 1 : 0;')();
  } catch (e) {
    return { error: e.message, sanitized };
  }
}

// Testes da solução corrigida
const testCases = [
  { expr: 'A XOR B', inp: {A:0,B:1}, exp: 1, desc: 'A XOR B (0,1)' },
  { expr: 'A XOR B', inp: {A:1,B:1}, exp: 0, desc: 'A XOR B (1,1)' },
  { expr: '~(A.B)',  inp: {A:1,B:1}, exp: 0, desc: '~(A.B) (1,1) — De Morgan LHS' },
  { expr: '~(A.B)',  inp: {A:1,B:0}, exp: 1, desc: '~(A.B) (1,0)' },
  { expr: '~A+~B',   inp: {A:1,B:1}, exp: 0, desc: '~A+~B (1,1) — De Morgan RHS' },
  { expr: '~A+~B',   inp: {A:1,B:0}, exp: 1, desc: '~A+~B (1,0)' },
  { expr: '~~A',     inp: {A:1},     exp: 1, desc: '~~A (A=1) — dupla negação' },
  { expr: '~~A',     inp: {A:0},     exp: 0, desc: '~~A (A=0)' },
  { expr: '~(A+B)',  inp: {A:0,B:0}, exp: 1, desc: '~(A+B) (0,0)' },
  { expr: '~A.~B',   inp: {A:0,B:0}, exp: 1, desc: '~A.~B (0,0)' },
  { expr: 'A . B',   inp: {A:1,B:1}, exp: 1, desc: 'A.B (1,1) não regrediu' },
  { expr: 'A + B',   inp: {A:0,B:1}, exp: 1, desc: 'A+B (0,1) não regrediu' },
  { expr: 'A XNOR B',inp: {A:1,B:1}, exp: 1, desc: 'A XNOR B (1,1)' },
  { expr: 'A XNOR B',inp: {A:1,B:0}, exp: 0, desc: 'A XNOR B (1,0)' },
];

let pass = 0, fail = 0;
testCases.forEach(t => {
  const got = evaluateCorrect(t.expr, t.inp);
  const ok = got === t.exp;
  if (ok) pass++; else fail++;
  console.log((ok ? '✅' : '❌') + ' ' + t.desc + ' → esperado=' + t.exp + ' obtido=' + got);
});
console.log('\nSolução corrigida: ' + pass + ' PASS, ' + fail + ' FAIL');

// Também verifica areEquivalent com a nova função
function areEquivalentFixed(expr1, expr2, variables) {
  const rowCount = Math.pow(2, variables.length);
  for (let i = 0; i < rowCount; i++) {
    const inputs = {};
    for (let j = 0; j < variables.length; j++) {
      inputs[variables[j]] = (i >> (variables.length - 1 - j)) & 1;
    }
    const v1 = evaluateCorrect(expr1, inputs);
    const v2 = evaluateCorrect(expr2, inputs);
    if (v1 !== v2) return false;
  }
  return true;
}

console.log('\n--- areEquivalent com solução corrigida ---');
console.log('~(A.B) = ~A+~B:', areEquivalentFixed('~(A.B)', '~A+~B', ['A','B']));
console.log('~(A+B) = ~A.~B:', areEquivalentFixed('~(A+B)', '~A.~B', ['A','B']));
console.log('~~A = A:        ', areEquivalentFixed('~~A', 'A', ['A']));
