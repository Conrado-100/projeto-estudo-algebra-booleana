/**
 * Motor de Minimização do Mapa de Karnaugh
 * Totalmente Sincronizado com a Notação Acadêmica do Professor:
 * - 4 Variáveis:
 *   • Linhas:  A (linhas 2 e 3) e C (linhas 1 e 2)
 *   • Colunas: B (colunas 2 e 3) e D (colunas 1 e 2)
 * - 3 Variáveis: Linhas (A) e Colunas (B, C)
 * - 2 Variáveis: Linhas (A) e Colunas (B)
 */
const KMapEngine = {
  getMapStructure(numVars) {
    if (numVars === 2) {
      return { rowLabels: ['0', '1'], colLabels: ['0', '1'] };
    } else if (numVars === 3) {
      return { rowLabels: ['0', '1'], colLabels: ['00', '01', '11', '10'] };
    } else {
      return {
        rowLabels: ['00', '01', '11', '10'],
        colLabels: ['00', '01', '11', '10']
      };
    }
  },

  /**
   * Converte a coordenada da célula (rIdx, cIdx) no valor binário exato ABCD (0 a 15)
   */
  getMintermIndex(numVars, rIdx, cIdx) {
    if (numVars === 2) {
      const a = rIdx === 1 ? 1 : 0;
      const b = cIdx === 1 ? 1 : 0;
      return (a << 1) | b; // String binária: AB
    } else if (numVars === 3) {
      const a = rIdx === 1 ? 1 : 0;
      const b = (cIdx === 2 || cIdx === 3) ? 1 : 0;
      const c = (cIdx === 1 || cIdx === 2) ? 1 : 0;
      return (a << 2) | (b << 1) | c; // String binária: ABC
    } else {
      // 4 Variáveis: A (rIdx 2,3), B (cIdx 2,3), C (rIdx 1,2), D (cIdx 1,2)
      const a = (rIdx === 2 || rIdx === 3) ? 1 : 0;
      const b = (cIdx === 2 || cIdx === 3) ? 1 : 0;
      const c = (rIdx === 1 || rIdx === 2) ? 1 : 0;
      const d = (cIdx === 1 || cIdx === 2) ? 1 : 0;
      return (a << 3) | (b << 2) | (c << 1) | d; // String binária: ABCD
    }
  },

  /**
   * Executa a minimização lógica retornando a expressão simplificada
   */
  minimizeMap(numVars, cellValues) {
    const activeMinterms = [];
    const totalCells = Math.pow(2, numVars);

    Object.keys(cellValues).forEach(key => {
      if (cellValues[key] === 1) {
        const [rIdx, cIdx] = key.split('_').map(Number);
        const mIdx = this.getMintermIndex(numVars, rIdx, cIdx);
        if (!activeMinterms.includes(mIdx)) {
          activeMinterms.push(mIdx);
        }
      }
    });

    if (activeMinterms.length === 0) return "0";
    if (activeMinterms.length === totalCells) return "1";

    return this.quineMcCluskey(numVars, activeMinterms);
  },

  /**
   * Algoritmo de Quine-McCluskey para redução exata das expressões booleanas
   */
  quineMcCluskey(numVars, minterms) {
    const varNames = numVars === 2 ? ['A', 'B'] : (numVars === 3 ? ['A', 'B', 'C'] : ['A', 'B', 'C', 'D']);
    
    let terms = minterms.map(m => m.toString(2).padStart(numVars, '0'));
    let primeImplicants = new Set();

    while (terms.length > 0) {
      let nextTerms = new Set();
      let used = new Array(terms.length).fill(false);

      for (let i = 0; i < terms.length; i++) {
        for (let j = i + 1; j < terms.length; j++) {
          let diffCount = 0;
          let diffIndex = -1;

          for (let k = 0; k < numVars; k++) {
            if (terms[i][k] !== terms[j][k]) {
              diffCount++;
              diffIndex = k;
            }
          }

          if (diffCount === 1) {
            let combined = terms[i].substring(0, diffIndex) + '-' + terms[i].substring(diffIndex + 1);
            nextTerms.add(combined);
            used[i] = true;
            used[j] = true;
          }
        }
      }

      for (let i = 0; i < terms.length; i++) {
        if (!used[i]) {
          primeImplicants.add(terms[i]);
        }
      }

      terms = Array.from(nextTerms);
    }

    const formattedTerms = Array.from(primeImplicants).map(term => {
      let str = '';
      for (let i = 0; i < numVars; i++) {
        if (term[i] === '1') str += varNames[i];
        else if (term[i] === '0') str += varNames[i] + '̄';
      }
      return str || '1';
    });

    return formattedTerms.join(' + ');
  }
};