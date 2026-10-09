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
          <div class="switch-container" id="circ-container-b">
            <span>Entrada B:</span>
            <label class="switch"><input type="checkbox" id="circ-in-b" ${this.inputB ? 'checked' : ''}><span class="slider"></span></label>
            <strong id="circ-val-b">${this.inputB}</strong>
          </div>
          <div>
            <label><strong>Porta Lógica:</strong></label>
            <select id="circ-gate-select" class="btn-action" style="background: var(--bg-dark); color: #fff;">
              <option value="NOT">NOT</option>
              <option value="AND" selected>AND</option>
              <option value="OR">OR</option>
              <option value="NAND">NAND</option>
              <option value="NOR">NOR</option>
              <option value="XOR">XOR</option>
              <option value="XNOR">XNOR</option>
            </select>
          </div>
        </div>

        <div style="padding: 1.5rem; background-color: var(--bg-dark); border-radius: 8px; text-align: center; margin-top: 1rem; overflow-x: auto;">
          <svg id="circuit-svg" width="100%" viewBox="0 0 460 180" preserveAspectRatio="xMidYMid meet"
               style="background: #0f172a; border-radius: 8px; border: 1px solid var(--border-color); min-width: 280px; max-width: 460px; display: block; margin: 0 auto;"></svg>
        </div>
      </div>
    `;

    this.attachEvents();
    this.update();
  },

  attachEvents() {
    document.getElementById('circ-gate-select').addEventListener('change', (e) => {
      this.selectedGate = e.target.value;
      // NOT usa apenas entrada A — oculta entrada B
      const containerB = document.getElementById('circ-container-b');
      if (containerB) containerB.style.display = this.selectedGate === 'NOT' ? 'none' : 'inline-flex';
      this.drawCircuit();
    });

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
  },

  update() {
    // Aplica estado inicial da porta selecionada
    const containerB = document.getElementById('circ-container-b');
    if (containerB) containerB.style.display = this.selectedGate === 'NOT' ? 'none' : 'inline-flex';
    this.drawCircuit();
  },

  calculateOutput() {
    const a = this.inputA, b = this.inputB;
    switch (this.selectedGate) {
      case 'NOT':  return a ? 0 : 1;
      case 'AND':  return (a && b) ? 1 : 0;
      case 'OR':   return (a || b) ? 1 : 0;
      case 'NAND': return !(a && b) ? 1 : 0;
      case 'NOR':  return !(a || b) ? 1 : 0;
      case 'XOR':  return (a !== b) ? 1 : 0;
      case 'XNOR': return (a === b) ? 1 : 0;
      default:     return 0;
    }
  },

  drawCircuit() {
    const svg = document.getElementById('circuit-svg');
    if (!svg) return;
    const out = this.calculateOutput();
    const isNot = this.selectedGate === 'NOT';

    const colorA   = this.inputA ? '#22c55e' : '#64748b';
    const colorB   = this.inputB ? '#22c55e' : '#64748b';
    const colorOut = out ? '#22c55e' : '#ef4444';

    if (isNot) {
      // Layout de 1 entrada: A → [ NOT ] → X
      svg.innerHTML = `
        <!-- Entrada A -->
        <line x1="40" y1="90" x2="180" y2="90" stroke="${colorA}" stroke-width="5" stroke-linecap="round" />
        <text x="8" y="95" fill="#fff" font-weight="bold" font-family="Fira Code" font-size="13">A (${this.inputA})</text>

        <!-- Corpo da Porta NOT -->
        <rect x="180" y="55" width="100" height="70" rx="12" fill="#1e293b" stroke="#38bdf8" stroke-width="3" />
        <text x="230" y="96" fill="#38bdf8" font-size="18" font-weight="bold" text-anchor="middle" font-family="Inter">NOT</text>

        <!-- Círculo de negação na saída -->
        <circle cx="290" cy="90" r="8" fill="#0f172a" stroke="#38bdf8" stroke-width="2.5" />

        <!-- Linha de Saída -->
        <line x1="298" y1="90" x2="390" y2="90" stroke="${colorOut}" stroke-width="5" stroke-linecap="round" />
        <circle cx="405" cy="90" r="14" fill="${colorOut}" />
        <text x="405" y="95" fill="#0f172a" font-size="12" font-weight="bold" text-anchor="middle">X=${out}</text>
        <text x="432" y="95" fill="#fff" font-weight="bold" font-family="Fira Code" font-size="13">X</text>
      `;
    } else {
      // Layout de 2 entradas: A, B → [ GATE ] → X
      svg.innerHTML = `
        <!-- Entrada A -->
        <line x1="40" y1="50" x2="180" y2="50" stroke="${colorA}" stroke-width="5" stroke-linecap="round" />
        <text x="5" y="55" fill="#fff" font-weight="bold" font-family="Fira Code" font-size="13">A (${this.inputA})</text>

        <!-- Entrada B -->
        <line x1="40" y1="130" x2="180" y2="130" stroke="${colorB}" stroke-width="5" stroke-linecap="round" />
        <text x="5" y="135" fill="#fff" font-weight="bold" font-family="Fira Code" font-size="13">B (${this.inputB})</text>

        <!-- Corpo da Porta Lógica -->
        <rect x="180" y="30" width="100" height="120" rx="12" fill="#1e293b" stroke="#38bdf8" stroke-width="3" />
        <text x="230" y="98" fill="#38bdf8" font-size="18" font-weight="bold" text-anchor="middle" font-family="Inter">${this.selectedGate}</text>

        <!-- Linha de Saída -->
        <line x1="280" y1="90" x2="380" y2="90" stroke="${colorOut}" stroke-width="5" stroke-linecap="round" />
        <circle cx="394" cy="90" r="14" fill="${colorOut}" />
        <text x="394" y="95" fill="#0f172a" font-size="12" font-weight="bold" text-anchor="middle">X=${out}</text>
        <text x="420" y="95" fill="#fff" font-weight="bold" font-family="Fira Code" font-size="13">X</text>
      `;
    }
  }
};
