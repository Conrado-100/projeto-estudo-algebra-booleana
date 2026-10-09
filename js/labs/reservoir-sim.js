/**
 * Simulação de Automação Industrial: Reservatório de Água
 */
const ReservoirSimLab = {
  sensorA: 1,
  sensorB: 0,
  sensorC: 0,

  render(container) {
    container.innerHTML = `
      <div class="card-box">
        <h2 class="card-title">Simulador do Reservatório de Água</h2>
        <p style="color: var(--text-muted); font-size: 0.9rem;">
          Aplicação prática de álgebra booleana para controle automatizado de eletroválvula e bomba de elevação.
        </p>

        <!-- Guia Didático da Aplicação Industrial -->
        <details class="card-box" style="background: #0f172a; border-color: var(--primary); margin: 1rem 0;" open>
          <summary style="cursor: pointer; font-weight: bold; color: var(--primary); font-size: 1rem;">
            🏭 Regras Lógicas de Automação do Sistema (Clique para expandir)
          </summary>
          <div style="margin-top: 0.8rem; font-size: 0.85rem; color: var(--text-muted); line-height: 1.5;">
            <p>• <strong>Sensor A (Fundo Térreo):</strong> Detecta se há água no reservatório inferior.</p>
            <p>• <strong>Sensor B (Topo Térreo):</strong> Detecta se o reservatório inferior atingiu a capacidade máxima.</p>
            <p>• <strong>Sensor C (Topo Elevado):</strong> Detecta se o reservatório superior está cheio.</p>
            <hr style="border-color: var(--border-color); margin: 0.5rem 0;">
            <p>• <strong>Eletroválvula $X = \\bar{B}$:</strong> Abre para encher o térreo sempre que ele NÃO estiver cheio.</p>
            <p>• <strong>Bomba $Y = A \\cdot \\bar{C}$:</strong> Liga para enviar água ao elevado se HOUVER água no térreo ($A=1$) E o elevado NÃO estiver cheio ($\\bar{C}=1$).</p>
          </div>
        </details>

        <!-- Interruptores dos Sensores -->
        <div style="display: flex; gap: 1.5rem; margin: 1rem 0; flex-wrap: wrap;">
          <div class="switch-container">
            <span>Sensor A (Fundo Térreo):</span>
            <label class="switch"><input type="checkbox" id="sens-a" ${this.sensorA ? 'checked' : ''}><span class="slider"></span></label>
          </div>
          <div class="switch-container">
            <span>Sensor B (Topo Térreo):</span>
            <label class="switch"><input type="checkbox" id="sens-b" ${this.sensorB ? 'checked' : ''}><span class="slider"></span></label>
          </div>
          <div class="switch-container">
            <span>Sensor C (Topo Elevado):</span>
            <label class="switch"><input type="checkbox" id="sens-c" ${this.sensorC ? 'checked' : ''}><span class="slider"></span></label>
          </div>
        </div>

        <!-- Painel de Estado dos Atuadores -->
        <div id="reservoir-status-panel" style="background: var(--bg-dark); padding: 1.25rem; border-radius: 8px; border: 1px solid var(--border-color); margin-top: 1rem;"></div>
      </div>
    `;

    this.attachEvents();
    this.update();
  },

  attachEvents() {
    ['a', 'b', 'c'].forEach(s => {
      const el = document.getElementById(`sens-${s}`);
      if (el) {
        el.addEventListener('change', (e) => {
          this[`sensor${s.toUpperCase()}`] = e.target.checked ? 1 : 0;
          this.update();
        });
      }
    });
  },

  update() {
    const valX = this.sensorB === 1 ? 0 : 1;
    const valY = (this.sensorA === 1 && this.sensorC === 0) ? 1 : 0;

    const panel = document.getElementById('reservoir-status-panel');
    if (panel) {
      panel.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem;">
          <div style="background: #0f172a; padding: 1rem; border-radius: 6px; border-left: 4px solid ${valX ? 'var(--accent-green)' : '#ef4444'};">
            <h4 style="margin: 0; color: #fff;">Eletroválvula X (Entrada)</h4>
            <div style="font-family: var(--font-code); font-size: 1.1rem; margin: 0.3rem 0; color: ${valX ? 'var(--accent-green)' : '#ef4444'};">
              Fórmula: X = ~B ➔ Output: ${valX} (${valX ? 'ABERTA' : 'FECHADA'})
            </div>
            <span style="font-size: 0.8rem; color: var(--text-muted);">${valX ? 'Abastecendo reservatório térreo...' : 'Térreo cheio. Válvula fechada por segurança.'}</span>
          </div>

          <div style="background: #0f172a; padding: 1rem; border-radius: 6px; border-left: 4px solid ${valY ? 'var(--accent-green)' : '#ef4444'};">
            <h4 style="margin: 0; color: #fff;">Bomba de Elevação Y</h4>
            <div style="font-family: var(--font-code); font-size: 1.1rem; margin: 0.3rem 0; color: ${valY ? 'var(--accent-green)' : '#ef4444'};">
              Fórmula: Y = A · ~C ➔ Output: ${valY} (${valY ? 'LIGADA' : 'DESLIGADA'})
            </div>
            <span style="font-size: 0.8rem; color: var(--text-muted);">${valY ? 'Bombeando água para o reservatório elevado...' : 'Bomba inativa (Sem água na base ou reservatório topo cheio).'}</span>
          </div>
        </div>
      `;
    }
  }
};