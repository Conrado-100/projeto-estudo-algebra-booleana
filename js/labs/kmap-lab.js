/**
 * Laboratório do Mapa de Karnaugh - Layout Académico com Colchetes de Veitch-Karnaugh
 * Notação fiel ao quadro docente: Barras A, B, C, D e traço (—) para termos barrados.
 */
const KMapLab = {
  numVars: 4,
  cellValues: {},

  render(container) {
    container.innerHTML = `
      <div class="card-box">
        <!-- Cabeçalho de Controlo -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem;">
          <div>
            <h2 class="card-title" style="margin: 0;">Mapa de Karnaugh (Notação Tradicional)</h2>
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 0.25rem;">
              Formatação académica com barras de delimitação ($A, B, C, D$) e indicação de barrados ($—$).
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

        <!-- Legenda Académica -->
        <div class="kmap-legend-box">
          <span class="legend-item"><span class="legend-badge badge-active">1</span> Ligado</span>
          <span class="legend-item"><span class="legend-badge badge-zero">0</span> Desligado</span>
          <span class="legend-item"><strong>Legenda das Barras:</strong> As linhas contínuas assinalam a região da variável direta ($1$). O símbolo <strong>—</strong> indica a região barrada ($0$).</span>
        </div>

        <!-- Contentor do Mapa -->
        <div id="kmap-wrapper" class="kmap-wrapper" style="display: flex; justify-content: center; padding: 1rem 0;">
          <div id="kmap-grid-container"></div>
        </div>

        <!-- Resultado da Minimização -->
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

  getMintermLiteral(numVars, rowBin, colBin) {
    if (numVars === 2) {
      const a = rowBin === '1' ? 'A' : 'Ā';
      const b = colBin === '1' ? 'B' : 'B̄';
      return `${a}${b}`;
    } else if (numVars === 3) {
      const a = rowBin === '1' ? 'A' : 'Ā';
      const b = colBin[0] === '1' ? 'B' : 'B̄';
      const c = colBin[1] === '1' ? 'C' : 'C̄';
      return `${a}${b}${c}`;
    } else {
      const a = rowBin[0] === '1' ? 'A' : 'Ā';
      const b = rowBin[1] === '1' ? 'B' : 'B̄';
      const c = colBin[0] === '1' ? 'C' : 'C̄';
      const d = colBin[1] === '1' ? 'D' : 'D̄';
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
          <!-- Linha Superior de Colchetes (B e C) -->
          <div class="kmap-row-top-brackets">
            <div class="cell-empty"></div>
            <div class="bracket-dash-top">—</div>
            <div class="bracket-label-top bracket-b-top">B</div>
            <div class="bracket-dash-top">—</div>
          </div>

          <div class="kmap-middle-wrapper">
            <!-- Coluna Esquerda de Colchetes (A e B) -->
            <div class="kmap-col-left-brackets">
              <div class="bracket-dash-left">—</div>
              <div class="bracket-label-left bracket-b-left">B</div>
              <div class="bracket-label-left bracket-a-left">A</div>
              <div class="bracket-dash-left">—</div>
            </div>

            <!-- Matriz Principal 4x4 -->
            <div class="kmap-matrix-grid grid-4x4">
      `;

      struct.rowLabels.forEach((rLabel, rIdx) => {
        struct.colLabels.forEach((cLabel, cIdx) => {
          const key = `${rIdx}_${cIdx}`;
          if (this.cellValues[key] === undefined) this.cellValues[key] = 0;
          const val = this.cellValues[key];
          const literal = this.getMintermLiteral(4, rLabel, cLabel);

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

            <!-- Coluna Direita de Colchetes (C) -->
            <div class="kmap-col-right-brackets">
              <div class="bracket-dash-right">—</div>
              <div class="bracket-label-right bracket-c-right">C</div>
              <div class="bracket-dash-right">—</div>
            </div>
          </div>

          <!-- Linha Inferior de Colchetes (D) -->
          <div class="kmap-row-bottom-brackets">
            <div class="cell-empty"></div>
            <div class="bracket-dash-bottom">—</div>
            <div class="bracket-label-bottom bracket-d-bottom">D</div>
            <div class="bracket-dash-bottom">—</div>
          </div>
        </div>
      `;
    } else if (this.numVars === 3) {
      html += `
        <div class="kmap-board-academic kmap-board-2x4">
          <div class="kmap-row-top-brackets">
            <div class="cell-empty"></div>
            <div class="bracket-dash-top">—</div>
            <div class="bracket-label-top bracket-b-top">B</div>
            <div class="bracket-dash-top">—</div>
          </div>

          <div class="kmap-middle-wrapper">
            <div class="kmap-col-left-brackets">
              <div class="bracket-dash-left">—</div>
              <div class="bracket-label-left bracket-a-left">A</div>
            </div>

            <div class="kmap-matrix-grid grid-2x4">
      `;

      struct.rowLabels.forEach((rLabel, rIdx) => {
        struct.colLabels.forEach((cLabel, cIdx) => {
          const key = `${rIdx}_${cIdx}`;
          if (this.cellValues[key] === undefined) this.cellValues[key] = 0;
          const val = this.cellValues[key];
          const literal = this.getMintermLiteral(3, rLabel, cLabel);

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

            <div class="kmap-col-right-brackets">
              <div class="bracket-label-right bracket-c-right">C</div>
            </div>
          </div>

          <div class="kmap-row-bottom-brackets">
            <div class="cell-empty"></div>
            <div class="bracket-dash-bottom">—</div>
            <div class="bracket-label-bottom bracket-d-bottom">C</div>
            <div class="bracket-dash-bottom">—</div>
          </div>
        </div>
      `;
    } else {
      html += `
        <div class="kmap-board-academic kmap-board-2x2">
          <div class="kmap-row-top-brackets">
            <div class="cell-empty"></div>
            <div class="bracket-dash-top">—</div>
            <div class="bracket-label-top bracket-b-top">B</div>
          </div>

          <div class="kmap-middle-wrapper">
            <div class="kmap-col-left-brackets">
              <div class="bracket-dash-left">—</div>
              <div class="bracket-label-left bracket-a-left">A</div>
            </div>

            <div class="kmap-matrix-grid grid-2x2">
      `;

      struct.rowLabels.forEach((rLabel, rIdx) => {
        struct.colLabels.forEach((cLabel, cIdx) => {
          const key = `${rIdx}_${cIdx}`;
          if (this.cellValues[key] === undefined) this.cellValues[key] = 0;
          const val = this.cellValues[key];
          const literal = this.getMintermLiteral(2, rLabel, cLabel);

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
      detailsEl.innerHTML = `<p>• Nenhuma célula com valor 1 foi selecionada no mapa.</p>`;
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
      const rLabel = struct.rowLabels[rIdx];
      const cLabel = struct.colLabels[cIdx];
      minterms.push(this.getMintermLiteral(this.numVars, rLabel, cLabel));
    });

    let minimized = "";
    if (typeof KMapEngine !== 'undefined' && KMapEngine.minimizeMap) {
      minimized = KMapEngine.minimizeMap(this.numVars, this.cellValues);
    } else {
      minimized = minterms.join(" + ");
    }

    exprEl.innerHTML = `X = <span style="color: var(--primary);">${minimized}</span>`;
    detailsEl.innerHTML = `
      <p>• <strong>Soma dos Mintermos (Canónica):</strong> <code>${minterms.join(' + ')}</code></p>
      <p>• <strong>Variáveis Eliminadas:</strong> As variáveis que alteram de estado ($0 \\rightarrow 1$) nos blocos adjacentes foram simplificadas.</p>
    `;
  }
};