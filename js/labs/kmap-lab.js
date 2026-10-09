/**
 * Laboratório do Mapa de Karnaugh Interativo com Minimização Automática
 *
 * Algoritmo de minimização:
 *  1. Identifica mintermos (células com valor 1).
 *  2. Busca grupos válidos (potências de 2: 1, 2, 4, 8) que sejam retangulares
 *     na grade Gray, inclusive com wrap-around nas bordas.
 *  3. Seleciona os implicantes primos essenciais (cobertura mínima greedy).
 *  4. Converte cada implicante em um termo do produto (AND).
 *  5. Monta a expressão SOP (OR dos termos).
 *  6. Valida a equivalência com LogicEngine.areEquivalent().
 */
const KMapLab = {
  numVars: 3,
  cellValues: {},

  render(container) {
    container.innerHTML = `
      <div class="card-box">
        <h2 class="card-title">Mapa de Karnaugh Interativo</h2>
        <p>Clique nas células do mapa para alternar entre 0 e 1. A expressão minimizada é calculada automaticamente.</p>

        <div style="margin: 1rem 0;">
          <label><strong>Dimensão do Mapa:</strong></label>
          <select id="kmap-vars-select" class="btn-action" style="background-color: var(--bg-dark); color: #fff;">
            <option value="2">2 Variáveis (2×2)</option>
            <option value="3" selected>3 Variáveis (2×4)</option>
            <option value="4">4 Variáveis (4×4)</option>
          </select>
        </div>

        <div id="kmap-grid-container"></div>

        <div id="kmap-result" style="margin-top: 1.5rem;"></div>
      </div>
    `;

    document.getElementById('kmap-vars-select').addEventListener('change', (e) => {
      this.numVars = parseInt(e.target.value);
      this.cellValues = {};
      this.renderGrid();
    });

    this.renderGrid();
  },

  renderGrid() {
    const struct = KMapEngine.getMapStructure(this.numVars);
    let html = `<div class="kmap-grid" style="grid-template-columns: auto repeat(${struct.colLabels.length}, 52px);">`;

    // Cabeçalho superior esquerdo
    html += `<div class="kmap-cell kmap-header-cell" style="font-size:0.75rem;">${struct.rowVars.join('')}\\${struct.colVars.join('')}</div>`;

    // Cabeçalhos de coluna (Código de Gray)
    struct.colLabels.forEach(col => {
      html += `<div class="kmap-cell kmap-header-cell">${col}</div>`;
    });

    // Linhas do mapa
    struct.rowLabels.forEach((row, rIdx) => {
      html += `<div class="kmap-cell kmap-header-cell">${row}</div>`;
      struct.colLabels.forEach((col, cIdx) => {
        const key = `${rIdx}_${cIdx}`;
        if (this.cellValues[key] === undefined) this.cellValues[key] = 0;
        const val = this.cellValues[key];
        html += `<div class="kmap-cell ${val ? 'kmap-cell-one' : ''}" data-key="${key}" style="cursor:pointer; font-size:1.1rem;">${val}</div>`;
      });
    });

    html += `</div>`;
    document.getElementById('kmap-grid-container').innerHTML = html;

    // Eventos de clique nas células
    document.querySelectorAll('.kmap-cell[data-key]').forEach(cell => {
      cell.addEventListener('click', (e) => {
        const key = e.target.getAttribute('data-key');
        this.cellValues[key] = this.cellValues[key] === 0 ? 1 : 0;
        e.target.innerText = this.cellValues[key];
        e.target.classList.toggle('kmap-cell-one', this.cellValues[key] === 1);
        this.minimize();
      });
    });

    this.minimize();
  },

  // ── Minimização automática ────────────────────────────────────────────────

  /**
   * Converte a grade (row, col) para índice de minterm canônico.
   * A ordem das variáveis segue rowVars + colVars, com código Gray.
   *
   * Exemplo 3 vars (A | BC):
   *   row 0 (A=0), col 00 (B=0,C=0) → minterm 0  (A=0,B=0,C=0)
   *   row 0 (A=0), col 01 (B=0,C=1) → minterm 1
   *   row 0 (A=0), col 11 (B=1,C=1) → minterm 3
   *   row 0 (A=0), col 10 (B=1,C=0) → minterm 2
   */
  cellToMinterm(rIdx, cIdx) {
    const struct = KMapEngine.getMapStructure(this.numVars);
    const rowBits = struct.rowLabels[rIdx].split('').map(Number);
    const colBits = struct.colLabels[cIdx].split('').map(Number);
    const bits = [...rowBits, ...colBits];
    return bits.reduce((acc, b) => (acc << 1) | b, 0);
  },

  /**
   * Converte índice de minterm para objeto {varName: value}.
   * Usa a ordem rowVars + colVars.
   */
  mintermToInputs(mt) {
    const struct = KMapEngine.getMapStructure(this.numVars);
    const vars = [...struct.rowVars, ...struct.colVars];
    const inputs = {};
    for (let i = 0; i < vars.length; i++) {
      inputs[vars[i]] = (mt >> (vars.length - 1 - i)) & 1;
    }
    return inputs;
  },

  /**
   * Retorna todos os mintermos cujo cellValues é 1.
   */
  getMinterms() {
    const struct = KMapEngine.getMapStructure(this.numVars);
    const minterms = new Set();
    struct.rowLabels.forEach((_, rIdx) => {
      struct.colLabels.forEach((_, cIdx) => {
        const key = `${rIdx}_${cIdx}`;
        if ((this.cellValues[key] || 0) === 1) {
          minterms.add(this.cellToMinterm(rIdx, cIdx));
        }
      });
    });
    return minterms;
  },

  /**
   * Encontra todos os grupos válidos no mapa.
   * Um grupo válido é um conjunto de células que:
   *  - Tem tamanho igual a uma potência de 2 (1, 2, 4, 8, 16).
   *  - Forma um retângulo contíguo na grade (com wrap-around).
   *  - Todos os seus mintermos têm valor 1.
   *
   * Retorna array de objetos { minterms: Set, mask: bits que variam }
   * onde mask indica quais variáveis são irrelevantes no implicante.
   */
  findAllGroups() {
    const struct = KMapEngine.getMapStructure(this.numVars);
    const nRows = struct.rowLabels.length;
    const nCols = struct.colLabels.length;
    const groups = [];
    const vars = [...struct.rowVars, ...struct.colVars];
    const n = vars.length;

    // Testa todos os retângulos de tamanho rH × rW (ambos potências de 2)
    for (let rH = 1; rH <= nRows; rH *= 2) {
      for (let rW = 1; rW <= nCols; rW *= 2) {
        // Testa todas as posições de origem (r0, c0) com wrap-around
        for (let r0 = 0; r0 < nRows; r0++) {
          for (let c0 = 0; c0 < nCols; c0++) {
            // Coleta os mintermos deste retângulo
            const groupMinterms = new Set();
            let allOnes = true;
            for (let dr = 0; dr < rH; dr++) {
              for (let dc = 0; dc < rW; dc++) {
                const r = (r0 + dr) % nRows;
                const c = (c0 + dc) % nCols;
                const key = `${r}_${c}`;
                if ((this.cellValues[key] || 0) !== 1) { allOnes = false; break; }
                groupMinterms.add(this.cellToMinterm(r, c));
              }
              if (!allOnes) break;
            }
            if (!allOnes) continue;

            // Calcula a máscara de variáveis que variam dentro do grupo
            // Uma variável varia se existem dois mintermos no grupo que diferem nela
            let varyMask = 0;
            const mtArr = [...groupMinterms];
            for (let i = 0; i < mtArr.length; i++) {
              for (let j = i + 1; j < mtArr.length; j++) {
                varyMask |= (mtArr[i] ^ mtArr[j]);
              }
            }
            // A máscara deve ter exatamente log2(tamanho do grupo) bits setados
            // para que o grupo seja válido (sem variáveis "redundantes")
            const groupSize = groupMinterms.size;
            const expectedBits = Math.log2(groupSize);
            const bitsSet = varyMask.toString(2).split('1').length - 1;
            if (Number.isInteger(expectedBits) && bitsSet === expectedBits) {
              groups.push({ minterms: groupMinterms, varyMask });
            }
          }
        }
      }
    }

    return groups;
  },

  /**
   * Seleciona cobertura mínima dos mintermos usando abordagem greedy:
   * sempre escolhe o grupo que cobre mais mintermos novos.
   */
  selectCoverage(minterms, groups) {
    const remaining = new Set(minterms);
    const selected = [];

    // Ordena grupos do maior para o menor
    const sorted = [...groups].sort((a, b) => b.minterms.size - a.minterms.size);

    while (remaining.size > 0) {
      let bestGroup = null;
      let bestCoverage = 0;

      for (const g of sorted) {
        let coverage = 0;
        for (const mt of g.minterms) {
          if (remaining.has(mt)) coverage++;
        }
        if (coverage > bestCoverage) {
          bestCoverage = coverage;
          bestGroup = g;
        }
      }

      if (!bestGroup || bestCoverage === 0) break; // mintermos não cobertos (não deve ocorrer)

      selected.push(bestGroup);
      for (const mt of bestGroup.minterms) remaining.delete(mt);
    }

    return selected;
  },

  /**
   * Converte um implicante (grupo) em expressão algébrica SOP.
   * Variáveis que variam dentro do grupo são eliminadas (don't care no implicante).
   */
  groupToExpression(group) {
    const struct = KMapEngine.getMapStructure(this.numVars);
    const vars = [...struct.rowVars, ...struct.colVars];
    const n = vars.length;

    // Pega qualquer minterm do grupo como referência de valores fixos
    const refMt = [...group.minterms][0];

    const terms = [];
    for (let i = 0; i < n; i++) {
      const bit = n - 1 - i;
      if ((group.varyMask >> bit) & 1) continue; // variável varia → irrelevante

      const varBit = (refMt >> bit) & 1;
      terms.push(varBit ? vars[i] : `~${vars[i]}`);
    }

    if (terms.length === 0) return '1'; // grupo cobre tudo → tautologia
    return terms.join('.');
  },

  minimize() {
    const resultDiv = document.getElementById('kmap-result');
    if (!resultDiv) return;

    const minterms = this.getMinterms();

    // Caso especial: nenhum 1 → função é sempre 0
    if (minterms.size === 0) {
      resultDiv.innerHTML = `
        <div class="card-box" style="background:#0f172a;">
          <h4>Expressão Minimizada:</h4>
          <p style="font-size:1.3rem; font-family:var(--font-code); color:var(--accent-red);">
            <strong>F = 0</strong>
          </p>
          <p style="color:var(--text-muted);">Nenhum minterm selecionado.</p>
        </div>`;
      return;
    }

    // Caso especial: todos os mintermos são 1 → função é sempre 1
    const total = Math.pow(2, this.numVars);
    if (minterms.size === total) {
      resultDiv.innerHTML = `
        <div class="card-box" style="background:#0f172a;">
          <h4>Expressão Minimizada:</h4>
          <p style="font-size:1.3rem; font-family:var(--font-code); color:var(--accent-green);">
            <strong>F = 1</strong>
          </p>
          <p style="color:var(--text-muted);">Todos os mintermos selecionados.</p>
        </div>`;
      return;
    }

    // Encontra todos os grupos e seleciona cobertura mínima
    const allGroups = this.findAllGroups();
    const validGroups = allGroups.filter(g => {
      // Apenas grupos cujos mintermos são todos 1
      return [...g.minterms].every(mt => minterms.has(mt));
    });

    const coverage = this.selectCoverage(minterms, validGroups);

    // Gera expressão SOP
    const terms = coverage.map(g => this.groupToExpression(g));
    // Remove duplicatas
    const uniqueTerms = [...new Set(terms)];
    const expression = uniqueTerms.join(' + ');

    // Validação matemática com LogicEngine
    const struct = KMapEngine.getMapStructure(this.numVars);
    const vars = [...struct.rowVars, ...struct.colVars];

    // Constrói função de referência baseada nos mintermos
    const refFn = (inputs) => {
      const mt = vars.reduce((acc, v, i) => (acc << 1) | (inputs[v] ? 1 : 0), 0);
      return minterms.has(mt) ? 1 : 0;
    };

    let isValid = false;
    let validationMsg = '';
    try {
      const exprFn = (inputs) => LogicEngine.evaluate(expression, inputs);
      const refTable  = LogicEngine.generateTruthTable(vars, refFn);
      const exprTable = LogicEngine.generateTruthTable(vars, exprFn);
      isValid = refTable.every((row, i) => row.output === exprTable[i].output);
      validationMsg = isValid
        ? '✓ Validação: expressão equivalente ao mapa em todas as combinações.'
        : '✕ Divergência detectada — verifique os agrupamentos.';
    } catch (e) {
      validationMsg = `Erro na validação: ${e.message}`;
    }

    const color = isValid ? 'var(--accent-green)' : 'var(--accent-red)';
    resultDiv.innerHTML = `
      <div class="card-box" style="background:#0f172a;">
        <h4>Expressão Minimizada (SOP):</h4>
        <p style="font-size:1.3rem; font-family:var(--font-code); color:var(--primary); margin: 0.5rem 0;">
          <strong>F = ${expression}</strong>
        </p>
        <p style="color:${color}; margin-top: 0.5rem;">${validationMsg}</p>
        <p style="color:var(--text-muted); font-size:0.85rem; margin-top:0.5rem;">
          Mintermos: {${[...minterms].sort((a,b)=>a-b).join(', ')}} &nbsp;|&nbsp;
          Grupos encontrados: ${coverage.length}
        </p>
      </div>`;
  }
};
