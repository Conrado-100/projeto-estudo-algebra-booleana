/**
 * Simulador de Simplificação Booleana Passo a Passo
 */
const SimplifierLab = {
  examples: [
    {
      title: "Exemplo das Anotações 1: Simplificação Algébrica",
      initialExpr: "A.B.C + A.B.~C + A.~C",
      vars: ['A', 'B', 'C'],
      steps: [
        { expr: "A.B.C + A.B.~C + A.~C", rule: "Expressão inicial extraída das anotações." },
        { expr: "A.B.(C + ~C) + A.~C", rule: "Fatoração em evidência de A.B usando Distributividade." },
        { expr: "A.B.(1) + A.~C", rule: "Aplicação do Postulado do Complemento: C + ~C = 1." },
        { expr: "A.B + A.~C", rule: "Aplicação do Elemento Neutro: A.B · 1 = A.B." },
        { expr: "A.(B + ~C)", rule: "Colocando A em evidência (Expressão final minimizada)." }
      ]
    }
  ],

  currentStep: 0,

  render(container) {
    // Reinicia o passo toda vez que o lab é carregado, evitando estado residual
    // de uma visita anterior ao mesmo módulo.
    this.currentStep = 0;
    const ex = this.examples[0];
    container.innerHTML = `
      <div class="card-box">
        <h2 class="card-title">Simulador de Simplificação Booleana</h2>
        <p>Acompanhe cada etapa algébrica com a justificativa da lei booleana aplicada.</p>

        <div style="margin: 1.5rem 0;">
          <h3>${ex.title}</h3>
          <p><strong>Expressão Inicial:</strong> <code>${ex.initialExpr}</code></p>
        </div>

        <div id="step-display-card" class="card-box" style="background-color: #0f172a; margin: 1rem 0;">
          <!-- Passo exibido dinamicamente -->
        </div>

        <div style="display: flex; gap: 1rem;">
          <button id="btn-prev-step" class="btn-action">← Passo Anterior</button>
          <button id="btn-next-step" class="btn-action">Próximo Passo →</button>
        </div>

        <div id="equivalence-check-result" style="margin-top: 1.5rem;"></div>
      </div>
    `;

    document.getElementById('btn-prev-step').addEventListener('click', () => {
      if (this.currentStep > 0) {
        this.currentStep--;
        this.updateStep();
      }
    });

    document.getElementById('btn-next-step').addEventListener('click', () => {
      if (this.currentStep < ex.steps.length - 1) {
        this.currentStep++;
        this.updateStep();
      }
    });

    this.updateStep();
  },

  updateStep() {
    const ex = this.examples[0];
    const step = ex.steps[this.currentStep];

    document.getElementById('step-display-card').innerHTML = `
      <h4>Passo ${this.currentStep + 1} de ${ex.steps.length}</h4>
      <p style="font-size: 1.2rem; font-family: var(--font-code); color: var(--primary); margin: 0.5rem 0;">
        ${step.expr}
      </p>
      <p><strong>Regra Aplicada:</strong> ${step.rule}</p>
    `;

    // Validação matemática do resultado
    const isEquivalent = LogicEngine.areEquivalent(ex.initialExpr, step.expr, ex.vars);
    document.getElementById('equivalence-check-result').innerHTML = `
      <span style="color: ${isEquivalent ? 'var(--accent-green)' : 'var(--accent-red)'}">
        ${isEquivalent ? '✓ Validação Matemática: A expressão deste passo é 100% equivalente à inicial!' : '✕ Divergência detectada.'}
      </span>
    `;
  }
};