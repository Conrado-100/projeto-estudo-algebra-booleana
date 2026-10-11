"use strict";
/**
 * Testes para a Etapa B do ProjectsLab.
 *
 * O KMapEngine 4-var usa:
 *   Linhas (rIdx 0-3): código Gray 00,01,11,10  → bits AB (A=MSB, C=bit interno)
 *     rIdx=0 → rowCode=00 → A=0,C=0
 *     rIdx=1 → rowCode=01 → A=0,C=1
 *     rIdx=2 → rowCode=11 → A=1,C=1
 *     rIdx=3 → rowCode=10 → A=1,C=0
 *   Colunas (cIdx 0-3): código Gray 00,01,11,10 → bits CD (B=MSB, D=bit interno)
 *     cIdx=0 → colCode=00 → B=0,D=0
 *     cIdx=1 → colCode=01 → B=0,D=1
 *     cIdx=2 → colCode=11 → B=1,D=1
 *     cIdx=3 → colCode=10 → B=1,D=0
 *
 * getMintermIndex(4, rIdx, cIdx):
 *   A=(rIdx∈{2,3}), B=(cIdx∈{2,3}), C=(rIdx∈{1,2}), D=(cIdx∈{1,2})
 *   índice = A<<3 | B<<2 | C<<1 | D
 *
 * Para os projetos, as variáveis de entrada não são ABCD genéricas,
 * mas o KMapEngine trata os 4 bits como posições fixas.
 * A variável proj.inputs[0] mapeia para o bit A (MSB), inputs[1]→B, inputs[2]→C, inputs[3]→D.
 * Isso é consistente com _buildAnswer() que usa (i >> (3-idx)) & 1.
 *
 * Portanto: mintermIndex do KMap = índice da tabela-verdade.
 * A função de conversão (rIdx,cIdx) → mintermIndex já existe em KMapEngine.getMintermIndex.
 * A direção inversa (mintermIndex → rIdx, cIdx) precisamos calcular.
 */

// Replica getMintermIndex do KMapEngine
function getMintermIndex(rIdx, cIdx) {
  const a = (rIdx === 2 || rIdx === 3) ? 1 : 0;
  const b = (cIdx === 2 || cIdx === 3) ? 1 : 0;
  const c = (rIdx === 1 || rIdx === 2) ? 1 : 0;
  const d = (cIdx === 1 || cIdx === 2) ? 1 : 0;
  return (a << 3) | (b << 2) | (c << 1) | d;
}

// Mapa inverso: mintermIndex → {rIdx, cIdx}
const mintermToCell = new Array(16);
for (let r = 0; r < 4; r++) {
  for (let c = 0; c < 4; c++) {
    mintermToCell[getMintermIndex(r, c)] = { rIdx: r, cIdx: c };
  }
}

console.log('=== Mapa KMap: mintermIndex → (rIdx, cIdx) ===');
mintermToCell.forEach((cell, idx) => {
  console.log(`  mintermo ${String(idx).padStart(2)}: rIdx=${cell.rIdx}, cIdx=${cell.cIdx}`);
});

// Verifica que o mapeamento é bijetivo (sem colisões)
const seen = new Set(mintermToCell.map(c => `${c.rIdx}_${c.cIdx}`));
console.log(`\nMapeamento bijetivo: ${seen.size === 16 ? '✅ OK (16 células únicas)' : '❌ COLISÃO!'}`);

// ── Teste: gabaritos da Etapa B para os 9 pares projeto:saída ───────────────
// Para cada saída, converte o array de 16 resultados em cellValues {rIdx_cIdx: 0|1}
// e depois usa quineMcCluskey para minimizar.

// Avaliadores (cópia dos evaluators do projects-lab.js)
const evals = {
  // Estufa (T=i3, U=i2, C=i1, F=i0)
  'estufa:V': i => { const T=(i>>3)&1,U=(i>>2)&1,C=(i>>1)&1,F=i&1; return T&(~C&1)&(~F&1); },
  'estufa:N': i => { const T=(i>>3)&1,U=(i>>2)&1,C=(i>>1)&1,F=i&1; return ((U&(~C&1))|F)&1; },
  'estufa:A': i => { const T=(i>>3)&1,U=(i>>2)&1,C=(i>>1)&1,F=i&1; return T&U&(~C&1); },
  // Prensa (B1=i3, B2=i2, O=i1, I=i0)
  'prensa:A': i => { const B1=(i>>3)&1,B2=(i>>2)&1,O=(i>>1)&1,I=i&1; return B1&B2&I&(~O&1); },
  'prensa:L': i => { const B1=(i>>3)&1,B2=(i>>2)&1,O=(i>>1)&1,I=i&1; return I&(~O&1)&(~B1&1)&(~B2&1); },
  'prensa:W': i => { const B1=(i>>3)&1,B2=(i>>2)&1,O=(i>>1)&1,I=i&1; return O&((B1|B2)&1); },
  // Solar (U=i3, H=i2, L=i1, P=i0)
  'solar:B':  i => { const U=(i>>3)&1,H=(i>>2)&1,L=(i>>1)&1,P=i&1; return U&(~H&1); },
  'solar:G':  i => { const U=(i>>3)&1,H=(i>>2)&1,L=(i>>1)&1,P=i&1; return (L|(P&(~U&1)))&1; },
  'solar:D':  i => { const U=(i>>3)&1,H=(i>>2)&1,L=(i>>1)&1,P=i&1; return P&(~H&1)&(~L&1)&(~U&1); }
};

