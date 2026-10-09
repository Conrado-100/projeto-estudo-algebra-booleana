/**
 * Simulador de Simplificação Algébrica Passo a Passo com Guia Didático
 */
const SimplifierLab = {
  currentStep: 0,

  render(container) {
    this.currentStep = 0;
    container.innerHTML = `
      <div class="card-box">
        <h2 class="card-title">Simulador de Simplificação Algébrica</h2>
        <p style="color: var(--text-muted); font-size: 0.9rem;">
          Acompanhe a redução de expressões booleanas passo a passo, compreendendo as propriedades e postulados aplicados.
        </p>

        <!-- Guia Didático dos Postulados -->
        <details class="card-box" style="background: #0f172a; border-color: var(--primary); margin: 1rem 0;" open>
          <summary style="cursor: pointer; font-weight: bold; color: var(--primary); font-size: 1rem;">
            📚 Principais Postulados e Leis Utilizadas (Clique para expandir)
          </summary>
          <div style="margin-top: 0.8rem; font-size: 0.85rem; color: var(--text-muted); line-height: 1.5; display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 0.75rem;">
            <div>
              <strong style="color: #fff;">Distributiva:</strong><br>
              <code>A·B + A·C = A·(B + C)</code>
            </div>
            <div>
              <strong style="color: #fff;">Complemento:</strong><br>
              <code>B + ~B = 1</code> e <code>B · ~B = 0</code>
            </div>
            <div>
              <strong style="color: #fff;">Identidade:</strong><br>
              <code>A · 1 = A</code> e <code>A + 0 = A</code>
            </div>
            <div>
              <strong style="color: #fff;">Absorção:</strong><br>
              <code>A + A·B = A</code>
            </div>
          </div>
        </details>

        <!-- Exemplo Interativo Passo a Passo -->
        <div style="background: var(--bg-dark); padding: 1.25rem; border-radius: 8px; border: 1px solid var(--border-color);">
        <h3 style="color: var(--primary); margin-bottom: 0.5rem;">Exemplo Prático: Simplificando $A \cdot B + A \cdot \bar{B}$</h3>
          
          <div id="simplifier-steps-container" style="margin: 1rem 0;"></div>

          <div style="display: flex; gap: 0.75rem;">
            <button id="btn-simp-next" class="btn-action" style="background: var(--primary); color: #0f172a; font-weight: bold;">Avançar Passo ➔</button>
            <button id="btn-simp-reset" class="btn-action" style="background: #334155; color: #fff;">Reiniciar</button>
          </div>
        </div>
      </div>
    `;

    this.attachEvents();
    this.updateSteps();
  },

  steps: [
    {
      expr: "A . B + A . ~B",
      rule: "Expressão Original",
      explanation: "Temos a soma de dois produtos que possuem a variável 'A' em comum."
    },
    {
      expr: "A . (B + ~B)",
      rule: "Propriedade Distributiva",
      explanation: "Colocamos o termo comum 'A' em evidência: A · (B + ~B)."
    },
    {
      expr: "A . (1)",
      rule: "Postulado do Complemento",
      explanation: "Qualquer variável somada ao seu inverso é igual a 1 (B + ~B = 1)."
    },
    {
      expr: "A",
      rule: "Postulado da Identidade",
      explanation: "Qualquer variável multiplicada por 1 resulta nela mesma (A · 1 = A)."
    }
  ],

  attachEvents() {
    const btnNext = document.getElementById('btn-simp-next');
    const btnReset = document.getElementById('btn-simp-reset');

    if (btnNext) {
      btnNext.addEventListener('click', () => {
        if (this.currentStep < this.steps.length - 1) {
          this.currentStep++;
          this.updateSteps();
        }
      });
    }

    if (btnReset) {
      btnReset.addEventListener('click', () => {
        this.currentStep = 0;
        this.updateSteps();
      });
    }
  },

  updateSteps() {
    const container = document.getElementById('simplifier-steps-container');
    const btnNext = document.getElementById('btn-simp-next');
    if (!container) return;

    let html = '';
    for (let i = 0; i <= this.currentStep; i++) {
      const step = this.steps[i];
      const isCurrent = (i === this.currentStep);
      html += `
        <div style="padding: 0.85rem; background: ${isCurrent ? '#0f172a' : 'transparent'}; border-left: 4px solid ${isCurrent ? 'var(--primary)' : 'var(--border-color)'}; margin-bottom: 0.75rem; border-radius: 0 6px 6px 0;">
          <div style="font-size: 0.8rem; color: var(--primary); font-weight: bold;">PASSO ${i + 1}: ${step.rule}</div>
          <div style="font-family: var(--font-code); font-size: 1.25rem; color: var(--accent-green); margin: 0.25rem 0;">${step.expr}</div>
          <div style="font-size: 0.85rem; color: var(--text-muted);">${step.explanation}</div>
        </div>
      `;
    }

    container.innerHTML = html;

    if (btnNext) {
      if (this.currentStep === this.steps.length - 1) {
        btnNext.disabled = true;
        btnNext.innerText = "Simplificação Concluída ✓";
        btnNext.style.opacity = "0.6";
      } else {
        btnNext.disabled = false;
        btnNext.innerText = "Avançar Passo ➔";
        btnNext.style.opacity = "1";
      }
    }
  }
};