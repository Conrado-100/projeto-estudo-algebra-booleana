/**
 * Área de Questões Práticas — BooleLab
 * Três projetos reais com quatro entradas e três saídas cada.
 * Etapa A: seleção de projeto/saída + tabela-verdade interativa + verificação.
 *
 * AVALIADORES LOCAIS (sem depender do LogicEngine para as particularidades):
 *
 * Projeto 1 — Estufa Agrícola (T, U, C, F):
 *   Variáveis conforme o PDF:
 *     T=1: temperatura acima de 32 °C
 *     U=1: umidade ABAIXO de 30 % (baixa — atenção à inversão semântica)
 *     C=1: há precipitação externa (chuva)
 *     F=1: há fumaça/fogo dentro da estufa
 *   V = T · ¬C · ¬F   (ventilador: temperatura alta, sem chuva, sem fumaça)
 *   N = (U · ¬C) + F   (nebulizador: umidade baixa sem chuva, OU fumaça detectada)
 *   A = T · U · ¬C     (alarme: temperatura alta + umidade baixa + sem chuva)
 *
 * Projeto 2 — Prensa Industrial (B1, B2, O, I):
 *   Ordem das entradas conforme o PDF: B1, B2, O, I
 *     B1: botoeira esquerda
 *     B2: botoeira direita
 *     O=1: detector óptico — há obstrução na área da prensa
 *     I=1: sensor indutivo — peça metálica posicionada no molde
 *   A = B1 · B2 · I · ¬O   (acionar: ambos botões + peça no molde + sem obstrução)
 *   L = I · ¬O · ¬B1 · ¬B2 (lâmpada de preparação: peça no molde, área livre, sem botões)
 *   W = O · (B1 + B2)       (alarme: obstrução com qualquer botão pressionado)
 *
 * Projeto 3 — Estação Solar Off-Grid (U, H, L, P):
 *   Variáveis conforme o PDF:
 *     U=1: detector de UV — radiação solar suficiente nos painéis
 *     H=1: bateria acima de 70 % de carga
 *     L=1: bateria abaixo de 20 % de carga
 *     P=1: pico de demanda energética acima do limiar
 *   B = U · ¬H             (carregar bateria: há sol e bateria não está cheia)
 *   G = L + (P · ¬U)       (gerador: bateria baixa OU pico sem radiação UV)
 *   D = P · ¬H · ¬L · ¬U  (disjuntor não essenciais desligado)
 *   Nota sobre D: o enunciado original apresenta D = (L·¬G) + (P·¬H·¬L·¬U).
 *   Substituindo G = L+(P·¬U): a parcela L·¬G = L·¬L·(…) = 0 (contradição).
 *   Portanto D reduz-se a P·¬H·¬L·¬U, conforme confirmado na especificação.
 */
