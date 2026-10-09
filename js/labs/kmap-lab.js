/**
 * Laboratório do Mapa de Karnaugh Interativo
 */
const KMapLab = {
  numVars: 3,
  cellValues: {},

  render(container) {
    container.innerHTML = `
      <div class="card-box">
        <h2 class="card-title">Mapa de Karnaugh Interativo</h2>
        <p>Clique nas células do mapa para alterar entre 0 e 1 e observe a organização em Código de Gray.</p>

        <div style="margin: 1rem 0;">
          <label><strong>Dimensão do Mapa:</strong></label>
          <select id="kmap-vars-select" class="btn-action" style="background-color: var(--bg-dark); color: #fff;">
            <option value="2">2 Variáveis (2x2)</option>
            <option value="3" selected>3 Variáveis (2x4)</option>
            <option value="4">4 Variáveis (4x4)</option>
          </select>
        </div>

        <div id="kmap-grid-container"></div>
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
    let html = `<div class="kmap-grid" style="grid-template-columns: auto repeat(${struct.colLabels.length}, 50px);">`;
    
    // Célula superior esquerda
    html += `<div class="kmap-cell kmap-header-cell">${struct.rowVars.join('')}\\${struct.colVars.join('')}</div>`;

    // Cabeçalhos de Coluna (Código de Gray)
    struct.colLabels.forEach(col => {
      html += `<div class="kmap-cell kmap-header-cell">${col}</div>`;
    });

    // Linhas
    struct.rowLabels.forEach((row, rIdx) => {
      html += `<div class="kmap-cell kmap-header-cell">${row}</div>`;
      struct.colLabels.forEach((col, cIdx) => {
        const key = `${rIdx}_${cIdx}`;
        if (this.cellValues[key] === undefined) this.cellValues[key] = 0;
        
        html += `<div class="kmap-cell" data-key="${key}">${this.cellValues[key]}</div>`;
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
      });
    });
  }
};