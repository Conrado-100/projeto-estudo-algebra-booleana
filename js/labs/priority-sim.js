/**
 * Simulação de Prioridade Industrial de Máquinas
 */
const PrioritySimLab = {
  m1: 0, m2: 0, m3: 0, m4: 0,

  render(container) {
    container.innerHTML = `
      <div class="card-box">
        <h2 class="card-title">Simulador de Prioridade entre Máquinas</h2>
        <p style="color: var(--text-muted); font-size: 0.9rem;">
          Sistema de travamento lógico industrial com hierarquia estrita $M_4 > M_3 > M_2 > M_1$ e restrição de potência (máximo 2 máquinas em simultâneo).
        </p>

        <!-- Guia Didático -->
        <details class="card-box" style="background: #0f172a; border-color: var(--primary); margin: 1rem 0;" open>
          <summary style="cursor: pointer; font-weight: bold; color: var(--primary); font-size: 1rem;">
            ⚙️ Regras do Intertravamento Digital (Clique para expandir)
          </summary>
          <div style="margin-top: 0.8rem; font-size: 0.85rem; color: var(--text-muted); line-height: 1.5;">
            <p>1. <strong>Hierarquia:</strong> A máquina $M_4$ tem prioridade absoluta, seguida por $M_3$, $M_2$ e $M_1$.</p>
            <p>2. <strong>Trava de Segurança:</strong> A subestação suporta no máximo **2 máquinas ligadas ao mesmo tempo**.</p>
            <p>3. Se 3 ou 4 máquinas solicitarem partida, o circuito lógico bloqueia automaticamente as de menor prioridade!</p>
          </div>
        </details>

        <!-- Solicitações de Partida -->
        <div style="display: flex; gap: 1.25rem; margin: 1rem 0; flex-wrap: wrap;">
          ${[1, 2, 3, 4].map(n => `
            <div class="switch-container">
              <span>Solicitar M${n}:</span>
              <label class="switch"><input type="checkbox" id="req-m${n}" ${this[`m${n}`] ? 'checked' : ''}><span class="slider"></span></label>
            </div>
          `).join('')}
        </div>

        <!-- Painel de Saída Atuadores -->
        <div id="priority-output-panel" style="background: var(--bg-dark); padding: 1.25rem; border-radius: 8px; border: 1px solid var(--border-color); margin-top: 1rem;"></div>
      </div>
    `;

    this.attachEvents();
    this.update();
  },

  attachEvents() {
    [1, 2, 3, 4].forEach(n => {
      const el = document.getElementById(`req-m${n}`);
      if (el) {
        el.addEventListener('change', (e) => {
          this[`m${n}`] = e.target.checked ? 1 : 0;
          this.update();
        });
      }
    });
  },

  update() {
    const requests = [
      { id: 4, req: this.m4 },
      { id: 3, req: this.m3 },
      { id: 2, req: this.m2 },
      { id: 1, req: this.m1 }
    ];

    let activeCount = 0;
    const status = { 1: false, 2: false, 3: false, 4: false };

    requests.forEach(m => {
      if (m.req && activeCount < 2) {
        status[m.id] = true;
        activeCount++;
      } else {
        status[m.id] = false;
      }
    });

    const panel = document.getElementById('priority-output-panel');
    if (panel) {
      panel.innerHTML = `
        <h4 style="color: var(--primary); margin-bottom: 0.75rem;">Status dos Atuadores Industriais</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem;">
          ${[4, 3, 2, 1].map(n => {
            const req = this[`m${n}`];
            const active = status[n];
            let badgeText = "Inativa";
            let color = "var(--text-muted)";

            if (req && active) {
              badgeText = "AUTORIZADA ✓";
              color = "var(--accent-green)";
            } else if (req && !active) {
              badgeText = "BLOQUEADA (Prioridade)";
              color = "#ef4444";
            }

            return `
              <div style="background: #0f172a; padding: 0.85rem; border-radius: 6px; border: 1px solid ${active ? 'var(--accent-green)' : 'var(--border-color)'};">
                <div style="font-weight: bold; color: #fff;">Máquina M${n}${n === 4 ? '(Mais Alta)' : ''}</div>
                <div style="font-size: 0.85rem; color: ${color}; font-weight: bold; margin-top: 0.3rem;">${badgeText}</div>
              </div>
            `;
          }).join('')}
        </div>
        <div style="margin-top: 1rem; font-size: 0.8rem; color: var(--text-muted); background: #0f172a; padding: 0.5rem 0.75rem; border-radius: 4px;">
          • Máquinas em operação simultânea: <strong>${activeCount} / 2</strong> (Limite de segurança da rede).
        </div>
      `;
    }
  }
};