const ProjectsLab = {

  // ── Estado ─────────────────────────────────────────────────────────────────
  state: {
    projectId: null,    // 'estufa' | 'prensa' | 'solar'
    outputKey: null,    // chave da saída selecionada (ex: 'V', 'A', 'W' …)
    // Persiste respostas e estado de verificação por combinação "projectId:outputKey"
    // Estrutura: { "estufa:V": { table: Array[16], verified: bool }, … }
    savedOutputs: {}
  },

  // Helpers de acesso ao estado salvo da combinação ativa
  _stateKey() {
    return `${this.state.projectId}:${this.state.outputKey}`;
  },
  _currentSave() {
    const k = this._stateKey();
    if (!this.state.savedOutputs[k]) {
      this.state.savedOutputs[k] = {
        table:        new Array(16).fill(0), // tabela-verdade
        verified:     false,
        kmapTable:    {},                    // { "rIdx_cIdx": 0|1 }
        kmapVerified: false
      };
    }
    return this.state.savedOutputs[k];
  },

  // ── Utilitário: converte índice 0-15 → {rIdx, cIdx} no KMap 4×4 ────────────
  // Baseado em KMapEngine.getMintermIndex (bijeção inversa pré-computada).
  // Reutiliza a lógica de KMapEngine sem importar dependências extras.
  _mintermToCell(mintermIdx) {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (KMapEngine.getMintermIndex(4, r, c) === mintermIdx) return { rIdx: r, cIdx: c };
      }
    }
    return { rIdx: 0, cIdx: 0 };
  },

  // ── Gabarito do KMap: array[16] → cellValues {rIdx_cIdx: 0|1} ─────────────
  _buildKMapAnswer() {
    const answer = this._buildAnswer(); // array[16] da tabela-verdade
    const cv = {};
    for (let i = 0; i < 16; i++) {
      const { rIdx, cIdx } = this._mintermToCell(i);
      cv[`${rIdx}_${cIdx}`] = answer[i];
    }
    return cv;
  },

  // ── Minimização SOP usando KMapEngine.quineMcCluskey ──────────────────────
  // Retorna a expressão formatada com os nomes reais das variáveis do projeto.
  _buildMinimizedExpr(answerCv) {
    const proj    = this.projects[this.state.projectId];
    const varNames = proj.inputs.map(i => i.key); // ex: ['T','U','C','F']

    const minterms = [];
    for (let i = 0; i < 16; i++) {
      const { rIdx, cIdx } = this._mintermToCell(i);
      if (answerCv[`${rIdx}_${cIdx}`] === 1) minterms.push(i);
    }

    if (minterms.length === 0)  return '0';
    if (minterms.length === 16) return '1';

    // Delega ao Quine-McCluskey do KMapEngine
    const minimized = KMapEngine.minimizeMap(4, (() => {
      // Constrói cellValues no formato que KMapEngine espera
      const cv = {};
      for (let r = 0; r < 4; r++)
        for (let c = 0; c < 4; c++)
          cv[`${r}_${c}`] = answerCv[`${r}_${c}`] || 0;
      return cv;
    })());

    // KMapEngine retorna a expressão com A,B,C,D genéricos + barra combining char (D̄).
    // Substitui pelas variáveis reais do projeto (mantém a notação de barra).
    // KMapEngine usa A-D genéricos, possivelmente adjacentes em um produto.
    return minimized.replace(/[ABCD](?:\u0304)?/g, literal => {
      const variable = varNames['ABCD'.indexOf(literal[0])];
      return `${variable}${literal.slice(1)}`;
    });
  },

  // ── Definição dos Projetos ──────────────────────────────────────────────────
  projects: {
    estufa: {
      id: 'estufa',
      title: '🌿 Estufa Agrícola',
      description: 'Controle lógico do sistema de climatização e segurança de uma estufa agrícola automatizada.',
      inputs: [
        { key: 'T', label: 'T — Temperatura acima de 32 °C' },
        { key: 'U', label: 'U — Umidade abaixo de 30 % (baixa)' },
        { key: 'C', label: 'C — Precipitação externa (chuva)' },
        { key: 'F', label: 'F — Fumaça / Fogo detectado' }
      ],
      outputs: {
        V: {
          key: 'V',
          label: 'V — Ventilador de teto',
          equation: 'V = T · ¬C · ¬F',
          eval: ({ T, U, C, F }) => T & (~C & 1) & (~F & 1)
        },
        N: {
          key: 'N',
          label: 'N — Nebulizador de água',
          equation: 'N = (U · ¬C) + F',
          eval: ({ T, U, C, F }) => ((U & (~C & 1)) | F) & 1
        },
        A: {
          key: 'A',
          label: 'A — Alarme crítico',
          equation: 'A = T · U · ¬C',
          eval: ({ T, U, C, F }) => T & U & (~C & 1)
        }
      }
    },

    prensa: {
      id: 'prensa',
      title: '🔩 Prensa Industrial',
      description: 'Circuito de automação de segurança de uma prensa mecânica com proteções redundantes.',
      inputs: [
        { key: 'B1', label: 'B1 — Botoeira esquerda' },
        { key: 'B2', label: 'B2 — Botoeira direita' },
        { key: 'O',  label: 'O — Detector óptico (obstrução na área perigosa)' },
        { key: 'I',  label: 'I — Sensor indutivo (peça metálica no molde)' }
      ],
      outputs: {
        A: {
          key: 'A',
          label: 'A — Atuador da prensa',
          equation: 'A = B1 · B2 · I · ¬O',
          eval: ({ B1, B2, O, I }) => B1 & B2 & I & (~O & 1)
        },
        L: {
          key: 'L',
          label: 'L — Lâmpada de preparação',
          equation: 'L = I · ¬O · ¬B1 · ¬B2',
          eval: ({ B1, B2, O, I }) => I & (~O & 1) & (~B1 & 1) & (~B2 & 1)
        },
        W: {
          key: 'W',
          label: 'W — Lâmpada de alerta',
          equation: 'W = O · (B1 + B2)',
          eval: ({ B1, B2, O, I }) => O & ((B1 | B2) & 1)
        }
      }
    },

    solar: {
      id: 'solar',
      title: '☀️ Estação Solar Off-Grid',
      description: 'Gerenciamento de alimentação de uma torre de telecomunicações remota com painéis solares, baterias e gerador diesel.',
      inputs: [
        { key: 'U', label: 'U — Detector de UV (radiação solar suficiente)' },
        { key: 'H', label: 'H — Bateria acima de 70 % de carga' },
        { key: 'L', label: 'L — Bateria abaixo de 20 % de carga' },
        { key: 'P', label: 'P — Pico de demanda energética' }
      ],
      outputs: {
        B: {
          key: 'B',
          label: 'B — Circuito de carga da bateria',
          equation: 'B = U · ¬H',
          eval: ({ U, H, L, P }) => U & (~H & 1)
        },
        G: {
          key: 'G',
          label: 'G — Gerador diesel',
          equation: 'G = L + (P · ¬U)',
          eval: ({ U, H, L, P }) => (L | (P & (~U & 1))) & 1
        },
        D: {
          key: 'D',
          label: 'D — Disjuntor de cargas não essenciais',
          equation: 'D = P · ¬H · ¬L · ¬U',
          // Equação original do enunciado: D = (L·¬G) + (P·¬H·¬L·¬U).
          // Como G = L+(P·¬U), a parcela L·¬G = L·¬L·(…) = 0 (contradição).
          // A expressão reduz-se a P·¬H·¬L·¬U, conforme confirmado na especificação.
          eval: ({ U, H, L, P }) => P & (~H & 1) & (~L & 1) & (~U & 1)
        }
      }
    }
  },

  // ── Ponto de entrada principal ─────────────────────────────────────────────
  render(container) {
    this.state = { projectId: null, outputKey: null, savedOutputs: {} };
    container.innerHTML = this._buildShell();
    this._attachTopEvents(container);
  },

  // ── Shell principal (seleção de projeto) ───────────────────────────────────
  _buildShell() {
    const cards = Object.values(this.projects).map(p => `
      <button class="proj-select-btn btn-action"
              data-project="${p.id}"
              style="
                background: var(--bg-card);
                color: var(--text-main);
                border: 1px solid var(--border-color);
                border-radius: 10px;
                padding: 1.2rem 1.5rem;
                text-align: left;
                flex: 1;
                min-width: 220px;
                cursor: pointer;
                transition: border-color 0.2s, box-shadow 0.2s;
              ">
        <div style="font-size: 1.3rem; margin-bottom: 0.4rem;">${p.title}</div>
        <div style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.4;">${p.description}</div>
        <div style="margin-top: 0.8rem; font-size: 0.78rem; color: var(--primary); font-family: var(--font-code);">
          Entradas: ${p.inputs.map(i => i.key).join(', ')}
        </div>
      </button>
    `).join('');

    return `
      <div class="card-box" id="projects-root">
        <h2 class="card-title">⚙️ Área de Questões Práticas</h2>
        <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1.5rem;">
          Escolha um projeto, selecione uma saída lógica e preencha a tabela-verdade das 16 combinações de entrada.
        </p>

        <!-- Seleção de Projeto -->
        <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.5rem;" id="project-cards">
          ${cards}
        </div>

        <!-- Área de trabalho (output/saída + tabela) -->
        <div id="projects-workspace"></div>
      </div>
    `;
  },

  // ── Eventos do nível superior ──────────────────────────────────────────────
  _attachTopEvents(container) {
    container.querySelectorAll('.proj-select-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const pid = btn.getAttribute('data-project');
        // Destaca o projeto selecionado
        container.querySelectorAll('.proj-select-btn').forEach(b => {
          b.style.borderColor = 'var(--border-color)';
          b.style.boxShadow = 'none';
        });
        btn.style.borderColor = 'var(--primary)';
        btn.style.boxShadow = '0 0 12px rgba(56,189,248,0.25)';

        this.state.projectId = pid;
        this.state.outputKey = null;
        // Não limpa savedOutputs — preserva respostas anteriores de todos os projetos
        this._renderOutputSelector();
      });
    });
  },

  // ── Seleção da Saída Lógica ────────────────────────────────────────────────
  _renderOutputSelector() {
    const ws = document.getElementById('projects-workspace');
    if (!ws) return;

    const proj = this.projects[this.state.projectId];
    const btns = Object.values(proj.outputs).map(out => `
      <button class="out-select-btn btn-action"
              data-output="${out.key}"
              style="
                background: var(--bg-card);
                color: var(--text-main);
                border: 1px solid var(--border-color);
                border-radius: 8px;
                padding: 0.85rem 1.2rem;
                text-align: left;
                flex: 1;
                min-width: 190px;
                cursor: pointer;
                transition: border-color 0.2s, box-shadow 0.2s;
              ">
        <div style="font-weight: bold; font-size: 1rem; margin-bottom: 0.3rem;">${out.label}</div>
        <div style="font-size: 0.82rem; color: var(--primary); font-family: var(--font-code);">${out.equation}</div>
      </button>
    `).join('');

    ws.innerHTML = `
      <div style="border-top: 1px solid var(--border-color); padding-top: 1.25rem;">
        <h3 style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">
          Selecione a saída a estudar — ${proj.title}
        </h3>
        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1.5rem;" id="output-cards">
          ${btns}
        </div>
        <div id="table-area"></div>
      </div>
    `;

    ws.querySelectorAll('.out-select-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const okey = btn.getAttribute('data-output');
        ws.querySelectorAll('.out-select-btn').forEach(b => {
          b.style.borderColor = 'var(--border-color)';
          b.style.boxShadow = 'none';
        });
        btn.style.borderColor = 'var(--primary)';
        btn.style.boxShadow = '0 0 10px rgba(56,189,248,0.2)';

        this.state.outputKey = okey;
        // Garante entrada no mapa (cria se não existir, preserva se existir)
        this._currentSave();
        this._renderTable();
      });
    });
  },

  // ── Geração do Gabarito (16 linhas) ───────────────────────────────────────
  _buildAnswer() {
    const proj   = this.projects[this.state.projectId];
    const outDef = proj.outputs[this.state.outputKey];
    const answer = [];

    for (let i = 0; i < 16; i++) {
      const vals = {};
      proj.inputs.forEach((inp, idx) => {
        vals[inp.key] = (i >> (3 - idx)) & 1;
      });
      answer.push(outDef.eval(vals) & 1);
    }
    return answer;
  },

  // ── Tabela-Verdade Interativa ──────────────────────────────────────────────
  _renderTable() {
    const area = document.getElementById('table-area');
    if (!area) return;

    const proj   = this.projects[this.state.projectId];
    const outDef = proj.outputs[this.state.outputKey];
    const inputs = proj.inputs;
    const save   = this._currentSave(); // lê ou cria estado persistido

    // Cabeçalho
    const thInputs = inputs.map(i =>
      `<th style="padding: 0.55rem 0.7rem; font-family: var(--font-code); color: var(--text-muted);">${i.key}</th>`
    ).join('');

    // Linhas
    let rows = '';
    for (let i = 0; i < 16; i++) {
      const tdInputs = inputs.map((inp, idx) => {
        const bit = (i >> (3 - idx)) & 1;
        return `<td style="padding: 0.5rem 0.7rem; text-align: center; font-family: var(--font-code);">${bit}</td>`;
      }).join('');

      const val = save.table[i]; // valor salvo (0 por padrão na primeira abertura)
      // Se já foi verificado, calcula o gabarito para aplicar feedback inicial
      const answer  = save.verified ? this._buildAnswer() : null;
      const isWrong = answer !== null && (val & 1) !== answer[i];
      rows += `
        <tr data-row="${i}">
          <td style="padding: 0.5rem 0.5rem; text-align: center; color: var(--text-muted); font-size: 0.78rem; font-family: var(--font-code);">${i + 1}</td>
          ${tdInputs}
          <td style="padding: 0.4rem 0.5rem; text-align: center;">
            <button class="cell-toggle"
                    data-row="${i}"
                    style="
                      width: 44px; height: 36px;
                      font-family: var(--font-code);
                      font-size: 1.1rem;
                      font-weight: bold;
                      border-radius: 6px;
                      border: 2px solid ${isWrong ? 'var(--accent-red)' : (val === 1 ? 'var(--accent-green)' : 'var(--border-color)')};
                      cursor: pointer;
                      transition: all 0.15s ease;
                      background: ${isWrong ? 'rgba(239,68,68,0.12)' : (val === 1 ? 'rgba(34,197,94,0.15)' : 'var(--bg-card)')};
                      color: ${isWrong ? 'var(--accent-red)' : (val === 1 ? 'var(--accent-green)' : 'var(--text-muted)')};
                    "
                    aria-label="Linha ${i + 1}: valor atual ${val}. Clique para alternar."
            >${val}</button>
          </td>
          <td class="feedback-cell" data-row="${i}" style="padding: 0.4rem 0.5rem; text-align: center; font-size: 0.8rem; width: 80px;">
            ${save.verified
              ? (isWrong
                  ? `<span style="color:var(--accent-red);" title="Esperado: ${answer[i]}">✗</span>`
                  : `<span style="color:var(--accent-green);" title="Correto">✓</span>`)
              : ''}
          </td>
        </tr>
      `;
    }

    area.innerHTML = `
      <!-- Guia da equação selecionada -->
      <div style="
            background: #0f172a;
            border: 1px solid var(--primary);
            border-radius: 8px;
            padding: 0.85rem 1.1rem;
            margin-bottom: 1.1rem;
            display: flex;
            align-items: center;
            gap: 1rem;
            flex-wrap: wrap;
          ">
        <span style="font-size: 1rem; font-weight: bold; color: var(--primary);">${outDef.label}</span>
        <code style="font-family: var(--font-code); font-size: 0.95rem; color: var(--accent-green);">${outDef.equation}</code>
        <span style="font-size: 0.82rem; color: var(--text-muted);">
          Entradas: ${inputs.map(i => `<strong>${i.key}</strong> (${i.label.split('—')[1].trim()})`).join(' · ')}
        </span>
      </div>

      <!-- Instrução -->
      <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.75rem;">
        Clique nas células da coluna <strong style="color: var(--primary);">${outDef.key}</strong>
        para alternar entre <code>0</code> e <code>1</code>. Quando terminar, clique em <strong>Verificar</strong>.
      </p>

      <!-- Tabela -->
      <div style="overflow-x: auto;">
        <table class="truth-table-styled" style="min-width: 480px;">
          <thead>
            <tr style="background: #1e293b;">
              <th style="padding: 0.55rem 0.5rem; color: var(--text-muted); font-size: 0.78rem;">#</th>
              ${thInputs}
              <th style="padding: 0.55rem 0.7rem; color: var(--primary); font-family: var(--font-code);">${outDef.key}</th>
              <th style="padding: 0.55rem 0.5rem; color: var(--text-muted); font-size: 0.78rem;">Status</th>
            </tr>
          </thead>
          <tbody id="tt-body">
            ${rows}
          </tbody>
        </table>
      </div>

      <!-- Ações -->
      <div style="display: flex; gap: 0.75rem; margin-top: 1.1rem; flex-wrap: wrap; align-items: center;">
        <button id="btn-verify-table" class="btn-action"
                style="background: var(--primary); color: #0f172a; font-weight: bold;">
          ✔ Verificar Tabela
        </button>
        <button id="btn-reset-table" class="btn-action"
                style="background: #334155; color: var(--text-main);">
          ↺ Zerar Respostas
        </button>
      </div>

      <!-- Resultado da verificação -->
      <div id="verify-result" style="margin-top: 1.1rem;">
        ${save.verified ? (() => {
            const ans = this._buildAnswer();
            const errs = ans.reduce((acc, v, i) => (v !== (save.table[i] & 1) ? [...acc, i] : acc), []);
            if (errs.length === 0) {
              return this._buildSuccessBanner();
            } else {
              return this._buildErrorBanner(errs, ans)
                // Remove o botão avançar do HTML estático; será readicionado via JS abaixo
                .replace('id="btn-go-kmap"', 'id="btn-go-kmap" data-restored="1"');
            }
          })() : ''}
      </div>
    `;

    this._attachTableEvents(area);
  },

  // ── Eventos da Tabela ──────────────────────────────────────────────────────
  _attachTableEvents(area) {
    const save = this._currentSave();

    // Toggle de células
    area.querySelectorAll('.cell-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const row = parseInt(btn.getAttribute('data-row'), 10);
        const newVal = save.table[row] === 1 ? 0 : 1;
        save.table[row] = newVal;

        btn.textContent = newVal;
        // Retorna ao estilo neutro/verde — remove qualquer vermelho residual
        btn.style.background  = newVal === 1 ? 'rgba(34,197,94,0.15)' : 'var(--bg-card)';
        btn.style.color       = newVal === 1 ? 'var(--accent-green)'  : 'var(--text-muted)';
        btn.style.borderColor = newVal === 1 ? 'var(--accent-green)'  : 'var(--border-color)';
        btn.setAttribute('aria-label',
          `Linha ${row + 1}: valor atual ${newVal}. Clique para alternar.`);

        // Limpa feedback individual da linha (✓/✗) ao editar após verificação
        const fc = area.querySelector(`.feedback-cell[data-row="${row}"]`);
        if (fc) fc.innerHTML = '';
      });
    });

    // Verificar
    const btnVerify = area.querySelector('#btn-verify-table');
    if (btnVerify) {
      btnVerify.addEventListener('click', () => this._verifyTable(area));
    }

    // Restaura KMap se já estava verificado (re-render após navegação)
    const save2 = this._currentSave();
    if (save2.verified) {
      const resultEl = area.querySelector('#verify-result');
      if (resultEl) {
        const kmapSection = resultEl.querySelector('#kmap-section');
        if (kmapSection) this._renderKMap(kmapSection);
        // Reconecta botão "avançar" se tabela tinha erros
        const btnGoKmap = resultEl.querySelector('#btn-go-kmap');
        if (btnGoKmap) {
          btnGoKmap.addEventListener('click', () => {
            btnGoKmap.remove();
            this._renderKMap(resultEl.querySelector('#kmap-section'));
          });
        }
      }
    }

    // Zerar — reseta o estado salvo desta saída específica (tabela + KMap)
    const btnReset = area.querySelector('#btn-reset-table');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        const k = this._stateKey();
        this.state.savedOutputs[k] = {
          table:        new Array(16).fill(0),
          verified:     false,
          kmapTable:    {},
          kmapVerified: false
        };
        this._renderTable();
      });
    }
  },

  // ── Verificação ────────────────────────────────────────────────────────────
  _verifyTable(area) {
    const save   = this._currentSave();
    save.verified = true;

    const answer = this._buildAnswer();
    const errors = [];

    // Passo 1: limpa todos os indicadores visuais anteriores antes de redesenhar
    for (let i = 0; i < 16; i++) {
      const cellBtn = area.querySelector(`.cell-toggle[data-row="${i}"]`);
      const fc      = area.querySelector(`.feedback-cell[data-row="${i}"]`);
      if (cellBtn) {
        const v = save.table[i];
        cellBtn.style.borderColor = v === 1 ? 'var(--accent-green)' : 'var(--border-color)';
        cellBtn.style.background  = v === 1 ? 'rgba(34,197,94,0.15)' : 'var(--bg-card)';
        cellBtn.style.color       = v === 1 ? 'var(--accent-green)'  : 'var(--text-muted)';
      }
      if (fc) fc.innerHTML = '';
    }

    // Passo 2: aplica feedback célula a célula
    for (let i = 0; i < 16; i++) {
      const fc      = area.querySelector(`.feedback-cell[data-row="${i}"]`);
      const cellBtn = area.querySelector(`.cell-toggle[data-row="${i}"]`);

      if ((save.table[i] & 1) === answer[i]) {
        if (fc) fc.innerHTML = `<span style="color:var(--accent-green);" title="Correto">✓</span>`;
      } else {
        errors.push(i);
        if (fc) fc.innerHTML = `<span style="color:var(--accent-red);" title="Esperado: ${answer[i]}">✗</span>`;
        if (cellBtn) {
          cellBtn.style.borderColor = 'var(--accent-red)';
          cellBtn.style.background  = 'rgba(239,68,68,0.12)';
          cellBtn.style.color       = 'var(--accent-red)';
        }
      }
    }

    const resultEl = area.querySelector('#verify-result');
    if (!resultEl) return;

    if (errors.length === 0) {
      resultEl.innerHTML = this._buildSuccessBanner();
      // Monta o KMap imediatamente após acerto da tabela
      this._renderKMap(resultEl.querySelector('#kmap-section'));
    } else {
      resultEl.innerHTML = this._buildErrorBanner(errors, answer);
      // Botão "avançar" disponibiliza o KMap mesmo com erros
      const btnGoKmap = resultEl.querySelector('#btn-go-kmap');
      if (btnGoKmap) {
        btnGoKmap.addEventListener('click', () => {
          btnGoKmap.remove();
          this._renderKMap(resultEl.querySelector('#kmap-section'));
        });
      }
    }
  },

  // ── Banner de Acerto da Tabela (agora expande para o KMap) ───────────────
  _buildSuccessBanner() {
    const outDef = this.projects[this.state.projectId].outputs[this.state.outputKey];
    return `
      <div style="
            background: rgba(34,197,94,0.1);
            border: 1px solid var(--accent-green);
            border-radius: 8px;
            padding: 1rem 1.25rem;
            margin-bottom: 0;
          ">
        <p style="font-weight: bold; color: var(--accent-green); font-size: 1rem; margin-bottom: 0.4rem;">
          ✅ Tabela-verdade correta!
        </p>
        <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 0;">
          Você mapeou corretamente as 16 combinações para
          <code style="color: var(--primary);">${outDef.equation}</code>.
          Agora preencha o Mapa de Karnaugh abaixo.
        </p>
      </div>
      <div id="kmap-section" style="margin-top: 1.25rem;"></div>
    `;
  },

  // ── Banner de Erro com Gabarito ────────────────────────────────────────────
  _buildErrorBanner(errors, answer) {
    const proj   = this.projects[this.state.projectId];
    const outDef = proj.outputs[this.state.outputKey];
    const save   = this._currentSave();

    // Linhas erradas (até 16, exibe todas)
    const errorRows = errors.map(i => {
      const bits = proj.inputs.map((inp, idx) =>
        `<td style="padding: 0.35rem 0.5rem; font-family: var(--font-code); text-align:center;">${(i >> (3 - idx)) & 1}</td>`
      ).join('');
      return `
        <tr style="background: rgba(239,68,68,0.07);">
          <td style="padding: 0.35rem 0.5rem; text-align:center; color:var(--text-muted); font-size:0.78rem; font-family:var(--font-code);">${i + 1}</td>
          ${bits}
          <td style="padding:0.35rem 0.5rem; text-align:center; font-family:var(--font-code); color:var(--accent-red);">${save.table[i]}</td>
          <td style="padding:0.35rem 0.5rem; text-align:center; font-family:var(--font-code); color:var(--accent-green); font-weight:bold;">${answer[i]}</td>
        </tr>
      `;
    }).join('');

    const thInputs = proj.inputs.map(i =>
      `<th style="padding:0.4rem 0.5rem; font-family:var(--font-code);">${i.key}</th>`
    ).join('');

    return `
      <div style="
            background: rgba(239,68,68,0.07);
            border: 1px solid var(--accent-red);
            border-radius: 8px;
            padding: 1rem 1.25rem;
          ">
        <p style="font-weight: bold; color: var(--accent-red); font-size: 1rem; margin-bottom: 0.6rem;">
          ⚠️ ${errors.length} linha(s) com erro
        </p>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.85rem;">
          A tabela abaixo mostra apenas as linhas incorretas com o valor esperado.
          Você pode corrigir as células e verificar novamente — ou continuar para estudar a solução.
        </p>

        <!-- Tabela de erros -->
        <div style="overflow-x: auto; margin-bottom: 1rem;">
          <table class="truth-table-styled" style="font-size:0.85rem;">
            <thead>
              <tr style="background:#1e293b;">
                <th style="padding:0.4rem 0.5rem; color:var(--text-muted); font-size:0.75rem;">#</th>
                ${thInputs}
                <th style="padding:0.4rem 0.5rem; color:var(--accent-red);">Sua resposta</th>
                <th style="padding:0.4rem 0.5rem; color:var(--accent-green);">Esperado</th>
              </tr>
            </thead>
            <tbody>${errorRows}</tbody>
          </table>
        </div>

        <!-- Gabarito completo expansível -->
        <details style="margin-top: 0.5rem;">
          <summary style="cursor:pointer; color:var(--primary); font-size:0.88rem; font-weight:bold;">
            📋 Ver gabarito completo das 16 linhas
          </summary>
          <div style="margin-top: 0.75rem; overflow-x: auto;">
            ${this._buildFullAnswerTable(answer)}
          </div>
        </details>

        <!-- Equação de referência -->
        <div style="margin-top: 0.85rem; padding: 0.65rem 0.9rem; background: #0f172a; border-radius: 6px; font-size: 0.85rem;">
          <strong style="color: var(--text-muted);">Equação de referência:</strong>
          <code style="color: var(--accent-green); font-family: var(--font-code); margin-left: 0.5rem;">${outDef.equation}</code>
        </div>

        <!-- Avançar mesmo com erros -->
        <p style="font-size: 0.82rem; color: var(--text-muted); margin-top: 0.85rem;">
          💡 Você pode corrigir os erros acima e verificar novamente, ou avançar diretamente para o Mapa de Karnaugh.
        </p>
        <button id="btn-go-kmap" class="btn-action"
                style="margin-top: 0.6rem; background: #334155; color: var(--text-main); font-size: 0.85rem;">
          Avançar para o Mapa de Karnaugh →
        </button>
      </div>
      <div id="kmap-section" style="margin-top: 1.25rem;"></div>
    `;
  },

  // ── Gabarito Completo (16 linhas) ──────────────────────────────────────────
  _buildFullAnswerTable(answer) {
    const proj   = this.projects[this.state.projectId];
    const outDef = proj.outputs[this.state.outputKey];
    const save   = this._currentSave();

    const thInputs = proj.inputs.map(i =>
      `<th style="padding:0.4rem 0.5rem; font-family:var(--font-code);">${i.key}</th>`
    ).join('');

    const rows = answer.map((val, i) => {
      const tdInputs = proj.inputs.map((inp, idx) =>
        `<td style="padding:0.35rem 0.5rem; text-align:center; font-family:var(--font-code);">${(i >> (3 - idx)) & 1}</td>`
      ).join('');
      const isErr = (save.table[i] & 1) !== val;
      return `
        <tr style="${isErr ? 'background:rgba(239,68,68,0.07);' : ''}">
          <td style="padding:0.35rem 0.5rem; text-align:center; color:var(--text-muted); font-size:0.78rem; font-family:var(--font-code);">${i + 1}</td>
          ${tdInputs}
          <td style="padding:0.35rem 0.5rem; text-align:center; font-family:var(--font-code); font-weight:bold;
                     color:${val === 1 ? 'var(--accent-green)' : 'var(--text-muted)'};">${val}</td>
        </tr>
      `;
    }).join('');

    return `
      <table class="truth-table-styled" style="font-size:0.85rem;">
        <thead>
          <tr style="background:#1e293b;">
            <th style="padding:0.4rem 0.5rem; color:var(--text-muted); font-size:0.75rem;">#</th>
            ${thInputs}
            <th style="padding:0.4rem 0.5rem; color:var(--primary); font-family:var(--font-code);">${outDef.key}</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  },

  // ── ETAPA B: Mapa de Karnaugh 4×4 ─────────────────────────────────────────

  // Rótulos Gray para as linhas e colunas (igual ao KMapEngine)
  _GRAY: ['00', '01', '11', '10'],

  /**
   * Renderiza o KMap 4×4 interativo no container dado.
   * Reutiliza os estilos CSS do KMapLab (.kmap-academic-cell, .active-cell, etc.)
   * já presentes em css/lab.css — sem classes novas.
   */
  _renderKMap(container) {
    if (!container) return;

    const proj     = this.projects[this.state.projectId];
    const outDef   = proj.outputs[this.state.outputKey];
    const save     = this._currentSave();
    const answerCv = this._buildKMapAnswer();
    const varNames = proj.inputs.map(i => i.key); // [V0, V1, V2, V3]

    // Garante que kmapTable existe para todas as 16 células
    for (let r = 0; r < 4; r++)
      for (let c = 0; c < 4; c++)
        if (save.kmapTable[`${r}_${c}`] === undefined)
          save.kmapTable[`${r}_${c}`] = 0;

    // ── Determina feedback visual por célula ──
    const cellState = (r, c) => {
      const key = `${r}_${c}`;
      const val = save.kmapTable[key];
      if (!save.kmapVerified) return { val, cls: val === 1 ? 'active-cell' : '', outline: '' };
      const correct = answerCv[key];
      if (val === correct) return { val, cls: val === 1 ? 'active-cell' : '', outline: '' };
      return { val, cls: val === 1 ? 'active-cell' : '',
               outline: 'outline:2px solid var(--accent-red); outline-offset:-2px;' };
    };

    // ── Grade 4×4 ──
    let cells = '';
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const { val, cls, outline } = cellState(r, c);
        const mintermIdx = KMapEngine.getMintermIndex(4, r, c);
        cells += `
          <div class="kmap-academic-cell ${cls}"
               data-kr="${r}" data-kc="${c}"
               style="cursor:pointer; ${outline}"
               aria-label="Célula ${this._GRAY[r]} ${this._GRAY[c]}, valor ${val}">
            <span class="cell-bin" style="font-size:0.6rem;">${this._GRAY[r]} ${this._GRAY[c]}</span>
            <span class="cell-num">${val}</span>
            <span class="cell-lit" style="font-size:0.65rem;">${mintermIdx}</span>
          </div>`;
      }
    }

    // ── Expressão minimizada (gabarito) ──
    const minimized = this._buildMinimizedExpr(answerCv);

    // ── Resultado de verificação já existente (restauração após navegação) ──
    let kmapResultHtml = '';
    if (save.kmapVerified) {
      const errors = [];
      for (let r = 0; r < 4; r++)
        for (let c = 0; c < 4; c++)
          if (save.kmapTable[`${r}_${c}`] !== answerCv[`${r}_${c}`])
            errors.push(`${r}_${c}`);

      if (errors.length === 0) {
        kmapResultHtml = `
          <div style="background:rgba(34,197,94,0.1); border:1px solid var(--accent-green);
                      border-radius:8px; padding:0.85rem 1.1rem;">
            <p style="color:var(--accent-green); font-weight:bold; margin-bottom:0.4rem;">✅ Mapa de Karnaugh correto!</p>
            <p style="font-size:0.85rem; color:var(--text-muted);">
              Expressão minimizada (SOP):
              <strong style="color:var(--accent-green); font-family:var(--font-code); font-size:1rem;">
                ${outDef.key} = ${minimized}
              </strong>
            </p>
          </div>`;
      } else {
        const ansRows = this._buildKMapGabaritoTable(answerCv, varNames, outDef.key);
        kmapResultHtml = `
          <div style="background:rgba(239,68,68,0.07); border:1px solid var(--accent-red);
                      border-radius:8px; padding:0.85rem 1.1rem;">
            <p style="color:var(--accent-red); font-weight:bold; margin-bottom:0.4rem;">
              ⚠️ ${errors.length} célula(s) incorreta(s) no mapa
            </p>
            <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:0.75rem;">
              As células com contorno vermelho estão erradas. Corrija e verifique novamente.
            </p>
            <details>
              <summary style="cursor:pointer; color:var(--primary); font-size:0.85rem; font-weight:bold;">
                📋 Ver gabarito completo do mapa
              </summary>
              <div style="margin-top:0.75rem;">${ansRows}</div>
            </details>
            <div style="margin-top:0.75rem; padding:0.6rem 0.85rem; background:#0f172a; border-radius:6px; font-size:0.85rem;">
              <strong style="color:var(--text-muted);">Expressão minimizada esperada:</strong>
              <code style="color:var(--accent-green); font-family:var(--font-code); margin-left:0.4rem;">
                ${outDef.key} = ${minimized}
              </code>
            </div>
          </div>`;
      }
    }

    // ── HTML completo do KMap ──
    container.innerHTML = `
      <div class="card-box" style="background:#0f172a; border-color:var(--primary); margin-top:0;">
        <h3 style="color:var(--primary); font-size:1rem; margin-bottom:0.6rem;">
          🗺️ Mapa de Karnaugh — ${outDef.label}
        </h3>
        <p style="font-size:0.82rem; color:var(--text-muted); margin-bottom:1rem;">
          Clique nas células para alternar entre <code>0</code> e <code>1</code>.
          As linhas usam as variáveis <strong>${varNames[0]}</strong> e <strong>${varNames[2]}</strong>;
          as colunas usam <strong>${varNames[1]}</strong> e <strong>${varNames[3]}</strong>.
          O número pequeno no canto inferior de cada célula é o mintermo correspondente.
        </p>

        <!-- Grade com rótulos Gray -->
        <div style="overflow-x:auto; display:flex; justify-content:center; margin-bottom:1rem;">
          <div class="kmap-board-academic kmap-board-4x4">

            <!-- TOPO: V1 (colunas 2,3 = V1=1) -->
            <div class="kmap-top-row">
              <div class="kmap-corner-spacer"></div>
              <div class="kmap-bracket-top bracket-dash">—</div>
              <div class="kmap-bracket-top bracket-var">${varNames[1]}</div>
              <div class="kmap-corner-spacer"></div>
            </div>

            <div class="kmap-center-row">
              <!-- ESQUERDA: V0 (linhas 2,3 = V0=1) -->
              <div class="kmap-left-col-outer">
                <div class="kmap-bracket-left bracket-dash">—</div>
                <div class="kmap-bracket-left bracket-var">${varNames[0]}</div>
              </div>

              <!-- GRADE 4×4 -->
              <div class="kmap-matrix-grid grid-4x4" id="proj-kmap-grid">
                ${cells}
              </div>

              <!-- DIREITA: V2 (linhas 1,2 = V2=1) -->
              <div class="kmap-right-col-outer">
                <div class="kmap-bracket-right bracket-dash">—</div>
                <div class="kmap-bracket-right bracket-var">${varNames[2]}</div>
                <div class="kmap-bracket-right bracket-dash">—</div>
              </div>
            </div>

            <!-- FUNDO: V3 (colunas 1,2 = V3=1) -->
            <div class="kmap-bottom-row">
              <div class="kmap-corner-spacer"></div>
              <div class="kmap-bracket-bottom bracket-dash">—</div>
              <div class="kmap-bracket-bottom bracket-var">${varNames[3]}</div>
              <div class="kmap-bracket-bottom bracket-dash">—</div>
              <div class="kmap-corner-spacer"></div>
            </div>

          </div>
        </div>

        <!-- Legenda -->
        <div style="font-size:0.78rem; color:var(--text-muted); margin-bottom:0.85rem; text-align:center;">
          Ordem Gray das linhas/colunas: <code style="font-family:var(--font-code);">00 · 01 · 11 · 10</code>
        </div>

        <!-- Ações KMap -->
        <div style="display:flex; gap:0.75rem; flex-wrap:wrap; margin-bottom:0.85rem;">
          <button id="btn-verify-kmap" class="btn-action"
                  style="background:var(--primary); color:#0f172a; font-weight:bold;">
            ✔ Verificar Mapa
          </button>
          <button id="btn-reset-kmap" class="btn-action"
                  style="background:#334155; color:var(--text-main);">
            ↺ Zerar Mapa
          </button>
          <button id="btn-show-answer-kmap" class="btn-action"
                  style="background:#334155; color:var(--text-main);">
            👁 Ver gabarito
          </button>
        </div>

        <!-- Resultado da verificação do KMap -->
        <div id="kmap-verify-result">${kmapResultHtml}</div>
      </div>
    `;

    this._attachKMapEvents(container);
  },

  // ── Eventos do KMap ────────────────────────────────────────────────────────
  _attachKMapEvents(container) {
    const save = this._currentSave();

    // Toggle de células
    container.querySelectorAll('.kmap-academic-cell[data-kr]').forEach(cell => {
      cell.addEventListener('click', () => {
        const r = parseInt(cell.getAttribute('data-kr'), 10);
        const c = parseInt(cell.getAttribute('data-kc'), 10);
        const key = `${r}_${c}`;
        save.kmapTable[key] = save.kmapTable[key] === 1 ? 0 : 1;
        const newVal = save.kmapTable[key];

        const numEl = cell.querySelector('.cell-num');
        if (numEl) numEl.textContent = newVal;
        if (newVal === 1) {
          cell.classList.add('active-cell');
        } else {
          cell.classList.remove('active-cell');
        }
        cell.style.outline = '';  // remove erro ao editar
        cell.setAttribute('aria-label',
          `Célula ${this._GRAY[r]} ${this._GRAY[c]}, valor ${newVal}`);
      });
    });

    // Verificar KMap
    const btnVK = container.querySelector('#btn-verify-kmap');
    if (btnVK) btnVK.addEventListener('click', () => this._verifyKMap(container));

    // Zerar KMap
    const btnRK = container.querySelector('#btn-reset-kmap');
    if (btnRK) {
      btnRK.addEventListener('click', () => {
        save.kmapTable    = {};
        save.kmapVerified = false;
        this._renderKMap(container);
      });
    }

    // Ver gabarito direto
    const btnSA = container.querySelector('#btn-show-answer-kmap');
    if (btnSA) {
      btnSA.addEventListener('click', () => {
        const answerCv = this._buildKMapAnswer();
        save.kmapTable    = { ...answerCv };
        save.kmapVerified = true;
        this._renderKMap(container);
      });
    }
  },

  // ── Verificação do KMap ────────────────────────────────────────────────────
  _verifyKMap(container) {
    const save     = this._currentSave();
    save.kmapVerified = true;
    const answerCv = this._buildKMapAnswer();
    const errors   = [];

    // Limpa e redesenha feedback célula a célula
    container.querySelectorAll('.kmap-academic-cell[data-kr]').forEach(cell => {
      const r   = parseInt(cell.getAttribute('data-kr'), 10);
      const c   = parseInt(cell.getAttribute('data-kc'), 10);
      const key = `${r}_${c}`;
      cell.style.outline       = '';
      cell.style.outlineOffset = '';
      if (save.kmapTable[key] !== answerCv[key]) {
        errors.push(key);
        cell.style.outline       = '2px solid var(--accent-red)';
        cell.style.outlineOffset = '-2px';
      }
    });

    const proj      = this.projects[this.state.projectId];
    const outDef    = proj.outputs[this.state.outputKey];
    const varNames  = proj.inputs.map(i => i.key);
    const minimized = this._buildMinimizedExpr(answerCv);
    const resultEl  = container.querySelector('#kmap-verify-result');
    if (!resultEl) return;

    if (errors.length === 0) {
      resultEl.innerHTML = `
        <div style="background:rgba(34,197,94,0.1); border:1px solid var(--accent-green);
                    border-radius:8px; padding:0.85rem 1.1rem;">
          <p style="color:var(--accent-green); font-weight:bold; margin-bottom:0.4rem;">✅ Mapa de Karnaugh correto!</p>
          <p style="font-size:0.85rem; color:var(--text-muted);">
            Expressão minimizada (SOP):
            <strong style="color:var(--accent-green); font-family:var(--font-code); font-size:1rem;">
              ${outDef.key} = ${minimized}
            </strong>
          </p>
        </div>`;
    } else {
      const ansRows = this._buildKMapGabaritoTable(answerCv, varNames, outDef.key);
      resultEl.innerHTML = `
        <div style="background:rgba(239,68,68,0.07); border:1px solid var(--accent-red);
                    border-radius:8px; padding:0.85rem 1.1rem;">
          <p style="color:var(--accent-red); font-weight:bold; margin-bottom:0.4rem;">
            ⚠️ ${errors.length} célula(s) incorreta(s) — contorno vermelho no mapa
          </p>
          <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:0.75rem;">
            Corrija as células marcadas e clique em Verificar Mapa novamente.
          </p>
          <details>
            <summary style="cursor:pointer; color:var(--primary); font-size:0.85rem; font-weight:bold;">
              📋 Ver gabarito completo do mapa
            </summary>
            <div style="margin-top:0.75rem;">${ansRows}</div>
          </details>
          <div style="margin-top:0.75rem; padding:0.6rem 0.85rem; background:#0f172a; border-radius:6px; font-size:0.85rem;">
            <strong style="color:var(--text-muted);">Expressão minimizada esperada:</strong>
            <code style="color:var(--accent-green); font-family:var(--font-code); margin-left:0.4rem;">
              ${outDef.key} = ${minimized}
            </code>
          </div>
        </div>`;
    }
  },

  // ── Tabela de gabarito do KMap (grade textual 4×4) ─────────────────────────
  _buildKMapGabaritoTable(answerCv, varNames, outKey) {
    const header = `<tr style="background:#1e293b;">
      <th style="padding:0.4rem; font-family:var(--font-code); font-size:0.75rem; color:var(--text-muted);">
        ${varNames[0]}${varNames[2]} \\ ${varNames[1]}${varNames[3]}
      </th>
      ${this._GRAY.map(g =>
        `<th style="padding:0.4rem; font-family:var(--font-code); color:var(--primary);">${g}</th>`
      ).join('')}
    </tr>`;

    const bodyRows = this._GRAY.map((rowCode, r) => {
      const cells = this._GRAY.map((colCode, c) => {
        const val = answerCv[`${r}_${c}`];
        return `<td style="padding:0.4rem 0.5rem; text-align:center; font-family:var(--font-code); font-weight:bold;
                           color:${val === 1 ? 'var(--accent-green)' : 'var(--text-muted)'};">${val}</td>`;
      }).join('');
      return `<tr>
        <td style="padding:0.4rem; font-family:var(--font-code); color:var(--primary);">${rowCode}</td>
        ${cells}
      </tr>`;
    }).join('');

    return `
      <table class="truth-table-styled" style="font-size:0.85rem; margin-bottom:0.5rem;">
        <thead>${header}</thead>
        <tbody>${bodyRows}</tbody>
      </table>
      <p style="font-size:0.78rem; color:var(--text-muted); margin-top:0.3rem;">
        Linhas: ${varNames[0]}${varNames[2]} (Gray) · Colunas: ${varNames[1]}${varNames[3]} (Gray)
      </p>`;
  }
};
