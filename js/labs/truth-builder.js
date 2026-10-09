/**
 * Construtor Dinâmico de Tabelas-Verdade com Explicação Passo a Passo
 */
const TruthBuilderLab = {
  expression: "A . B + ~A",

  render(container) {
    container.innerHTML = `
      <div class="card-box">
        <h2 class="card-title">Construtor de Tabelas-Verdade</h2>
        <p style="color: var(--text-muted); font-size: 0.9rem;">
          Digite uma expressão booleana e visualize a geração automática de todas as combinações lógicas ($2^n$ linhas).
        </p>

        <!-- Guia Didático -->
        <details class="card-box" style="background: #0f172a; border-color: var(--primary); margin: 1rem 0;" open>
          <summary style="cursor: pointer; font-weight: bold; color: var(--primary); font-size: 1rem;">
            📖 Como Montar uma Tabela-Verdade? (Clique para expandir)
          </summary>
          <div style="margin-top: 0.8rem; font-size: 0.85rem; color: var(--text-muted); line-height: 1.5;">
            <p><strong>1. Notação Aceita no Campo:</strong></p>
            <ul style="margin-left: 1.2rem; margin-bottom: 0.5rem;">
              <li><strong>E (AND):</strong> Use ponto <code>.</code> ou concatenação (ex: <code>A . B</code>)</li>
              <li><strong>OU (OR):</strong> Use o sinal de mais <code>+</code> (ex: <code>A + B</code>)</li>
              <li><strong>NÃO (NOT):</strong> Use o til <code>~</code> antes da letra (ex: <code>~A</code>)</li>
              <li><strong>XOR:</strong> Use o circunflexo <code>^</code> (ex: <code>A ^ B</code>)</li>
            </ul>
            <p><strong>2. Ordem das Linhas:</strong> A tabela segue a contagem binária padrão ($00, 01, 10, 11$). Para $N$ variáveis, a tabela possuirá exatamente $2^N$ linhas.</p>
          </div>
        </details>

        <!-- Entrada de Expressão -->
        <div style="display: flex; gap: 0.75rem; margin-bottom: 1.25rem; flex-wrap: wrap;">
          <input type="text" id="truth-expr-input" value="${this.expression}" placeholder="Ex: A . B + ~C" class="btn-action" style="flex: 1; min-width: 240px; background: var(--bg-dark); color: #fff; text-align: left; font-family: var(--font-code);">
          <button id="btn-generate-truth" class="btn-action" style="background: var(--primary); color: #0f172a; font-weight: bold;">Gerar Tabela</button>
        </div>

        <!-- Tabela Resultante -->
        <div id="truth-table-output" style="overflow-x: auto;"></div>
      </div>
    `;

    this.attachEvents();
    this.generateTable();
  },

  attachEvents() {
    const btn = document.getElementById('btn-generate-truth');
    const input = document.getElementById('truth-expr-input');

    if (btn && input) {
      btn.addEventListener('click', () => {
        this.expression = input.value.trim();
        this.generateTable();
      });

      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.expression = input.value.trim();
          this.generateTable();
        }
      });
    }
  },

  generateTable() {
    const output = document.getElementById('truth-table-output');
    if (!output) return;

    if (!this.expression) {
      output.innerHTML = '<p style="color: #ef4444;">Por favor, digite uma expressão válida.</p>';
      return;
    }

    try {
      const vars = LogicEngine.extractVariables(this.expression);
      if (vars.length === 0) {
        output.innerHTML = '<p style="color: #ef4444;">Nenhuma variável válida encontrada (use letras como A, B, C).</p>';
        return;
      }

      const tt = LogicEngine.generateTruthTable(this.expression);
      
      let tableHtml = `
        <table class="truth-table-styled" style="width: 100%; border-collapse: collapse; background: var(--bg-dark); border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="border-bottom: 2px solid var(--border-color); background: #1e293b;">
              <th style="padding: 0.6rem;">#</th>
      `;

      vars.forEach(v => {
        tableHtml += `<th style="padding: 0.6rem;">${v}</th>`;
      });

      tableHtml += `<th style="padding: 0.6rem; color: var(--primary);">Y = ${this.expression}</th></tr></thead><tbody>`;

      tt.forEach((row, idx) => {
        const result = row.result;
        tableHtml += `<tr style="border-bottom: 1px solid var(--border-color);">`;
        tableHtml += `<td style="padding: 0.5rem; text-align: center; color: var(--text-muted); font-size: 0.8rem;">${idx + 1}</td>`;

        vars.forEach(v => {
          tableHtml += `<td style="padding: 0.5rem; text-align: center;">${row.inputs[v]}</td>`;
        });

        tableHtml += `<td style="padding: 0.5rem; text-align: center; font-weight: bold; color: ${result === 1 ? 'var(--accent-green)' : '#ef4444'};">${result}</td>`;
        tableHtml += `</tr>`;
      });

      tableHtml += `</tbody></table>`;
      tableHtml += `
        <div style="margin-top: 1rem; font-size: 0.85rem; color: var(--text-muted); background: #0f172a; padding: 0.75rem; border-radius: 6px;">
          • Total de linhas: <strong>${tt.length}</strong> ($2^{${vars.length}}$ combinações para as variáveis: ${vars.join(', ')}).
        </div>
      `;

      output.innerHTML = tableHtml;
    } catch (err) {
      output.innerHTML = `<p style="color: #ef4444;">Erro ao processar expressão: ${err.message}</p>`;
    }
  }
};