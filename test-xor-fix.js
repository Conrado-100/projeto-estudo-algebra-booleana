'use strict';
// Testa a correção do bug XOR encadeado
// Solução: envolver o valor de cada variável com parênteses (val) → garante tipo numérico
// Assim: A XOR B XOR C → (1)!==(1)!==(0) → 1!==1 → false!==0 ← ainda boolean vs number...
// Precisa de outra abordagem.

// A solução robusta: substituir !== por uma expressão que mantém número:
// A XOR B → (((A)-(B))!==0) ? 1 : 0 ... não, pois há encadeamento
// Melhor: adicionar conversão explícita com !!() ou +()
// Para expressão inteira: wrapping de cada lado com +() antes da operação

// Alternativa definitiva: converter XOR para forma equivalente sem !== 
// A XOR B = (A + B) % 2  (aritmético, funciona para binário)
// Mas temos que manter a expressão JS...

// Abordagem: converter !==  para (a+b)%2 não trivial para parser regex

// Abordagem prática e mínima: forçar resultado de !==  para número
// using ternário inline: (A)!==(B) ? 1 : 0
// Mas isso não funciona encadeado: ((A)!==(B)?1:0)!==(C)?1:0 ainda mistura tipos

// SOLUÇÃO CORRETA: converter XOR para operação de aritmética módulo 2
// XOR booleano: A ^ B = (A + B) mod 2
// Para o engine: em vez de !== usar +(A)^+(B) que é XOR bit a bit de inteiros 0/1

// Testa com ^ bitwise (que é XOR de inteiros 0/1):
// 'A XOR B XOR C' → '+A^+B^+C'
function evaluateFixed(expression, inputs) {
  let sanitized = expression
    .replace(/\bXNOR\b/g, '_XNOR_')  // protege XNOR
    .replace(/\bXOR\b/g,  '^')        // XOR → ^ (bitwise, funciona para 0/1)
    .replace(/\bAND\b/g,  '&&')
    .replace(/\bOR\b/g,   '||')
    .replace(/\bNOT\b/g,  '!')
    .replace(/\s+/g,      '')
    .replace(/\./g,       '&&')
    .replace(/\+/g,       '||')
    // XNOR: !(A^B) mas precisamos 0/1 → (A^B)===0
    .replace(/_XNOR_/g,   '_XNOR_');

  // Para XNOR: A _XNOR_ B → !(A^B) ou (A===B)
  // Vamos deixar === mas garantir que A e B sejam números
  sanitized = sanitized.replace(/_XNOR_/g, '===');

  Object.keys(inputs).forEach(v => {
    const val = inputs[v] ? 1 : 0;
    sanitized = sanitized.replace(new RegExp('~' + v + '|' + v + "'", 'g'), val ? '0' : '1');
  });
  sanitized = sanitized.replace(/~/g, '!');
  Object.keys(inputs).forEach(v => {
    const val = inputs[v] ? 1 : 0;
    sanitized = sanitized.replace(new RegExp('\\b' + v + '\\b', 'g'), val.toString());
  });
  try {
    return Function('"use strict"; return (' + sanitized + ') ? 1 : 0;')();
  } catch(e) {
    return 0;
  }
}

let pass = 0, fail = 0;
function chk(desc, exp, got) {
  const ok = exp === got;
  if (ok) pass++; else fail++;
  console.log((ok?'✅':'❌') + ' ' + desc + ' → exp=' + exp + ' got=' + got);
}

console.log('=== XOR encadeado (novo fix: ^ bitwise) ===');
for(let A=0;A<=1;A++) for(let B=0;B<=1;B++) for(let C=0;C<=1;C++){
  const got = evaluateFixed('A XOR B XOR C', {A,B,C});
  const exp = ((A^B^C)!==0) ? 1 : 0;
  chk('A XOR B XOR C A='+A+' B='+B+' C='+C, exp, got);
}

console.log('\n=== XOR 2 variáveis ===');
[[0,0,0],[0,1,1],[1,0,1],[1,1,0]].forEach(([a,b,e]) => {
  chk('A XOR B ('+a+','+b+')', e, evaluateFixed('A XOR B', {A:a,B:b}));
});

console.log('\n=== XNOR ===');
[[0,0,1],[0,1,0],[1,0,0],[1,1,1]].forEach(([a,b,e]) => {
  chk('A XNOR B ('+a+','+b+')', e, evaluateFixed('A XNOR B', {A:a,B:b}));
});

console.log('\n=== AND/OR/NOT/NÃO REGRESSÃO ===');
[
  ['A.B', {A:1,B:1}, 1], ['A.B', {A:1,B:0}, 0],
  ['A+B', {A:0,B:0}, 0], ['A+B', {A:0,B:1}, 1],
  ['~A',  {A:1},     0], ['~A',  {A:0},     1],
  ['~~A', {A:1},     1], ['~~A', {A:0},     0],
  ['~(A.B)', {A:1,B:1}, 0], ['~(A.B)', {A:0,B:0}, 1],
  ['~(A+B)', {A:0,B:0}, 1], ['~(A+B)', {A:1,B:0}, 0],
  ['A.~B', {A:1,B:0}, 1],   ['A.~B', {A:1,B:1}, 0],
  ["A'", {A:1}, 0], ["A'", {A:0}, 1],
  ['A+B.C', {A:0,B:1,C:1}, 1], ['A+B.C', {A:0,B:1,C:0}, 0],
  ['A AND B', {A:1,B:1}, 1],
  ['A OR B',  {A:0,B:1}, 1],
  ['NOT A',   {A:1},     0],
].forEach(([e,i,x]) => {
  chk(e + ' ' + JSON.stringify(i), x, evaluateFixed(e, i));
});

console.log('\n=== LEIS BOOLEANAS (areEquivalent com novo evaluate) ===');
function areEq(e1, e2, vars) {
  const n = vars.length;
  for (let i = 0; i < Math.pow(2,n); i++) {
    const inp = {};
    for (let j = 0; j < n; j++) inp[vars[j]] = (i>>(n-1-j))&1;
    if (evaluateFixed(e1,inp) !== evaluateFixed(e2,inp)) return false;
  }
  return true;
}
[
  ['~(A.B)', '~A+~B', ['A','B'], 'De Morgan 1'],
  ['~(A+B)', '~A.~B', ['A','B'], 'De Morgan 2'],
  ['A+(A.B)', 'A', ['A','B'], 'Absorção 1'],
  ['A.(A+B)', 'A', ['A','B'], 'Absorção 2'],
  ['~~A', 'A', ['A'], 'Dupla negação'],
  ['A XOR B', '~A.B+A.~B', ['A','B'], 'XOR via AND/OR'],
].forEach(([e1,e2,v,d]) => {
  chk('Lei: ' + d, true, areEq(e1,e2,v));
});

console.log('\n=== RESULTADO: ' + pass + ' PASS | ' + fail + ' FAIL ===');
