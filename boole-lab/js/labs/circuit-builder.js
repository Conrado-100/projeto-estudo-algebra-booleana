/**
 * Visualizador de Circuitos Lógicos Combinacionais
 */
const CircuitBuilderLab = {
  render(container) {
    container.innerHTML = `
      <div class="card-box">
        <h2 class="card-title">Visualizador de Circuitos Lógicos</h2>
        <p>Veja como as portas conectadas processam os sinais de entrada até a saída final.</p>
        
        <div style="padding: 2rem; background-color: var(--bg-dark); border-radius: 8px; text-align: center;">
          <svg width="400" height="160" style="background: #1e293b; border-radius: 8px;">
            <!-- Fios e Entradas -->
            <line x1="30" y1="40" x2="150" y2="40" stroke="#38bdf8" stroke-width="4" />
            <line x1="30" y1="120" x2="150" y2="120" stroke="#ef4444" stroke-width="4" />
            
            <!-- Desenho de Porta AND -->
            <rect x="150" y="20" width="80" height="120" rx="10" fill="#334155" stroke="#38bdf8" stroke-width="2" />
            <text x="175" y="85" fill="#fff" font-weight="bold">AND</text>
            
            <!-- Fio de Saída -->
            <line x1="230" y1="80" x2="350" y2="80" stroke="#ef4444" stroke-width="4" />
            <circle cx="360" cy="80" r="10" fill="#ef4444" />
          </svg>
        </div>
      </div>
    `;
  }
};