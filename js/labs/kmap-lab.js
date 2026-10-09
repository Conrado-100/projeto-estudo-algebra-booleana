/**
 * Laboratório do Mapa de Karnaugh - Notação Acadêmica Veitch-Karnaugh
 * Disposição Exata:
 * - TOPO: B (duas colunas da esquerda = —, duas da direita = B)
 * - ESQUERDA: A (duas linhas de cima = —, duas de baixo = A)
 * - DIREITA: C (linha superior/inferior = —, duas centrais = C)
 * - FUNDO: D (coluna esquerda/direita = —, duas centrais = D)
 */
const KMapLab = {
  numVars: 4,
  cellValues: {},

  render(container) {
    container.innerHTML = `
      <div class="card-box">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem;">
          <div>
            <h2 class="card-title" style="margin: 0;">Mapa de Karnaugh (Notação Tradicional)</h2>
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 0.25rem;">
              Distribuição oficial de quadra: A (Esquerda), B (Topo), C (Direita) e D (Fundo).
            </p>
          </div>
          <div style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;">
            <label><strong>Dimensão:</strong></label>
            <select id="kmap-vars-select" class="btn-action" style="background-color: var(--bg-dark); color: #fff;">
              <option value="2">2 Variáveis (2x2)</option>
              <option value="3">3 Variáveis (2x4)</option>
              <option value="4" selected>4 Variáveis (4x4)</option>
            </select>
            <button id="btn-kmap-clear" class="btn-action" style="background: #334155; color: #fff;">Zerar Mapa</button>
            <button id="btn-kmap-fill" class="btn-action" style="background: #334155; color: #fff;">Preencher 1s</button>
          </div>
        </div>

        <div class="kmap-legend-box">
          <span class="legend-item"><span class="legend-badge badge-active">1</span> Célula Ativa</span>
          <span class="legend-item"><span class="legend-badge badge-zero">0</span> Célula Inativa</span>
          <span class="legend-item"><strong>Legenda:</strong> As letras azuis (A, B, C, D) indicam valor 1. O traço vermelho <strong>—</strong> indica a região barrada (0).</span>
        </div>

        <!-- Container do Mapa -->
        <div id="kmap-wrapper" class="kmap-wrapper" style="display: flex; justify-content: center; padding: 0.5rem 0;">
          <div id="kmap-grid-container"></div>
        </div>

        <!-- Resultado -->
        <div class="card-box" style="margin-top: 1.5rem; background: var(--bg-dark); border-color: var(--primary);">
          <h3 style="color: var(--primary); margin-bottom: 0.5rem; font-size: 1.1rem;">Expressão Booleana Minimizada</h3>
          <div id="kmap-result-expr" style="font-family: var(--font-code); font-size: 1.6rem; font-weight: bold; color: var(--accent-green); margin: 0.5rem 0;">
            X = 0
          </div>
          <div id="kmap-result-details" style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.6;"></div>
        </div>
      </div>
    `;

    document.getElementById('kmap-vars-select').addEventListener('change', (e) => {
      this.numVars = parseInt(e.target.value);
      this.cellValues = {};
      this.renderGrid();
    });

    document.getElementById('btn-kmap-clear').addEventListener('click', () => {
      this.cellValues = {};
      this.renderGrid();
    });

    document.getElementById('btn-kmap-fill').addEventListener('click', () => {
      const struct = KMapEngine.getMapStructure(this.numVars);
      struct.rowLabels.forEach((_, r) => {
        struct.colLabels.forEach((_, c) => {
          this.cellValues[`${r}_${c}`] = 1;
        });
      });
      this.renderGrid();
    });

    this.renderGrid();
  },

  getMintermLiteral(numVars, rIdx, cIdx) {
    if (numVars === 2) {
      const a = rIdx === 1 ? 'A' : 'Ā';
      const b = cIdx === 1 ? 'B' : 'B̄';
      return `${a}${b}`;
    } else if (numVars === 3) {
      const a = rIdx === 1 ? 'A' : 'Ā';
      const b = (cIdx === 2 || cIdx === 3) ? 'B' : 'B̄';
      const c = (cIdx === 1 || cIdx === 2) ? 'C' : 'C̄';
      return `${a}${b}${c}`;
    } else {
      // 4 Variáveis: A (linhas 2,3), B (colunas 2,3), C (linhas 1,2), D (colunas 1,2)
      const a = (rIdx === 2 || rIdx === 3) ? 'A' : 'Ā';
      const b = (cIdx === 2 || cIdx === 3) ? 'B' : 'B̄';
      const c = (rIdx === 1 || rIdx === 2) ? 'C' : 'C̄';
      const d = (cIdx === 1 || cIdx === 2) ? 'D' : 'D̄';
      return `${a}${b}${c}${d}`;
    }
  },

  renderGrid() {
    const struct = KMapEngine.getMapStructure(this.numVars);
    const container = document.getElementById('kmap-grid-container');
    if (!container) return;

    let html = '';

    if (this.numVars === 4) {
      html += `
        <div class="kmap-board-academic kmap-board-4x4">
          <!-- TOPO: B (Duas colunas da esquerda = —, duas da direita = B) -->
          <div class="kmap-top-row">
            <div class="kmap-corner-spacer"></div>
            <div class="kmap-bracket-top bracket-dash">—</div>
            <div class="kmap-bracket-top bracket-var">B</div>
            <div class="kmap-corner-spacer"></div>
          </div>

          <div class="kmap-center-row">
            <!-- ESQUERDA: A (Duas linhas de cima = —, duas de baixo = A) -->
            <div class="kmap-left-col-outer">
              <div class="kmap-bracket-left bracket-dash">—</div>
              <div class="kmap-bracket-left bracket-var">A</div>
            </div>

            <!-- GRADE 4x4 -->
            <div class="kmap-matrix-grid grid-4x4">
      `;

      struct.rowLabels.forEach((rLabel, rIdx) => {
        struct.colLabels.forEach((cLabel, cIdx) => {
          const key = `${rIdx}_${cIdx}`;
          if (this.cellValues[key] === undefined) this.cellValues[key] = 0;
          const val = this.cellValues[key];
          const literal = this.getMintermLiteral(4, rIdx, cIdx);

          html += `
            <div class="kmap-academic-cell ${val === 1 ? 'active-cell' : ''}" data-key="${key}">
              <span class="cell-bin">${rLabel} ${cLabel}</span>
              <span class="cell-num">${val}</span>
              <span class="cell-lit">${literal}</span>
            </div>
          `;
        });
      });

      html += `
            </div>

            <!-- DIREITA: C (Linha topo/fundo = —, duas centrais = C) -->
            <div class="kmap-right-col-outer">
              <div class="kmap-bracket-right bracket-dash">—</div>
              <div class="kmap-bracket-right bracket-var">C</div>
              <div class="kmap-bracket-right bracket-dash">—</div>
            </div>
          </div>

          <!-- FUNDO: D (Coluna ponta esquerda/direita = —, duas centrais = D) -->
          <div class="kmap-bottom-row">
            <div class="kmap-corner-spacer"></div>
            <div class="kmap-bracket-bottom bracket-dash">—</div>
            <div class="kmap-bracket-bottom bracket-var">D</div>
            <div class="kmap-bracket-bottom bracket-dash">—</div>
            <div class="kmap-corner-spacer"></div>
          </div>
        </div>
      `;
    } else if (this.numVars === 3) {
      html += `
        <div class="kmap-board-academic kmap-board-2x4">
          <div class="kmap-top-row">
            <div class="kmap-corner-spacer-small"></div>
            <div class="kmap-bracket-top bracket-dash">—</div>
            <div class="kmap-bracket-top bracket-var">B</div>
          </div>

          <div class="kmap-center-row">
            <div class="kmap-left-col-outer">
              <div class="kmap-bracket-left bracket-dash">—</div>
              <div class="kmap-bracket-left bracket-var">A</div>
            </div>

            <div class="kmap-matrix-grid grid-2x4">
      `;

      struct.rowLabels.forEach((rLabel, rIdx) => {
        struct.colLabels.forEach((cLabel, cIdx) => {
          const key = `${rIdx}_${cIdx}`;
          if (this.cellValues[key] === undefined) this.cellValues[key] = 0;
          const val = this.cellValues[key];
          const literal = this.getMintermLiteral(3, rIdx, cIdx);

          html += `
            <div class="kmap-academic-cell ${val === 1 ? 'active-cell' : ''}" data-key="${key}">
              <span class="cell-bin">${rLabel} ${cLabel}</span>
              <span class="cell-num">${val}</span>
              <span class="cell-lit">${literal}</span>
            </div>
          `;
        });
      });

      html += `
            </div>
          </div>

          <div class="kmap-bottom-row">
            <div class="kmap-corner-spacer-small"></div>
            <div class="kmap-bracket-bottom bracket-dash">—</div>
            <div class="kmap-bracket-bottom bracket-var">C</div>
            <div class="kmap-bracket-bottom bracket-dash">—</div>
          </div>
        </div>
      `;
    } else {
      html += `
        <div class="kmap-board-academic kmap-board-2x2">
          <div class="kmap-top-row">
            <div class="kmap-corner-spacer-small"></div>
            <div class="kmap-bracket-top-2var bracket-dash">—</div>
            <div class="kmap-bracket-top-2var bracket-var">B</div>
          </div>

          <div class="kmap-center-row">
            <div class="kmap-left-col-outer">
              <div class="kmap-bracket-left bracket-dash">—</div>
              <div class="kmap-bracket-left bracket-var">A</div>
            </div>

            <div class="kmap-matrix-grid grid-2x2">
      `;

      struct.rowLabels.forEach((rLabel, rIdx) => {
        struct.colLabels.forEach((cLabel, cIdx) => {
          const key = `${rIdx}_${cIdx}`;
          if (this.cellValues[key] === undefined) this.cellValues[key] = 0;
          const val = this.cellValues[key];
          const literal = this.getMintermLiteral(2, rIdx, cIdx);

          html += `
            <div class="kmap-academic-cell ${val === 1 ? 'active-cell' : ''}" data-key="${key}">
              <span class="cell-bin">${rLabel} ${cLabel}</span>
              <span class="cell-num">${val}</span>
              <span class="cell-lit">${literal}</span>
            </div>
          `;
        });
      });

      html += `
            </div>
          </div>
        </div>
      `;
    }

    container.innerHTML = html;

    container.querySelectorAll('.kmap-academic-cell').forEach(cell => {
      cell.addEventListener('click', () => {
        const key = cell.getAttribute('data-key');
        this.cellValues[key] = this.cellValues[key] === 1 ? 0 : 1;
        this.renderGrid();
      });
    });

    this.updateMinimization();
  },

  updateMinimization() {
    const exprEl = document.getElementById('kmap-result-expr');
    const detailsEl = document.getElementById('kmap-result-details');
    if (!exprEl) return;

    const activeKeys = Object.keys(this.cellValues).filter(k => this.cellValues[k] === 1);
    
    if (activeKeys.length === 0) {
      exprEl.innerText = "X = 0";
      detailsEl.innerHTML = `<p>• Nenhuma célula ativa selecionada.</p>`;
      return;
    }

    const totalCells = Math.pow(2, this.numVars);
    if (activeKeys.length === totalCells) {
      exprEl.innerText = "X = 1";
      detailsEl.innerHTML = `<p>• Todas as células estão ativas (Tautologia).</p>`;
      return;
    }

    const struct = KMapEngine.getMapStructure(this.numVars);
    const minterms = [];

    activeKeys.forEach(k => {
      const [rIdx, cIdx] = k.split('_').map(Number);
      minterms.push(this.getMintermLiteral(this.numVars, rIdx, cIdx));
    });

    let minimized = "";
    if (typeof KMapEngine !== 'undefined' && KMapEngine.minimizeMap) {
      minimized = KMapEngine.minimizeMap(this.numVars, this.cellValues);
    } else {
      minimized = minterms.join(" + ");
    }

    exprEl.innerHTML = `X = <span style="color: var(--primary);">${minimized}</span>`;
    detailsEl.innerHTML = `
      <p>• <strong>Soma dos Mintermos:</strong> <code>${minterms.join(' + ')}</code></p>
      <p>• <strong>Simplificação:</strong> Cancela variáveis que variam entre 0 e 1 dentro do agrupamento.</p>
    `;
  }
};