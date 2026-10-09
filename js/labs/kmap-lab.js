/**
 * Laboratório do Mapa de Karnaugh Interativo com Indicadores Visuais de Região
 * Baseado na notação tradicional de colchetes/barras (A, A_bar, B, B_bar, etc.)
 */
const KMapLab = {
  numVars: 4,
  cellValues: {},

  render(container) {
    container.innerHTML = `
      <div class="card-box">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem;">
          <div>
            <h2 class="card-title" style="margin: 0;">Mapa de Karnaugh Interativo</h2>
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 0.25rem;">
              Com barras de identificação de variáveis (A, Ā, B, B̄, C, C̄, D, D̄) e mintermos explicativos nas células.
            </p>
          </div>
          <div style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;">
            <label><strong>Variáveis:</strong></label>
            <select id="kmap-vars-select" class="btn-action" style="background-color: var(--bg-dark); color: #fff;">
              <option value="2">2 Variáveis (2x2)</option>
              <option value="3">3 Variáveis (2x4)</option>
              <option value="4" selected>4 Variáveis (4x4)</option>
            </select>
            <button id="btn-kmap-clear" class="btn-action" style="background: #334155; color: #fff;">Zerar Mapa</button>
            <button id="btn-kmap-fill" class="btn-action" style="background: #334155; color: #fff;">Preencher 1s</button>
          </div>
        </div>

        <!-- Guia visual sobre as barras/brackets -->
        <div class="kmap-legend-box">
          <span class="legend-item"><span class="legend-badge badge-active">1</span> Célula Ativa</span>
          <span class="legend-item"><span class="legend-badge badge-zero">0</span> Célula Inativa</span>
          <span class="legend-item"><strong>Barras no entorno:</strong> indicam a região onde a variável é 1 (ex: <strong>B</strong>) ou 0 (<strong>B̄</strong>).</span>
        </div>

        <!-- Container do Mapa com Indicadores de Bordas -->
        <div id="kmap-wrapper" class="kmap-wrapper">
          <div id="kmap-grid-container"></div>
        </div>

        <!-- Painel de Resultado da Minimização -->
        <div class="card-box" style="margin-top: 1.5rem; background: var(--bg-dark); border-color: var(--primary);">
          <h3 style="color: var(--primary); margin-bottom: 0.5rem; font-size: 1.1rem;">Expressão Booleana Minimizada</h3>
          <div id="kmap-result-expr" style="font-family: var(--font-code); font-size: 1.4rem; font-weight: bold; color: var(--accent-green); margin: 0.5rem 0;">
            X = 0
          </div>
          <div id="kmap-result-details" style="font-size: 0.85rem; color: var(--text-muted);"></div>
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
      const keys = Object.keys(this.cellValues);
      keys.forEach(k => this.cellValues[k] = 1);
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
        <div class="kmap-visual-layout kmap-4var">
          <!-- Topo: Barras de D e C -->
          <div class="kmap-top-bar">
            <div class="kmap-corner-label">AB \\ CD</div>
            <div class="kmap-col-bracket bracket-dbar">D̄ (0)</div>
            <div class="kmap-col-bracket bracket-d">D (1)</div>
            <div class="kmap-col-bracket bracket-d">D (1)</div>
            <div class="kmap-col-bracket bracket-dbar">D̄ (0)</div>
          </div>
          <div class="kmap-sub-top-bar">
            <div class="kmap-corner-empty"></div>
            <div class="kmap-col-bracket bracket-cbar">C̄ (0)</div>
            <div class="kmap-col-bracket bracket-cbar">C̄ (0)</div>
            <div class="kmap-col-bracket bracket-c">C (1)</div>
            <div class="kmap-col-bracket bracket-c">C (1)</div>
          </div>

          <div class="kmap-body-row">
            <!-- Esquerda: Barras A e B -->
            <div class="kmap-left-bar">
              <div class="kmap-row-bracket bracket-abar">Ā (0)</div>
              <div class="kmap-row-bracket bracket-abar">Ā (0)</div>
              <div class="kmap-row-bracket bracket-a">A (1)</div>
              <div class="kmap-row-bracket bracket-a">A (1)</div>
            </div>
            <div class="kmap-sub-left-bar">
              <div class="kmap-row-bracket bracket-bbar">B̄ (0)</div>
              <div class="kmap-row-bracket bracket-b">B (1)</div>
              <div class="kmap-row-bracket bracket-b">B (1)</div>
              <div class="kmap-row-bracket bracket-bbar">B̄ (0)</div>
            </div>

            <!-- Grade de Células -->
            <div class="kmap-grid-matrix matrix-4x4">
      `;

      struct.rowLabels.forEach((rLabel, rIdx) => {
        struct.colLabels.forEach((cLabel, cIdx) => {
          const key = `${rIdx}_${cIdx}`;
          if (this.cellValues[key] === undefined) this.cellValues[key] = 0;
          const val = this.cellValues[key];
          const literal = this.getMintermLiteral(4, rLabel, cLabel);

          html += `
            <div class="kmap-cell-enhanced ${val === 1 ? 'active-cell' : ''}" data-key="${key}">
              <div class="kmap-cell-coords">${rLabel} ${cLabel}</div>
              <div class="kmap-cell-value">${val}</div>
              <div class="kmap-cell-literal">${literal}</div>
            </div>
          `;
        });
      });

      html += `
            </div>
          </div>
        </div>
      `;
    } else if (this.numVars === 3) {
      html += `
        <div class="kmap-visual-layout kmap-3var">
          <div class="kmap-top-bar">
            <div class="kmap-corner-label">A \\ BC</div>
            <div class="kmap-col-bracket bracket-bbar">B̄ (0)</div>
            <div class="kmap-col-bracket bracket-bbar">B̄ (0)</div>
            <div class="kmap-col-bracket bracket-b">B (1)</div>
            <div class="kmap-col-bracket bracket-b">B (1)</div>
          </div>
          <div class="kmap-sub-top-bar">
            <div class="kmap-corner-empty"></div>
            <div class="kmap-col-bracket bracket-cbar">C̄ (0)</div>
            <div class="kmap-col-bracket bracket-c">C (1)</div>
            <div class="kmap-col-bracket bracket-c">C (1)</div>
            <div class="kmap-col-bracket bracket-cbar">C̄ (0)</div>
          </div>

          <div class="kmap-body-row">
            <div class="kmap-left-bar">
              <div class="kmap-row-bracket bracket-abar">Ā (0)</div>
              <div class="kmap-row-bracket bracket-a">A (1)</div>
            </div>

            <div class="kmap-grid-matrix matrix-2x4">
      `;

      struct.rowLabels.forEach((rLabel, rIdx) => {
        struct.colLabels.forEach((cLabel, cIdx) => {
          const key = `${rIdx}_${cIdx}`;
          if (this.cellValues[key] === undefined) this.cellValues[key] = 0;
          const val = this.cellValues[key];
          const literal = this.getMintermLiteral(3, rLabel, cLabel);

          html += `
            <div class="kmap-cell-enhanced ${val === 1 ? 'active-cell' : ''}" data-key="${key}">
              <div class="kmap-cell-coords">${rLabel} ${cLabel}</div>
              <div class="kmap-cell-value">${val}</div>
              <div class="kmap-cell-literal">${literal}</div>
            </div>
          `;
        });
      });

      html += `
            </div>
          </div>
        </div>
      `;
    } else {
      html += `
        <div class="kmap-visual-layout kmap-2var">
          <div class="kmap-top-bar">
            <div class="kmap-corner-label">A \\ B</div>
            <div class="kmap-col-bracket bracket-bbar">B̄ (0)</div>
            <div class="kmap-col-bracket bracket-b">B (1)</div>
          </div>

          <div class="kmap-body-row">
            <div class="kmap-left-bar">
              <div class="kmap-row-bracket bracket-abar">Ā (0)</div>
              <div class="kmap-row-bracket bracket-a">A (1)</div>
            </div>

            <div class="kmap-grid-matrix matrix-2x2">
      `;

      struct.rowLabels.forEach((rLabel, rIdx) => {
        struct.colLabels.forEach((cLabel, cIdx) => {
          const key = `${rIdx}_${cIdx}`;
          if (this.cellValues[key] === undefined) this.cellValues[key] = 0;
          const val = this.cellValues[key];
          const literal = this.getMintermLiteral(2, rLabel, cLabel);

          html += `
            <div class="kmap-cell-enhanced ${val === 1 ? 'active-cell' : ''}" data-key="${key}">
              <div class="kmap-cell-coords">${rLabel} ${cLabel}</div>
              <div class="kmap-cell-value">${val}</div>
              <div class="kmap-cell-literal">${literal}</div>
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

    container.querySelectorAll('.kmap-cell-enhanced').forEach(cell => {
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
      detailsEl.innerHTML = "<p>Nenhuma célula com valor 1 foi selecionada no mapa.</p>";
      return;
    }

    const totalCells = Math.pow(2, this.numVars);
    if (activeKeys.length === totalCells) {
      exprEl.innerText = "X = 1";
      detailsEl.innerHTML = "<p>Todas as células do mapa estão ativas (Tautologia).</p>";
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
      <p>• <strong>Mintermos ativados:</strong> ${activeKeys.length} de ${totalCells} células.</p>
      <p>• <strong>Forma Canônica Mintermos:</strong> <code>${minterms.join(' + ')}</code></p>
    `;
  }
};