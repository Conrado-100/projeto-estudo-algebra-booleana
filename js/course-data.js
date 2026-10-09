/**
 * Dados dos Módulos da Trilha de Aprendizagem
 * Cada módulo tem: id, title, content (HTML), labType
 */
const CourseData = [
  {
    id: 'modulo-1',
    title: '1. Fundamentos da Álgebra de Boole',
    content: `
      <p>A Álgebra de Boole é um sistema matemático desenvolvido por George Boole em 1854 que opera com apenas dois valores lógicos: <strong>0 (Falso)</strong> e <strong>1 (Verdadeiro)</strong>.</p>
      <h3>Postulados Básicos</h3>
      <ul>
        <li><strong>Elemento Neutro AND:</strong> A · 1 = A</li>
        <li><strong>Elemento Neutro OR:</strong> A + 0 = A</li>
        <li><strong>Elemento Absorvente AND:</strong> A · 0 = 0</li>
        <li><strong>Elemento Absorvente OR:</strong> A + 1 = 1</li>
        <li><strong>Complemento:</strong> A · ~A = 0 e A + ~A = 1</li>
      </ul>
      <h3>Leis Fundamentais</h3>
      <ul>
        <li><strong>Idempotência:</strong> A · A = A | A + A = A</li>
        <li><strong>Involução (Dupla Negação):</strong> ~~A = A</li>
        <li><strong>Comutatividade:</strong> A · B = B · A</li>
        <li><strong>Associatividade:</strong> (A · B) · C = A · (B · C)</li>
        <li><strong>Distributividade:</strong> A · (B + C) = A·B + A·C</li>
        <li><strong>De Morgan:</strong> ~(A · B) = ~A + ~B | ~(A + B) = ~A · ~B</li>
      </ul>
    `,
    labType: 'gates'
  },
  {
    id: 'modulo-2',
    title: '2. Portas Lógicas',
    content: `
      <p>As <strong>portas lógicas</strong> são os blocos fundamentais dos circuitos digitais. Cada porta implementa uma operação booleana.</p>
      <h3>Portas Básicas</h3>
      <ul>
        <li><strong>NOT:</strong> Inverte o sinal. Saída = ~A</li>
        <li><strong>AND:</strong> Saída 1 apenas quando A=1 E B=1</li>
        <li><strong>OR:</strong> Saída 1 quando A=1 OU B=1 (ou ambos)</li>
      </ul>
      <h3>Portas Universais</h3>
      <ul>
        <li><strong>NAND:</strong> NOT-AND. Complemento do AND. ~(A · B)</li>
        <li><strong>NOR:</strong> NOT-OR. Complemento do OR. ~(A + B)</li>
      </ul>
      <h3>Portas de Paridade</h3>
      <ul>
        <li><strong>XOR:</strong> OU exclusivo. Saída 1 apenas quando entradas são diferentes.</li>
        <li><strong>XNOR:</strong> Saída 1 apenas quando entradas são iguais.</li>
      </ul>
      <p>Use o laboratório abaixo para explorar cada porta interativamente.</p>
    `,
    labType: 'gates'
  },
  {
    id: 'modulo-3',
    title: '3. Tabelas-Verdade',
    content: `
      <p>A <strong>tabela-verdade</strong> é uma ferramenta que lista todas as combinações possíveis de entradas de uma função booleana e o resultado de saída para cada combinação.</p>
      <h3>Quantidade de linhas</h3>
      <p>Para <strong>n</strong> variáveis, a tabela possui <strong>2<sup>n</sup></strong> linhas:</p>
      <ul>
        <li>2 variáveis → 4 combinações</li>
        <li>3 variáveis → 8 combinações</li>
        <li>4 variáveis → 16 combinações</li>
      </ul>
      <h3>Notação utilizada neste laboratório</h3>
      <ul>
        <li>AND: ponto (<code>A . B</code>) ou palavra (<code>A AND B</code>)</li>
        <li>OR: mais (<code>A + B</code>) ou palavra (<code>A OR B</code>)</li>
        <li>NOT: til antes da variável (<code>~A</code>) ou palavra (<code>NOT A</code>)</li>
      </ul>
    `,
    labType: 'truth'
  },
  {
    id: 'modulo-4',
    title: '4. Simplificação de Expressões',
    content: `
      <p>A <strong>simplificação algébrica</strong> reduz uma expressão booleana a uma forma equivalente com menos termos, utilizando as leis e teoremas da Álgebra de Boole.</p>
      <h3>Principais leis utilizadas</h3>
      <ul>
        <li><strong>Distributividade:</strong> A·B + A·C = A·(B+C)</li>
        <li><strong>Absorção:</strong> A + A·B = A</li>
        <li><strong>Complemento:</strong> A + ~A = 1 | A · ~A = 0</li>
        <li><strong>Elemento Neutro:</strong> A · 1 = A | A + 0 = A</li>
      </ul>
      <p>Acompanhe o exemplo abaixo passo a passo, com validação matemática automática de cada etapa.</p>
    `,
    labType: 'simplifier'
  },
  {
    id: 'modulo-5',
    title: '5. Mapas de Karnaugh',
    content: `
      <p>O <strong>Mapa de Karnaugh (K-Map)</strong> é um método gráfico para minimizar expressões booleanas, alternativa à simplificação algébrica.</p>
      <h3>Como funciona</h3>
      <ul>
        <li>Organiza as células da tabela-verdade em uma grade usando <strong>Código de Gray</strong>.</li>
        <li>Células adjacentes diferem em apenas 1 variável.</li>
        <li>Grupos de 1s (potências de 2: 1, 2, 4, 8) são identificados para minimização.</li>
        <li>Grupos podem "envolver" as bordas do mapa.</li>
      </ul>
      <h3>Código de Gray</h3>
      <p>Ordem das colunas/linhas: <code>00 → 01 → 11 → 10</code></p>
      <p>Essa ordem garante adjacência lógica entre células vizinhas.</p>
    `,
    labType: 'kmap'
  },
  {
    id: 'modulo-6',
    title: '6. Circuitos Lógicos',
    content: `
      <p>Os <strong>circuitos lógicos</strong> combinam portas lógicas para implementar funções booleanas complexas.</p>
      <h3>Propagação de sinais</h3>
      <p>Um sinal percorre o circuito da entrada para a saída, passando pelas portas lógicas na ordem do diagrama.</p>
      <h3>Indicação visual</h3>
      <ul>
        <li>Fio <span style="color:#22c55e">verde</span>: sinal lógico 1</li>
        <li>Fio <span style="color:#64748b">cinza</span>: sinal lógico 0</li>
        <li>Saída <span style="color:#22c55e">verde</span>: resultado 1 | <span style="color:#ef4444">vermelho</span>: resultado 0</li>
      </ul>
      <p>Experimente alterar as entradas e observe como o sinal se propaga pelo circuito em tempo real.</p>
    `,
    labType: 'circuit'
  },
  {
    id: 'modulo-7',
    title: '7. Aplicação: Reservatório de Água',
    content: `
      <p>Aplicação prática da Álgebra de Boole no controle de um sistema de reservatório de água industrial.</p>
      <h3>Sensores</h3>
      <ul>
        <li><strong>A</strong> — Sensor de nível baixo no reservatório térreo (Fundo Térreo)</li>
        <li><strong>B</strong> — Sensor de nível alto no reservatório térreo (Topo Térreo)</li>
        <li><strong>C</strong> — Sensor de nível alto no reservatório elevado (Topo Elevado)</li>
      </ul>
      <h3>Equações de controle</h3>
      <ul>
        <li><strong>X = ~B</strong> — Eletroválvula de abastecimento (abre quando reservatório térreo NÃO está cheio)</li>
        <li><strong>Y = A · ~C</strong> — Bomba de elevação (liga quando há água no fundo térreo E o reservatório elevado NÃO está cheio)</li>
      </ul>
    `,
    labType: 'reservoir'
  },
  {
    id: 'modulo-8',
    title: '8. Aplicação: Prioridade de Máquinas',
    content: `
      <p>Aplicação da Álgebra de Boole em sistemas de prioridade para controle de máquinas industriais.</p>
      <h3>Cenário</h3>
      <p>Quatro máquinas (M1, M2, M3, M4) disputam acesso a um recurso compartilhado. O sistema permite no máximo <strong>2 máquinas operando simultaneamente</strong>, respeitando a hierarquia de prioridade.</p>
      <h3>Hierarquia de prioridade</h3>
      <p><strong>M4 > M3 > M2 > M1</strong></p>
      <p>Quando mais de 2 máquinas solicitam acesso, as de maior prioridade são selecionadas.</p>
      <h3>Exemplo</h3>
      <ul>
        <li>M1, M2, M3 solicitam → M3 e M2 são ativadas (M1 excluída)</li>
        <li>M1, M2, M3, M4 solicitam → M4 e M3 são ativadas</li>
      </ul>
    `,
    labType: 'priority'
  }
];
