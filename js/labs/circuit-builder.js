/**
 * Visualizador Dinâmico de Circuitos com Guia Didático Integrado
 */
const CircuitBuilderLab = {
  inputA: 1,
  inputB: 0,
  selectedGate: 'AND',

  render(container) {
    container.innerHTML = `
      <div class="card-box">
        <h2 class="card-title">Visualizador Dinâmico de Circuitos</h2>
        <p style="color: var(--text-muted); font-size: 0.9rem;">
          Observe em tempo real como o sinal elétrico (0 V ou 5 V) se propaga através das portas lógicas até a saída.
        </p>

        <!-- Guia Didático -->
        <details class="card-box" style="background: #0f172a; border-color: var(--primary); margin: 1rem 0;" open>
          <summary style="cursor: pointer; font-weight: bold; color: var(--primary); font-size: 1rem;">
            ⚡ Como Interpretar o Esquema do Circuito? (Clique para expandir)
          </summary>
          <div style="margin-top: 0.8rem; font-size: 0.85rem; color: var(--text-muted); line-height: 1.5;">
            <p>• <strong>Linha Verde:</strong> Representa sinal nível ALTO ($1$ / Presença de Tensão / 5V).</p>
            <p>• <strong>Linha Cinza/Vermelha:</strong> Representa sinal nível BAIXO ($0$ / Ausência de Tensão / 0V).</p>
            <p>• <strong>Bloco Central:</strong> É o Circuito Integrado que executa a função lógica selecionada.</p>
          </div>
        </details>

        <!-- Controles de Entrada e Seleção -->
        <div style="display: flex; gap: 1.5rem; margin: 1rem 0; align-items: center; flex-wrap: wrap;">
          <div class="switch-container">
            <span>Entrada A:</span>
            <label class="switch"><input type="checkbox" id="circ-in-a" ${this.inputA ? 'checked' : ''}><span class="slider"></span></label>
            <strong id="circ-val-a" style="color: ${this.inputA ? 'var(--accent-green)' : 'var(--text-muted)'}">${this.inputA}</strong>
          </div>
          <div class="switch-container" id="circ-cont-b">
            <span>Entrada B:</span>
            <label class="switch"><input type="checkbox" id="circ-in-b" ${this.inputB ? 'checked' : ''}><span class="slider"></span></label>
            <strong id="circ-val-b" style="color: ${this.inputB ? 'var(--accent-green)' : 'var(--text-muted)'}">${this.inputB}</strong>
          </div>
          <div>
            <label><strong>Porta Lógica:</strong></label>
            <select id="circ-gate-select" class="btn-action" style="background: var(--bg-dark); color: #fff; margin-left: 0.5rem;">
              <option value="AND">AND (E)</option>
              <option value="OR">OR (OU)</option>
              <option value="NOT">NOT (Inversor)</option>
              <option value="NAND">NAND</option>
              <option value="NOR">NOR</option>
              <option value="XOR">XOR</option>
              <option value="XNOR">XNOR</option>
            </select>
          </div>
        </div>

        <div style="padding: 1.5rem; background-color: var(--bg-dark); border-radius: 8px; text-align: center; margin-top: 1rem;">
          <svg id="circuit-svg" viewBox="0 0 450 180" style="width: 100%; max-width: 500px; background: #0f172a; border-radius: 8px; border: 1px solid var(--border-color);"></svg>
        </div>
      </div>
    `;

    this.attachEvents();
    this.drawCircuit();
  },

  attachEvents() {
    const inA = document.getElementById('circ-in-a');
    const inB = document.getElementById('circ-in-b');
    const sel = document.getElementById('circ-gate-select');

    if (inA) {
      inA.addEventListener('change', (e) => {
        this.inputA = e.target.checked ? 1 : 0;
        document.getElementById('circ-val-a').innerText = this.inputA;
        document.getElementById('circ-val-a').style.color = this.inputA ? 'var(--accent-green)' : 'var(--text-muted)';
        this.drawCircuit();
      });
    }

    if (inB) {
      inB.addEventListener('change', (e) => {
        this.inputB = e.target.checked ? 1 : 0;
        document.getElementById('circ-val-b').innerText = this.inputB;
        document.getElementById('circ-val-b').style.color = this.inputB ? 'var(--accent-green)' : 'var(--text-muted)';
        this.drawCircuit();
      });
    }

    if (sel) {
      sel.addEventListener('change', (e) => {
        this.selectedGate = e.target.value;
        const contB = document.getElementById('circ-cont-b');
        if (contB) contB.style.display = this.selectedGate === 'NOT' ? 'none' : 'flex';
        this.drawCircuit();
      });
    }
  },

  calculateOutput() {
    const a = this.inputA, b = this.inputB;
    switch (this.selectedGate) {
      case 'NOT': return a === 1 ? 0 : 1;
      case 'AND': return (a && b) ? 1 : 0;
      case 'OR': return (a || b) ? 1 : 0;
      case 'NAND': return !(a && b) ? 1 : 0;
      case 'NOR': return !(a || b) ? 1 : 0;
      case 'XOR': return (a !== b) ? 1 : 0;
      case 'XNOR': return (a === b) ? 1 : 0;
      default: return 0;
    }
  },

  drawCircuit() {
    const svg = document.getElementById('circuit-svg');
    if (!svg) return;

    const out = this.calculateOutput();

    const colorA = this.inputA ? '#22c55e' : '#64748b';
    const colorB = this.inputB ? '#22c55e' : '#64748b';
    const colorOut = out ? '#22c55e' : '#ef4444';

    if (this.selectedGate === 'NOT') {
      svg.innerHTML = `
        <line x1="40" y1="90" x2="180" y2="90" stroke="${colorA}" stroke-width="5" stroke-linecap="round" />
        <text x="15" y="95" fill="#fff" font-weight="bold" font-family="Fira Code">A (${this.inputA})</text>

        <polygon points="180,50 180,130 250,90" fill="#1e293b" stroke="#38bdf8" stroke-width="3" />
        <circle cx="258" cy="90" r="8" fill="#1e293b" stroke="#38bdf8" stroke-width="3" />
        <text x="210" y="95" fill="#38bdf8" font-size="14" font-weight="bold" text-anchor="middle">NOT</text>

        <line x1="266" y1="90" x2="380" y2="90" stroke="${colorOut}" stroke-width="5" stroke-linecap="round" />
        <circle cx="395" cy="90" r="14" fill="${colorOut}" />
        <text x="395" y="95" fill="#0f172a" font-size="12" font-weight="bold" text-anchor="middle">${out}</text>
        <text x="420" y="95" fill="#fff" font-weight="bold">X</text>
      `;
    } else {
      svg.innerHTML = `
        <line x1="40" y1="50" x2="180" y2="50" stroke="${colorA}" stroke-width="5" stroke-linecap="round" />
        <text x="15" y="55" fill="#fff" font-weight="bold" font-family="Fira Code">A (${this.inputA})</text>

        <line x1="40" y1="130" x2="180" y2="130" stroke="${colorB}" stroke-width="5" stroke-linecap="round" />
        <text x="15" y="135" fill="#fff" font-weight="bold" font-family="Fira Code">B (${this.inputB})</text>

        <rect x="180" y="30" width="100" height="120" rx="12" fill="#1e293b" stroke="#38bdf8" stroke-width="3" />
        <text x="230" y="98" fill="#38bdf8" font-size="18" font-weight="bold" text-anchor="middle" font-family="Inter">${this.selectedGate}</text>

        <line x1="280" y1="90" x2="380" y2="90" stroke="${colorOut}" stroke-width="5" stroke-linecap="round" />
        <circle cx="395" cy="90" r="14" fill="${colorOut}" />
        <text x="395" y="95" fill="#0f172a" font-size="12" font-weight="bold" text-anchor="middle">${out}</text>
        <text x="420" y="95" fill="#fff" font-weight="bold">X</text>
      `;
    }
  }
};