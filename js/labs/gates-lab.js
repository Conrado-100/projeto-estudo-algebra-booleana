/**
 * Laboratório de Portas Lógicas com Explicações Didáticas Detalhadas
 */
const GatesLab = {
  gateType: 'AND',
  inputA: 1,
  inputB: 0,

  render(container) {
    container.innerHTML = `
      <div class="card-box">
        <h2 class="card-title">Laboratório de Portas Lógicas</h2>
        <p style="color: var(--text-muted); font-size: 0.9rem;">
          Explore os blocos fundamentais dos circuitos digitais. Altere os valores de entrada e selecione diferentes portas para observar a resposta imediata da saída.
        </p>

        <!-- Guia Didático Introdutório -->
        <details class="card-box" style="background: #0f172a; border-color: var(--primary); margin: 1rem 0;" open>
          <summary style="cursor: pointer; font-weight: bold; color: var(--primary); font-size: 1rem;">
            💡 Guia Rápido: Como funcionam as Portas Lógicas? (Clique para expandir)
          </summary>
          <div style="margin-top: 0.8rem; font-size: 0.85rem; color: var(--text-muted); line-height: 1.5;">
            <p style="margin-bottom: 0.5rem;">Uma <strong>porta lógica</strong> é um circuito eletrônico que toma decisões com base nos sinais de entrada ($0$ = 0V / Desligado, $1$ = 5V / Ligado):</p>
            <ul style="margin-left: 1.2rem;">
              <li><strong>NOT (Inversor):</strong> Inverte o sinal ($0 \\rightarrow 1$ e $1 \\rightarrow 0$).</li>
              <li><strong>AND (E):</strong> Saída é $1$ <em>somente se todas</em> as entradas forem $1$ (como dois interruptores em série).</li>
              <li><strong>OR (OU):</strong> Saída é $1$ se <em>pelo menos uma</em> entrada for $1$ (interruptores em paralelo).</li>
              <li><strong>NAND / NOR:</strong> São as negações diretas da AND e da OR (Portas Universais).</li>
              <li><strong>XOR (OU Exclusivo):</strong> Saída é $1$ quando as entradas forem <em>diferentes</em> entre si.</li>
              <li><strong>XNOR (Coincidência):</strong> Saída é $1$ quando as entradas forem <em>iguais</em>.</li>
            </ul>
          </div>
        </details>

        <!-- Seleção de Porta e Controles de Entrada -->
        <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; margin-bottom: 1.5rem;">
          <div>
            <label><strong>Selecione a Porta:</strong></label>
            <select id="gate-type-select" class="btn-action" style="background: var(--bg-dark); color: #fff; margin-left: 0.5rem;">
              <option value="AND" selected>AND (E)</option>
              <option value="OR">OR (OU)</option>
              <option value="NOT">NOT (Inversor - 1 Entrada)</option>
              <option value="NAND">NAND (NÃO-E)</option>
              <option value="NOR">NOR (NÃO-OU)</option>
              <option value="XOR">XOR (OU Exclusivo)</option>
              <option value="XNOR">XNOR (Coincidência)</option>
            </select>
          </div>

          <div class="switch-container">
            <span>Entrada A:</span>
            <label class="switch"><input type="checkbox" id="gate-in-a" ${this.inputA ? 'checked' : ''}><span class="slider"></span></label>
            <strong id="gate-val-a" style="color: ${this.inputA ? 'var(--accent-green)' : 'var(--text-muted)'}">${this.inputA}</strong>
          </div>

          <div class="switch-container" id="container-in-b">
            <span>Entrada B:</span>
            <label class="switch"><input type="checkbox" id="gate-in-b" ${this.inputB ? 'checked' : ''}><span class="slider"></span></label>
            <strong id="gate-val-b" style="color: ${this.inputB ? 'var(--accent-green)' : 'var(--text-muted)'}">${this.inputB}</strong>
          </div>
        </div>

        <!-- Painel de Exibição Dinâmica e Tabela-Verdade Reativa -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
          <div style="background: var(--bg-dark); padding: 1.25rem; border-radius: 8px; border: 1px solid var(--border-color); text-align: center;">
            <h4 style="color: var(--primary); margin-bottom: 0.75rem;">Simulação do Circuito Lógico</h4>
            <div id="gate-svg-container" style="display: flex; justify-content: center; align-items: center; min-height: 160px;"></div>
            <div id="gate-explanation-text" style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.75rem; text-align: left; background: #0f172a; padding: 0.75rem; border-radius: 6px;"></div>
          </div>

          <div style="background: var(--bg-dark); padding: 1.25rem; border-radius: 8px; border: 1px solid var(--border-color);">
            <h4 style="color: var(--primary); margin-bottom: 0.75rem; text-align: center;">Tabela-Verdade em Tempo Real</h4>
            <div id="gate-truth-table-container"></div>
          </div>
        </div>
      </div>
    `;

    this.attachEvents();
    this.updateGate();
  },

  attachEvents() {
    const sel = document.getElementById('gate-type-select');
    if (sel) {
      sel.addEventListener('change', (e) => {
        this.gateType = e.target.value;
        const contB = document.getElementById('container-in-b');
        if (contB) contB.style.display = this.gateType === 'NOT' ? 'none' : 'flex';
        this.updateGate();
      });
    }

    const inA = document.getElementById('gate-in-a');
    if (inA) {
      inA.addEventListener('change', (e) => {
        this.inputA = e.target.checked ? 1 : 0;
        document.getElementById('gate-val-a').innerText = this.inputA;
        document.getElementById('gate-val-a').style.color = this.inputA ? 'var(--accent-green)' : 'var(--text-muted)';
        this.updateGate();
      });
    }

    const inB = document.getElementById('gate-in-b');
    if (inB) {
      inB.addEventListener('change', (e) => {
        this.inputB = e.target.checked ? 1 : 0;
        document.getElementById('gate-val-b').innerText = this.inputB;
        document.getElementById('gate-val-b').style.color = this.inputB ? 'var(--accent-green)' : 'var(--text-muted)';
        this.updateGate();
      });
    }
  },

  calculateOutput() {
    const a = this.inputA, b = this.inputB;
    switch (this.gateType) {
      case 'NOT': return a === 1 ? 0 : 1;
      case 'AND': return (a === 1 && b === 1) ? 1 : 0;
      case 'OR': return (a === 1 || b === 1) ? 1 : 0;
      case 'NAND': return !(a === 1 && b === 1) ? 1 : 0;
      case 'NOR': return !(a === 1 || b === 1) ? 1 : 0;
      case 'XOR': return (a !== b) ? 1 : 0;
      case 'XNOR': return (a === b) ? 1 : 0;
      default: return 0;
    }
  },

  updateGate() {
    const out = this.calculateOutput();
    const svgContainer = document.getElementById('gate-svg-container');
    const expText = document.getElementById('gate-explanation-text');
    const ttContainer = document.getElementById('gate-truth-table-container');

    const colorA = this.inputA ? '#22c55e' : '#64748b';
    const colorB = this.inputB ? '#22c55e' : '#64748b';
    const colorOut = out ? '#22c55e' : '#ef4444';

    if (svgContainer) {
      if (this.gateType === 'NOT') {
        svgContainer.innerHTML = `
          <svg width="280" height="120" viewBox="0 0 280 120" style="background:#0f172a; border-radius:8px;">
            <line x1="20" y1="60" x2="90" y2="60" stroke="${colorA}" stroke-width="4" />
            <text x="15" y="40" fill="#fff" font-family="Fira Code" font-size="12">A (${this.inputA})</text>
            <polygon points="90,30 90,90 160,60" fill="#1e293b" stroke="#38bdf8" stroke-width="3" />
            <circle cx="168" cy="60" r="7" fill="#1e293b" stroke="#38bdf8" stroke-width="3" />
            <line x1="175" y1="60" x2="240" y2="60" stroke="${colorOut}" stroke-width="4" />
            <circle cx="250" cy="60" r="12" fill="${colorOut}" />
            <text x="250" y="64" fill="#0f172a" font-size="11" font-weight="bold" text-anchor="middle">${out}</text>
          </svg>
        `;
      } else {
        svgContainer.innerHTML = `
          <svg width="300" height="150" viewBox="0 0 300 150" style="background:#0f172a; border-radius:8px;">
            <line x1="20" y1="45" x2="110" y2="45" stroke="${colorA}" stroke-width="4" />
            <text x="15" y="30" fill="#fff" font-family="Fira Code" font-size="12">A (${this.inputA})</text>

            <line x1="20" y1="105" x2="110" y2="105" stroke="${colorB}" stroke-width="4" />
            <text x="15" y="125" fill="#fff" font-family="Fira Code" font-size="12">B (${this.inputB})</text>

            <rect x="110" y="25" width="80" height="100" rx="10" fill="#1e293b" stroke="#38bdf8" stroke-width="3" />
            <text x="150" y="80" fill="#38bdf8" font-size="16" font-weight="bold" text-anchor="middle">${this.gateType}</text>

            <line x1="190" y1="75" x2="260" y2="75" stroke="${colorOut}" stroke-width="4" />
            <circle cx="270" cy="75" r="12" fill="${colorOut}" />
            <text x="270" y="79" fill="#0f172a" font-size="11" font-weight="bold" text-anchor="middle">${out}</text>
          </svg>
        `;
      }
    }

    if (expText) {
      let desc = '';
      switch (this.gateType) {
        case 'NOT': desc = `<strong>Inversão Lógica:</strong> Com entrada A = ${this.inputA}, a porta NOT inverte o sinal produzindo saída Y = <strong>${out}</strong>.`; break;
        case 'AND': desc = `<strong>Multiplicação Lógica (A · B):</strong> Como A = ${this.inputA} e B =${this.inputB}, a saída é <strong>${out}</strong> (só seria 1 se ambos fossem 1).`; break;
        case 'OR': desc = `<strong>Adição Lógica (A + B):</strong> Como A = ${this.inputA} e B =${this.inputB}, a saída é <strong>${out}</strong> (basta pelo menos um ser 1).`; break;
        case 'NAND': desc = `<strong>Negação da AND ~(A · B):</strong> Inverte a saída da porta AND. Com A = ${this.inputA} e B = ${this.inputB}, resulta em Y = <strong>${out}</strong>.`; break;
        case 'NOR': desc = `<strong>Negação da OR ~(A + B):</strong> Inverte a saída da porta OR. Com A = ${this.inputA} e B = ${this.inputB}, resulta em Y = <strong>${out}</strong>.`; break;
        case 'XOR': desc = `<strong>OU Exclusivo (A ⊕ B):</strong> Saída é 1 somente se as entradas forem diferentes. Com A = ${this.inputA} e B = ${this.inputB}, Y = <strong>${out}</strong>.`; break;
        case 'XNOR': desc = `<strong>Coincidência Lógica:</strong> Saída é 1 quando as entradas são iguais. Com A = ${this.inputA} e B = ${this.inputB}, Y = <strong>${out}</strong>.`; break;
      }
      expText.innerHTML = desc;
    }

    if (ttContainer) {
      let rowsHtml = '';
      if (this.gateType === 'NOT') {
        [0, 1].forEach(valA => {
          const res = valA === 1 ? 0 : 1;
          const isActive = (valA === this.inputA);
          rowsHtml += `
            <tr style="${isActive ? 'background: rgba(56, 189, 248, 0.25); font-weight: bold; color: var(--primary);' : ''}">
              <td style="padding: 0.4rem; text-align: center;">${valA}</td>
              <td style="padding: 0.4rem; text-align: center; color: ${res ? 'var(--accent-green)' : '#ef4444'}">${res}</td>
            </tr>
          `;
        });
        ttContainer.innerHTML = `
          <table class="truth-table-styled" style="width: 100%; border-collapse: collapse;">
            <thead><tr style="border-bottom: 2px solid var(--border-color);"><th>A</th><th>Y = ~A</th></tr></thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        `;
      } else {
        const combinations = [
          {a: 0, b: 0},
          {a: 0, b: 1},
          {a: 1, b: 0},
          {a: 1, b: 1}
        ];
        combinations.forEach(c => {
          let res = 0;
          switch (this.gateType) {
            case 'AND': res = (c.a && c.b) ? 1 : 0; break;
            case 'OR': res = (c.a || c.b) ? 1 : 0; break;
            case 'NAND': res = !(c.a && c.b) ? 1 : 0; break;
            case 'NOR': res = !(c.a || c.b) ? 1 : 0; break;
            case 'XOR': res = (c.a !== c.b) ? 1 : 0; break;
            case 'XNOR': res = (c.a === c.b) ? 1 : 0; break;
          }
          const isActive = (c.a === this.inputA && c.b === this.inputB);
          rowsHtml += `
            <tr style="${isActive ? 'background: rgba(56, 189, 248, 0.25); font-weight: bold; color: var(--primary);' : ''}">
              <td style="padding: 0.4rem; text-align: center;">${c.a}</td>
              <td style="padding: 0.4rem; text-align: center;">${c.b}</td>
              <td style="padding: 0.4rem; text-align: center; color: ${res ? 'var(--accent-green)' : '#ef4444'}">${res}</td>
            </tr>
          `;
        });
        ttContainer.innerHTML = `
          <table class="truth-table-styled" style="width: 100%; border-collapse: collapse;">
            <thead><tr style="border-bottom: 2px solid var(--border-color);"><th>A</th><th>B</th><th>Y (${this.gateType})</th></tr></thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        `;
      }
    }
  }
};