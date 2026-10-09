/**
 * Laboratório Interativo de Portas Lógicas
 */
const GatesLab = {
  currentGate: 'AND',
  inputA: 0,
  inputB: 0,

  render(container) {
    container.innerHTML = `
      <div class="card-box">
        <h2 class="card-title">Laboratório de Portas Lógicas</h2>
        <p>Selecione uma porta e altere as chaves de entrada para observar a saída e a tabela-verdade em tempo real.</p>

        <div style="margin: 1rem 0;">
          <label><strong>Porta Lógica:</strong></label>
          <select id="gate-select" class="btn-action" style="background-color: var(--bg-dark); color: #fff;">
            <option value="NOT">NOT</option>
            <option value="AND" selected>AND</option>
            <option value="OR">OR</option>
            <option value="NAND">NAND</option>
            <option value="NOR">NOR</option>
            <option value="XOR">XOR</option>
            <option value="XNOR">XNOR</option>
          </select>
        </div>

        <div style="display: flex; gap: 2rem; align-items: center; flex-wrap: wrap; margin: 1.5rem 0;">
          <div>
            <div class="switch-container">
              <span>Entrada A:</span>
              <label class="switch"><input type="checkbox" id="switch-a"><span class="slider"></span></label>
              <strong id="val-a">0</strong>
            </div>
            <div class="switch-container" id="container-b">
              <span>Entrada B:</span>
              <label class="switch"><input type="checkbox" id="switch-b"><span class="slider"></span></label>
              <strong id="val-b">0</strong>
            </div>
          </div>

          <div class="led-indicator">
            <span>Saída (X):</span>
            <div id="gate-led" class="led-light off"></div>
            <strong id="gate-output-val">0</strong>
          </div>
        </div>

        <div id="gate-truth-table-area"></div>
      </div>
    `;

    this.attachEvents();
    this.update();
  },

  attachEvents() {
    document.getElementById('gate-select').addEventListener('change', (e) => {
      this.currentGate = e.target.value;
      document.getElementById('container-b').style.display = (this.currentGate === 'NOT') ? 'none' : 'inline-flex';
      this.update();
    });

    document.getElementById('switch-a').addEventListener('change', (e) => {
      this.inputA = e.target.checked ? 1 : 0;
      document.getElementById('val-a').innerText = this.inputA;
      this.update();
    });

    document.getElementById('switch-b').addEventListener('change', (e) => {
      this.inputB = e.target.checked ? 1 : 0;
      document.getElementById('val-b').innerText = this.inputB;
      this.update();
    });
  },

  calculate() {
    const a = this.inputA;
    const b = this.inputB;
    switch (this.currentGate) {
      case 'NOT': return a ? 0 : 1;
      case 'AND': return (a && b) ? 1 : 0;
      case 'OR': return (a || b) ? 1 : 0;
      case 'NAND': return !(a && b) ? 1 : 0;
      case 'NOR': return !(a || b) ? 1 : 0;
      case 'XOR': return (a !== b) ? 1 : 0;
      case 'XNOR': return (a === b) ? 1 : 0;
      default: return 0;
    }
  },

  update() {
    const output = this.calculate();
    const led = document.getElementById('gate-led');
    const outText = document.getElementById('gate-output-val');

    outText.innerText = output;
    if (output) {
      led.className = 'led-light on';
    } else {
      led.className = 'led-light off';
    }

    this.renderTruthTable();
  },

  renderTruthTable() {
    const isNot = this.currentGate === 'NOT';
    const vars = isNot ? ['A'] : ['A', 'B'];
    const rows = isNot ? [[0], [1]] : [[0,0], [0,1], [1,0], [1,1]];

    let html = `
      <table class="truth-table-styled">
        <thead>
          <tr>
            <th>A</th>
            ${isNot ? '' : '<th>B</th>'}
            <th>Saída (${this.currentGate})</th>
          </tr>
        </thead>
        <tbody>
    `;

    rows.forEach(r => {
      let out = 0;
      if (isNot) {
        out = r[0] ? 0 : 1;
      } else {
        const a = r[0], b = r[1];
        if (this.currentGate === 'AND') out = (a && b) ? 1 : 0;
        if (this.currentGate === 'OR') out = (a || b) ? 1 : 0;
        if (this.currentGate === 'NAND') out = !(a && b) ? 1 : 0;
        if (this.currentGate === 'NOR') out = !(a || b) ? 1 : 0;
        if (this.currentGate === 'XOR') out = (a !== b) ? 1 : 0;
        if (this.currentGate === 'XNOR') out = (a === b) ? 1 : 0;
      }

      const isCurrentRow = isNot 
        ? (r[0] === this.inputA)
        : (r[0] === this.inputA && r[1] === this.inputB);

      html += `
        <tr class="${isCurrentRow ? 'highlight-row' : ''}">
          <td>${r[0]}</td>
          ${isNot ? '' : `<td>${r[1]}</td>`}
          <td><strong>${out}</strong></td>
        </tr>
      `;
    });

    html += `</tbody></table>`;
    document.getElementById('gate-truth-table-area').innerHTML = html;
  }
};