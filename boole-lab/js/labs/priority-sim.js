/**
 * Simulação de Prioridade entre Máquinas Industriais
 * Cenário: Máquinas M1, M2, M3, M4 com prioridade M4 > M3 > M2 > M1.
 * Restrição: Máximo de 2 máquinas operando simultaneamente.
 */
const PrioritySimLab = {
  requests: [0, 0, 0, 0], // Botoeiras B1, B2, B3, B4

  render(container) {
    container.innerHTML = `
      <div class="card-box">
        <h2 class="card-title">Simulador de Prioridade entre Máquinas</h2>
        <p>Ajuste os pedidos de acionamento (B1 a B4). O sistema autoriza no máximo 2 máquinas operando ao mesmo tempo, respeitando a hierarquia de prioridade (M4 > M3 > M2 > M1).</p>

        <div style="display: flex; gap: 1rem; margin: 1.5rem 0;">
          ${[1, 2, 3, 4].map(i => `
            <button class="btn-action btn-machine" data-m="${i}">
              Botoeira B${i}: <span id="btn-state-${i}">OFF</span>
            </button>
          `).join('')}
        </div>

        <h3>Status de Funcionamento das Máquinas:</h3>
        <div style="display: flex; gap: 1.5rem; margin-top: 1rem;">
          ${[1, 2, 3, 4].map(i => `
            <div class="led-indicator">
              <span>M${i}:</span>
              <div id="led-m${i}" class="led-light off"></div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    document.querySelectorAll('.btn-machine').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mIdx = parseInt(btn.getAttribute('data-m')) - 1;
        this.requests[mIdx] = this.requests[mIdx] ? 0 : 1;
        document.getElementById(`btn-state-${mIdx + 1}`).innerText = this.requests[mIdx] ? 'ON' : 'OFF';
        this.update();
      });
    });

    this.update();
  },

  update() {
    // Lógica de prioridade de até 2 máquinas ativas
    const activeMachines = [0, 0, 0, 0];
    let count = 0;

    // Avalia da maior prioridade (M4) para a menor (M1)
    for (let i = 3; i >= 0; i--) {
      if (this.requests[i] && count < 2) {
        activeMachines[i] = 1;
        count++;
      }
    }

    for (let i = 0; i < 4; i++) {
      const led = document.getElementById(`led-m${i + 1}`);
      led.className = `led-light ${activeMachines[i] ? 'on' : 'off'}`;
    }
  }
};