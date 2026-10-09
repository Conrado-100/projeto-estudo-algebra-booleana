/**
 * Construtor Dinâmico de Tabelas-Verdade
 */
const TruthBuilderLab = {
  render(container) {
    container.innerHTML = `
      <div class="card-box">
        <h2 class="card-title">Construtor de Tabelas-Verdade</h2>
        <p>Escolha o número de variáveis ou digite uma expressão para calcular a tabela-verdade completa dinamicamente.</p>
        
        <div style="margin: 1rem 0; display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
          <label><strong>Variáveis:</strong></label>
          <select id="truth-vars-select" class="btn-action" style="background-color: var(--bg-dark); color: #fff;">
            <option value="2">2 (A, B)</option>
            <option value="3" selected>3 (A, B, C)</option>
            <option value="4">4 (A, B, C, D)</option>
          </select>

          <label><strong>Expressão:</strong></label>
          <input type="text" id="truth-expr-input" value="A + B . C" class="btn-action" style="background-color: var(--bg-dark); color: #fff; font-family: var(--font-code); width: 220px;">
          <button id="btn-generate-truth" class="btn-action">Gerar Tabela</button>
        </div>

        <div id="truth-table-output"></div>
      </div>
    `;

    document.getElementById('btn-generate-truth').addEventListener('click', () => this.generate());
    this.generate();
  },

  generate() {
    const numVars = parseInt(document.getElementById('truth-vars-select').value);
    const expr = document.getElementById('truth-expr-input').value;
    const vars = ['A', 'B', 'C', 'D'].slice(0, numVars);

    const table = LogicEngine.generateTruthTable(vars, (inputs) => {
      return LogicEngine.evaluate(expr, inputs);
    });

    let html = `<table class="truth-table-styled"><thead><tr>`;
    vars.forEach(v => html += `<th>${v}</th>`);
    html += `<th>Saída (X)</th></tr></thead><tbody>`;

    table.forEach(row => {
      html += `<tr>`;
      vars.forEach(v => html += `<td>${row.inputs[v]}</td>`);
      html += `<td><strong>${row.output}</strong></td></tr>`;
    });

    html += `</tbody></table>`;
    document.getElementById('truth-table-output').innerHTML = html;
  }
};