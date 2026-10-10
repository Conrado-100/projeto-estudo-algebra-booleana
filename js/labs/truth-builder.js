/**
 * Construtor Dinâmico de Tabelas-Verdade com Explicação Passo a Passo
 * Suporta de 1 até 4 variáveis (máximo de 16 linhas: 2^4)
 */
const TruthBuilderLab = {
  expression: "A . B + C . ~D",

  render(container) {
    container.innerHTML = `
      <div class="card-box">
        <h2 class="card-title">Construtor de Tabelas-Verdade</h2>
        <p style="color: var(--text-muted); font-size: 0.9rem;">
          Digite uma expressão booleana e visualize a geração automática de todas as combinações lógicas ($2^n$ linhas, até 4 variáveis = 16 linhas).
        </p>

        <!-- Guia Didático -->
        <details class="card-box" style="background: #0f172a; border-color: var(--primary); margin: 1rem 0;" open>
          <summary style="cursor: pointer; font-weight: bold; color: var(--primary); font-size: 1rem;">
            📖 Como Montar uma Tabela-Verdade? (Clique para expandir)
          </summary>
          <div style="margin-top: 0.8rem; font-size: 0.85rem; color: var(--text-muted); line-height: 1.5;">
            <p><strong>1. Notação Aceita no Campo:</strong></p>
            <ul style="margin-left: 1.2rem; margin-bottom: 0.5rem;">
              <li><strong>E (AND):</strong> Use ponto <code>.</code> (ex: <code>A . B</code>)</li>
              <li><strong>OU (OR):</strong> Use o sinal de mais <code>+</code> (ex: <code>A + B</code>)</li>
              <li><strong>NÃO (NOT):</strong> Use o til <code>~</code> antes da letra (ex: <code>~A</code>)</li>
              <li><strong>XOR:</strong> Use o circunflexo <code>^</code> (ex: <code>A ^ B</code>)</li>
            </ul>
            <p><strong>2. Variáveis suportadas:</strong> De 1 a 4 variáveis distintas (A, B, C, D).</p>
            <p><strong>3. Ordem das Linhas:</strong> A tabela segue a contagem binária padrão. Exemplos:</p>
            <ul style="margin-left: 1.2rem; margin-bottom: 0.5rem; font-family: var(--font-code);">
              <li>2 variáveis → 4 linhas: <code>00, 01, 10, 11</code></li>
              <li>3 variáveis → 8 linhas: <code>000 … 111</code></li>
              <li>4 variáveis → 16 linhas: <code>0000 … 1111</code></li>
            </ul>
          </div>
        </details>

        <!-- Entrada de Expressão -->
        <div style="display: flex; gap: 0.75rem; margin-bottom: 1.25rem; flex-wrap: wrap;">
          <input type="text" id="truth-expr-input" value="${this.expression}" placeholder="Ex: A . B + C . ~D" class="btn-action" style="flex: 1; min-width: 240px; background: var(--bg-dark); color: #fff; text-align: left; font-family: var(--font-code);">
          <button id="btn-generate-truth" class="btn-action" style="background: var(--primary); color: #0f172a; font-weight: bold;">Gerar Tabela</button>
        </div>

        <!-- Atalhos de Exemplos -->
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.25rem;">
          <span style="font-size: 0.8rem; color: var(--text-muted); align-self: center;">Exemplos:</span>
          <button class="btn-action truth-example" data-expr="A + B" style="font-size: 0.75rem; padding: 0.3rem 0.6rem;">A + B</button>
          <button class="btn-action truth-example" data-expr="A . B + ~A . C" style="font-size: 0.75rem; padding: 0.3rem 0.6rem;">A . B + ~A . C</button>
          <button class="btn-action truth-example" data-expr="A . B + C . ~D" style="font-size: 0.75rem; padding: 0.3rem 0.6rem;">A . B + C . ~D</button>
          <button class="btn-action truth-example" data-expr="(A ^ B) . (C + ~D)" style="font-size: 0.75rem; padding: 0.3rem 0.6rem;">(A ^ B) . (C + ~D)</button>
        </div>

        <!-- Tabela Resultante -->
        <div id="truth-table-output" style="overflow-x: auto;"></div>
      </div>
    `;

    this.attachEvents();
    this.generateTable();
  },

  attachEvents() {
    const btn   = document.getElementById('btn-generate-truth');
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

    // Botões de atalho de exemplos
    document.querySelectorAll('.truth-example').forEach(btn => {
      btn.addEventListener('click', () => {
        const input = document.getElementById('truth-expr-input');
        if (input) {
          this.expression = btn.dataset.expr;
          input.value = this.expression;
          this.generateTable();
        }
      });
    });
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
        output.innerHTML = '<p style="color: #ef4444;">Nenhuma variável válida encontrada (use letras maiúsculas: A, B, C, D).</p>';
        return;
      }

      // Limite de 4 variáveis para manter a tabela legível
      if (vars.length > 4) {
        output.innerHTML = `
          <p style="color: #f59e0b;">
            ⚠️ Expressão contém <strong>${vars.length} variáveis</strong> (${vars.join(', ')}).
            O construtor suporta no máximo <strong>4 variáveis</strong> (16 linhas).
            Simplifique a expressão.
          </p>`;
        return;
      }

      const tt = LogicEngine.generateTruthTable(this.expression);

      // Cabeçalho da tabela
      let tableHtml = `
        <table class="truth-table-styled" style="width: 100%; border-collapse: collapse; background: var(--bg-dark); border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="border-bottom: 2px solid var(--border-color); background: #1e293b;">
              <th style="padding: 0.6rem; text-align: center; color: var(--text-muted); font-size: 0.8rem;">#</th>
      `;

      vars.forEach(v => {
        tableHtml += `<th style="padding: 0.6rem; text-align: center;">${v}</th>`;
      });

      tableHtml += `<th style="padding: 0.6rem; text-align: center; color: var(--primary);">Y = ${this.expression}</th>
            </tr>
          </thead>
          <tbody>`;

      // Linhas da tabela (até 16 para 4 variáveis)
      tt.forEach((row, idx) => {
        const result = row.result;
        const rowBg  = idx % 2 === 0 ? '' : 'background: rgba(255,255,255,0.02);';

        tableHtml += `<tr style="border-bottom: 1px solid var(--border-color); ${rowBg}">`;
        tableHtml += `<td style="padding: 0.5rem; text-align: center; color: var(--text-muted); font-size: 0.8rem;">${idx + 1}</td>`;

        vars.forEach(v => {
          tableHtml += `<td style="padding: 0.5rem; text-align: center; font-family: var(--font-code);">${row.inputs[v]}</td>`;
        });

        tableHtml += `<td style="padding: 0.5rem; text-align: center; font-weight: bold; font-family: var(--font-code); color: ${result === 1 ? 'var(--accent-green)' : '#ef4444'};">${result}</td>`;
        tableHtml += `</tr>`;
      });

      tableHtml += `</tbody></table>`;

      // Rodapé informativo
      const onesCount  = tt.filter(r => r.result === 1).length;
      const zerosCount = tt.length - onesCount;
      tableHtml += `
        <div style="margin-top: 1rem; font-size: 0.85rem; color: var(--text-muted); background: #0f172a; padding: 0.75rem; border-radius: 6px; line-height: 1.8;">
          • Total de linhas: <strong>${tt.length}</strong>
            &nbsp;($2^{${vars.length}}$ combinações • variáveis: <strong>${vars.join(', ')}</strong>)<br>
          • Saída Y = 1: <strong style="color: var(--accent-green);">${onesCount}</strong> linha(s)
            &nbsp;|&nbsp;
            Saída Y = 0: <strong style="color: #ef4444;">${zerosCount}</strong> linha(s)
        </div>
      `;

      output.innerHTML = tableHtml;

    } catch (err) {
      output.innerHTML = `<p style="color: #ef4444;">Erro ao processar expressão: <code>${err.message}</code></p>`;
    }
  }
};
