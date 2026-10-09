/**
 * Simulação Prática: Controle do Reservatório de Água
 * Regras extraídas das anotações:
 * Entradas: A (Fundo Térreo), B (Topo Térreo), C (Topo Elevado)
 * Saídas: Eletroválvula (X = ~B), Bomba de Elevação (Y = A . ~C)
 */
const ReservoirSimLab = {
  sensorA: 1,
  sensorB: 0,
  sensorC: 0,

  render(container) {
    container.innerHTML = `
      <div class="card-box">
        <h2 class="card-title">Simulador do Reservatório de Água</h2>
        <p>Ajuste o estado dos sensores para observar o acionamento da Eletroválvula (X) e da Bomba (Y).</p>

        <div style="display: flex; gap: 1rem; margin: 1rem 0; flex-wrap: wrap;">
          <div class="switch-container">
            <span>Sensor A (Fundo Térreo):</span>
            <label class="switch"><input type="checkbox" id="res-sA" checked><span class="slider"></span></label>
          </div>
          <div class="switch-container">
            <span>Sensor B (Topo Térreo):</span>
            <label class="switch"><input type="checkbox" id="res-sB"><span class="slider"></span></label>
          </div>
          <div class="switch-container">
            <span>Sensor C (Topo Elevado):</span>
            <label class="switch"><input type="checkbox" id="res-sC"><span class="slider"></span></label>
          </div>
        </div>

        <div class="reservoir-container">
          <!-- Reservatório Térreo -->
          <div class="water-tank">
            <div id="tank-ground-water" class="water-level" style="height: 40%;"></div>
            <div class="sensor-dot sensor-a-dot ${this.sensorA ? 'active' : ''}" style="bottom: 10px;" title="Sensor A (Fundo Térreo)"></div>
            <div class="sensor-dot sensor-b-dot ${this.sensorB ? 'active' : ''}" style="top: 10px;" title="Sensor B (Topo Térreo)"></div>
          </div>

          <!-- Reservatório Elevado -->
          <div class="water-tank">
            <div id="tank-elevated-water" class="water-level" style="height: 20%;"></div>
            <div class="sensor-dot sensor-c-dot ${this.sensorC ? 'active' : ''}" style="top: 10px;" title="Sensor C (Topo Elevado)"></div>
          </div>
        </div>

        <div style="display: flex; gap: 2rem; margin-top: 1.5rem;">
          <div class="led-indicator">
            <span>Eletroválvula (X = ~B):</span>
            <div id="led-valve" class="led-light"></div>
          </div>
          <div class="led-indicator">
            <span>Bomba de Elevação (Y = A · ~C):</span>
            <div id="led-pump" class="led-light"></div>
          </div>
        </div>
      </div>
    `;

    this.attachEvents();
    this.update();
  },

  attachEvents() {
    document.getElementById('res-sA').addEventListener('change', (e) => {
      this.sensorA = e.target.checked ? 1 : 0;
      this.update();
    });
    document.getElementById('res-sB').addEventListener('change', (e) => {
      this.sensorB = e.target.checked ? 1 : 0;
      this.update();
    });
    document.getElementById('res-sC').addEventListener('change', (e) => {
      this.sensorC = e.target.checked ? 1 : 0;
      this.update();
    });
  },

  update() {
    // Equações das anotações: X = ~B, Y = A . ~C
    const valveX = this.sensorB ? 0 : 1;
    const pumpY = (this.sensorA && !this.sensorC) ? 1 : 0;

    document.getElementById('led-valve').className = `led-light ${valveX ? 'on' : 'off'}`;
    document.getElementById('led-pump').className = `led-light ${pumpY ? 'on' : 'off'}`;

    // Atualiza os indicadores visuais dos sensores nos reservatórios
    document.querySelectorAll('.sensor-a-dot').forEach(el => {
      el.className = `sensor-dot sensor-a-dot ${this.sensorA ? 'active' : ''}`;
    });
    document.querySelectorAll('.sensor-b-dot').forEach(el => {
      el.className = `sensor-dot sensor-b-dot ${this.sensorB ? 'active' : ''}`;
    });
    document.querySelectorAll('.sensor-c-dot').forEach(el => {
      el.className = `sensor-dot sensor-c-dot ${this.sensorC ? 'active' : ''}`;
    });

    // Atualização visual da água
    document.getElementById('tank-ground-water').style.height = this.sensorB ? '90%' : (this.sensorA ? '40%' : '5%');
    document.getElementById('tank-elevated-water').style.height = this.sensorC ? '90%' : '15%';
  }
};