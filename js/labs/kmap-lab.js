/**
 * Laboratório do Mapa de Karnaugh Interativo com Didática para Iniciantes
 * Inclui: Guia passo a passo, notação por barras/colchetes e explicação detalhada da simplificação.
 */
const KMapLab = {
  numVars: 4,
  cellValues: {},

  render(container) {
    container.innerHTML = `
      <div class="card-box">
        <!-- Cabeçalho Principal -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem;">
          <div>
            <h2 class="card-title" style="margin: 0;">Laboratório do Mapa de Karnaugh</h2>
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 0.25rem;">
              Ferramenta gráfica para simplificar circuitos sem precisar decorá-los.
            </p>
          </div>
          <div style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;">
            <label><strong>Dimensão:</strong></label>
            <select id="kmap-vars-select" class="btn-action" style="background-color: var(--bg-dark); color: #fff;">
              <option value="2">2 Variáveis (2x2 - 4 células)</option>
              <option value="3">3 Variáveis (2x4 - 8 células)</option>
              <option value="4" selected>4 Variáveis (4x4 - 16 células)</option>
            </select>
            <button id="btn-kmap-clear" class="btn-action" style="background: #334155; color: #fff;">Zerar Mapa</button>
            <button id="btn-kmap-fill" class="btn-action" style="background: #334155; color: #fff;">Preencher 1s</button>
          </div>
        </div>

        <!-- GUIA DIDÁTICO PASSO A PASSO PARA INICIANTES -->
        <details class="card-box" style="background: #0f172a; border-color: var(--primary); margin-bottom: 1.5rem;" open>
          <summary style="cursor: pointer; font-weight: bold; color: var(--primary); font-size: 1.05rem;">
            📖 Guia para Iniciantes: Como Funciona o Mapa de Karnaugh? (Clique para abrir/fechar)
          </summary>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem; margin-top: 1rem;">
            <!-- Passo 1 -->
            <div style="background: var(--bg-card); padding: 0.85rem; border-radius: 8px; border: 1px solid var(--border-color);">
              <h4 style="color: var(--primary); margin-bottom: 0.4rem; font-size: 0.95rem;">1. O que são as Barras (A, Ā, B...)?</h4>
              <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.4;">
                As barras ao redor do mapa mostram onde cada variável é <strong>1 (Verdadeira)</strong> ou <strong>0 (Barrada/Falsa)</strong>:
              </p>
              <ul style="font-size: 0.8rem; color: var(--text-muted); margin-left: 1.2rem; margin-top: 0.3rem;">
                <li><strong>A:</strong> Região onde A = 1.</li>
                <li><strong>Ā (ou A'):</strong> Região onde A = 0.</li>
              </ul>
            </div>

            <!-- Passo 2 -->
            <div style="background: var(--bg-card); padding: 0.85rem; border-radius: 8px; border: 1px solid var(--border-color);">
              <h4 style="color: var(--primary); margin-bottom: 0.4rem; font-size: 0.95rem;">2. Como Preencher o Mapa?</h4>
              <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.4;">
                Cada célula representa uma combinação da Tabela-Verdade. Clique nas células para alternar entre:
              </p>
              <ul style="font-size: 0.8rem; color: var(--text-muted); margin-left: 1.2rem; margin-top: 0.3rem;">
                <li><strong style="color: var(--accent-green);">1:</strong> O circuito DEVE ligar nesta combinação.</li>
                <li><strong>0:</strong> O circuito fica desligado.</li>
              </ul>
            </div>

            <!-- Passo 3 -->
            <div style="background: var(--bg-card); padding: 0.85rem; border-radius: 8px; border: 1px solid var(--border-color);">
              <h4 style="color: var(--primary); margin-bottom: 0.4rem; font-size: 0.95rem;">3. As Regras de Ouro dos Agrupamentos</h4>
              <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.4;">
                O segredo da simplificação é juntar os <strong>1s vizinhos</strong> em grupos (clusters):
              </p>
              <ul style="font-size: 0.8rem; color: var(--text-muted); margin-left: 1.2rem; margin-top: 0.3rem;">
                <li><strong>Tamanhos permitidos:</strong> Sempre 1, 2, 4, 8 ou 16 células.</li>
                <li><strong>Conexão por bordas:</strong> Os lados esquerdo e direito se tocam (como um cilindro)!</li>
              </ul>
            </div>

            <!-- Passo 4 -->
            <div style="background: var(--bg-card); padding: 0.85rem; border-radius: 8px; border: 1px solid var(--border-color);">
              <h4 style="color: var(--primary); margin-bottom: 0.4rem; font-size: 0.95rem;">4. Como a Fórmula é Gerada?</h4>
              <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.4;">
                Analise as variáveis dentro do grupo de 1s:
              </p>
              <ul style="font-size: 0.8rem; color: var(--text-muted); margin-left: 1.2rem; margin-top: 0.3rem;">
                <li><strong>Muda de estado (0 para 1):</strong> É desnecessária e <span style="color: var(--accent-red);">CORTADA</span>!</li>
                <li><strong>Permanece constante:</strong> Entra na fórmula final simplificada.</li>
              </ul>
            </div>
          </div>
        </details>

        <!-- Legenda Visual Rápida -->
        <div class="kmap-legend-box">
          <span class="legend-item"><span class="legend-badge badge-active">1</span> Célula Ativa</span>
          <span class="legend-item"><span class="legend-badge badge-zero">0</span> Célula Inativa</span>
          <span class="legend-item">💡 <strong>Dica:</strong> As letras pequenas dentro de cada célula (ex: ĀB̄C̄D̄) mostram a combinação exata de entradas.</span>
        </div>

        <!-- Container do Mapa com Indicadores de Bordas -->
        <div id="kmap-wrapper" class="kmap-wrapper">
          <div id="kmap-grid-container"></div>
        </div>

        <!-- Painel Explicativo de Resultado e Minimização -->
        <div class="card-box" style="margin-top: 1.5rem; background: var(--bg-dark); border-color: var(--primary);">
          <h3 style="color: var(--primary); margin-bottom: 0.5rem; font-size: 1.1rem;">Expressão Booleana Minimizada</h3>
          <div id="kmap-result-expr" style="font-family: var(--font-code); font-size: 1.5rem; font-weight: bold; color: var(--accent-green); margin: 0.5rem 0;">
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
        <div class="kmap-visual-layout kmap-4var">
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

            <div class="kmap-grid-matrix matrix-4x4">
      `;

      struct.rowLabels.forEach((rLabel, rIdx) => {
        struct.colLabels.forEach((cLabel, cIdx) => {
          const key = `${rIdx}_${cIdx}`;
          if (this.cellValues[key] === undefined) this.cellValues[key] = 0;
          const val = this.cellValues[key];
          const literal = this.getMintermLiteral(4, rLabel, cLabel);

          html += `
            <div class="kmap-cell-enhanced ${val === 1 ? 'active-cell' : ''}" data-key="${key}" title="Clique para alterar entre 0 e 1">
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
            <div class="kmap-cell-enhanced ${val === 1 ? 'active-cell' : ''}" data-key="${key}" title="Clique para alterar entre 0 e 1">
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
            <div class="kmap-cell-enhanced ${val === 1 ? 'active-cell' : ''}" data-key="${key}" title="Clique para alterar entre 0 e 1">
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
      detailsEl.innerHTML = `
        <p>• <strong>Estado:</strong> Circuito Desligado para todas as combinações.</p>
        <p>• <strong>Como resolver:</strong> Clique nas células cinzas do mapa para marcar onde a saída deve ser <strong>1</strong>.</p>
      `;
      return;
    }

    const totalCells = Math.pow(2, this.numVars);
    if (activeKeys.length === totalCells) {
      exprEl.innerText = "X = 1";
      detailsEl.innerHTML = `
        <p>• <strong>Estado:</strong> Circuito Sempre Ligado (Tautologia).</p>
        <p>• <strong>Explicação:</strong> Como todos os mintermos foram ativados, a função independe das entradas.</p>
      `;
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
      <p>• <strong>Células com valor 1:</strong> ${activeKeys.length} de ${totalCells} posições ativadas.</p>
      <p>• <strong>Expressão Não-Simplificada (Soma dos Mintermos):</strong> <code style="color: var(--text-muted);">${minterms.join(' + ')}</code></p>
      <p>• <strong>Por que ficou mais curta?</strong> O algoritmo identificou os agrupamentos adjacentes e eliminou as variáveis que mudavam de estado (0 ➔ 1) dentro de cada bloco!</p>
    `;
  }
};