// Quine-McCluskey (mesma implementação do KMapEngine)
function quineMcCluskey(numVars, minterms) {
  let terms = minterms.map(m => m.toString(2).padStart(numVars, '0'));
  let primeImplicants = new Set();
  while (terms.length > 0) {
    let nextTerms = new Set();
    let used = new Array(terms.length).fill(false);
    for (let i = 0; i < terms.length; i++) {
      for (let j = i + 1; j < terms.length; j++) {
        let diffCount = 0, diffIndex = -1;
        for (let k = 0; k < numVars; k++) {
          if (terms[i][k] !== terms[j][k]) { diffCount++; diffIndex = k; }
        }
        if (diffCount === 1) {
          let combined = terms[i].substring(0, diffIndex) + '-' + terms[i].substring(diffIndex + 1);
          nextTerms.add(combined); used[i] = true; used[j] = true;
        }
      }
    }
    for (let i = 0; i < terms.length; i++) if (!used[i]) primeImplicants.add(terms[i]);
    terms = Array.from(nextTerms);
  }
  return Array.from(primeImplicants);
}

console.log('\n=== Gabaritos KMap e minimizações ===');
const results = {};
Object.entries(evals).forEach(([key, evalFn]) => {
  const minterms = [];
  const cellValues = {};
  for (let i = 0; i < 16; i++) {
    const val = evalFn(i) & 1;
    if (val === 1) minterms.push(i);
    const { rIdx, cIdx } = mintermToCell[i];
    cellValues[`${rIdx}_${cIdx}`] = val;
  }
  const implicants = quineMcCluskey(4, minterms);
  results[key] = { minterms, cellValues, implicants };
  console.log(`\n${key}: minterms=[${minterms.join(',')}]`);
  console.log(`  implicantes primos: ${implicants.length > 0 ? implicants.join(' | ') : '(nenhum — função = 0)'}`);
});

// ── Teste: construção do cellValues a partir do array de 16 resultados ───────
console.log('\n=== Verificação da conversão array→cellValues ===');
// Para estufa:V, os mintermos são 8 (1000) e 12 (1100)
const answerV = Array.from({length:16}, (_,i) => evals['estufa:V'](i)&1);
const cvV = {};
for (let i = 0; i < 16; i++) {
  const {rIdx, cIdx} = mintermToCell[i];
  cvV[`${rIdx}_${cIdx}`] = answerV[i];
}
const activeV = Object.entries(cvV).filter(([,v]) => v===1).map(([k]) => k);
console.log(`estufa:V células ativas: ${activeV.join(', ')}`);
// mintermo 8 = ABCD=1000 → A=1,B=0,C=0,D=0 → rIdx onde A=1,C=0 → rIdx=3; cIdx onde B=0,D=0 → cIdx=0 → "3_0"
// mintermo 12 = ABCD=1100 → A=1,B=1,C=0,D=0 → rIdx=3; cIdx onde B=1,D=0 → cIdx=3 → "3_3"
const expectedV = ['3_0','3_3'].sort().join(',');
const gotV = activeV.sort().join(',');
console.log(`Esperado: ${expectedV} | Obtido: ${gotV}`);
console.log(expectedV === gotV ? '✅ Correto' : '❌ Errado!');

// ── Teste: verificação célula a célula (userKmap vs gabarito) ────────────────
console.log('\n=== Simulação de verificação do KMap ===');
// Estudante preenche tudo zero para estufa:V (2 erros esperados)
const userKmapAllZero = {};
for (let r=0;r<4;r++) for (let c=0;c<4;c++) userKmapAllZero[`${r}_${c}`]=0;
const ansKmapV = results['estufa:V'].cellValues;
let kmapErrors = 0;
for (const k of Object.keys(ansKmapV)) {
  if (userKmapAllZero[k] !== ansKmapV[k]) kmapErrors++;
}
console.log(`estufa:V: erros com tudo zero = ${kmapErrors} (esperado 2)`);
console.log(kmapErrors === 2 ? '✅' : '❌');

// Estudante acerta tudo para prensa:W (6 mintermos)
const userKmapW = {};
for (let r=0;r<4;r++) for (let c=0;c<4;c++) userKmapW[`${r}_${c}`]=0;
results['prensa:W'].minterms.forEach(m => {
  const {rIdx,cIdx} = mintermToCell[m];
  userKmapW[`${rIdx}_${cIdx}`] = 1;
});
const ansKmapW = results['prensa:W'].cellValues;
let kmapErrorsW = 0;
for (const k of Object.keys(ansKmapW)) {
  if (userKmapW[k] !== ansKmapW[k]) kmapErrorsW++;
}
console.log(`prensa:W: erros com resposta correta = ${kmapErrorsW} (esperado 0)`);
console.log(kmapErrorsW === 0 ? '✅' : '❌');

console.log('\n✅ Todos os testes concluídos.');
