/**
 * Visualizador Interativo e Dinâmico de Circuitos Lógicos
 */
const CircuitBuilderLab = {
  inputA: 1,
  inputB: 0,
  selectedGate: 'AND',

  render(container) {
    container.innerHTML = `
      <div class="card-box">
        <h2 class="card-title">Visualizador Dinâmico de Circuitos</h2>
        <p>Altere os sinais de entrada e selecione a porta para observar a propagação do sinal e as cores dos fios em tempo real.</p>

        <div style="display: flex; gap: 1.5rem; margin: 1rem 0; align-items: center; flex-wrap: wrap;">
          <div class="switch-container">
            <span>Entrada A:</span>
            <label class="switch"><input type="checkbox" id="circ-in-a" ${this.inputA ? 'checked' : ''}><span class="slider"></span></label>
            <strong id="circ-val-a">${this.inputA}</strong>
          </div>
          <div class="switch-container">
            <span>Entrada B:</span>
            <label class="switch"><input type="checkbox" id="circ-in-b" ${this.inputB ? 'checked' : ''}><span class="slider"></span></label>
            <strong id="circ-val-b">${this.inputB}</strong>
          </div>
          <div>
            <label><strong>Porta Lógica:</strong></label>
            <select id="circ-gate-select" class="btn-action" style="background: var(--bg-dark); color: #fff;">
              <option value="AND">AND</option>
              <option value="OR">OR</option>
              <option value="NAND">NAND</option>
              <option value="NOR">NOR</option>
              <option value="XOR">XOR</option>
            </select>
          </div>
        </div>

        <div style="padding: 1.5rem; background-color: var(--bg-dark); border-radius: 8px; text-align: center; margin-top: 1rem;">
          <svg id="circuit-svg" width="450" height="180" style="background: #0f172a; border-radius: 8px; border: 1px solid var(--border-color);"></svg>
        </div>
      </div>
    `;

    this.attachEvents();
    this.drawCircuit();
  },

  attachEvents() {
    document.getElementById('circ-in-a').addEventListener('change', (e) => {
      this.inputA = e.target.checked ? 1 : 0;
      document.getElementById('circ-val-a').innerText = this.inputA;
      this.drawCircuit();
    });

    document.getElementById('circ-in-b').addEventListener('change', (e) => {
      this.inputB = e.target.checked ? 1 : 0;
      document.getElementById('circ-val-b').innerText = this.inputB;
      this.drawCircuit();
    });

    document.getElementById('circ-gate-select').addEventListener('change', (e) => {
      this.selectedGate = e.target.value;
      this.drawCircuit();
    });
  },

  calculateOutput() {
    const a = this.inputA, b = this.inputB;
    switch (this.selectedGate) {
      case 'AND': return (a && b) ? 1 : 0;
      case 'OR': return (a || b) ? 1 : 0;
      case 'NAND': return !(a && b) ? 1 : 0;
      case 'NOR': return !(a || b) ? 1 : 0;
      case 'XOR': return (a !== b) ? 1 : 0;
      default: return 0;
    }
  },

  drawCircuit() {
    const svg = document.getElementById('circuit-svg');
    const out = this.calculateOutput();

    const colorA = this.inputA ? '#22c55e' : '#64748b';
    const colorB = this.inputB ? '#22c55e' : '#64748b';
    const colorOut = out ? '#22c55e' : '#ef4444';

    svg.innerHTML = `
      <!-- Linhas de Entrada A e B -->
      <line x1="40" y1="50" x2="180" y2="50" stroke="${colorA}" stroke-width="5" stroke-linecap="round" />
      <text x="15" y="55" fill="#fff" font-weight="bold" font-family="Fira Code">A (${this.inputA})</text>

      <line x1="40" y1="130" x2="180" y2="130" stroke="${colorB}" stroke-width="5" stroke-linecap="round" />
      <text x="15" y="135" fill="#fff" font-weight="bold" font-family="Fira Code">B (${this.inputB})</text>

      <!-- Corpo da Porta Lógica -->
      <rect x="180" y="30" width="100" height="120" rx="12" fill="#1e293b" stroke="#38bdf8" stroke-width="3" />
      <text x="230" y="98" fill="#38bdf8" font-size="20" font-weight="bold" text-anchor="middle" font-family="Inter">${this.selectedGate}</text>

      <!-- Linha de Saída -->
      <line x1="280" y1="90" x2="380" y2="90" stroke="${colorOut}" stroke-width="5" stroke-linecap="round" />
      <circle cx="395" cy="90" r="14" fill="${colorOut}" />
      <text x="395" y="95" fill="#0f172a" font-size="12" font-weight="bold" text-anchor="middle">${out}</text>
      <text x="420" y="95" fill="#fff" font-weight="bold">X</text>
    `;
  }
};