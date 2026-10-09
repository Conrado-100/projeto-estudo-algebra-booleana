/**
 * Conteúdo Didático dos Módulos baseados nas Anotações
 */
const CourseData = [
  {
    id: "m1",
    title: "Módulo 1: Primeiros Passos na Lógica Digital",
    summary: "Aprenda sobre o estado binário, valores 0 e 1, e como decisões lógicas funcionam.",
    content: `
      <h3>O que é o Estado Binário?</h3>
      <p>Na eletrônica digital e na lógica de Boole, trabalhamos apenas com <strong>dois estados possíveis</strong>:</p>
      <ul>
        <li><strong>0 (Falso / Desligado / 0V)</strong></li>
        <li><strong>1 (Verdadeiro / Ligado / 5V)</strong></li>
      </ul>
      <p>Esses estados são representados por variáveis booleanas (como A, B, C).</p>
    `,
    labType: "gates"
  },
  {
    id: "m2",
    title: "Módulo 2: Portas Lógicas Fundamentais",
    summary: "Conheça os blocos construtores dos circuitos digitais: NOT, AND, OR, NAND, NOR, XOR e XNOR.",
    content: `
      <h3>Operações Básicas e Portas Lógicas</h3>
      <p>Cada porta lógica executa uma função específica sobre suas entradas:</p>
      <ul>
        <li><strong>NOT (Inversor):</strong> Inverte o sinal (se entra 0, sai 1).</li>
        <li><strong>AND (E):</strong> A saída é 1 apenas se TODAS as entradas forem 1.</li>
        <li><strong>OR (OU):</strong> A saída é 1 se PELO MENOS UMA entrada for 1.</li>
      </ul>
    `,
    labType: "gates"
  },
  {
    id: "m3",
    title: "Módulo 3: Postulados e Propriedades da Álgebra de Boole",
    summary: "Entenda os postulados fundamentais da adição e multiplicação lógica.",
    content: `
      <h3>Postulados Fundamentais</h3>
      <p><strong>Adição (OR):</strong> A + 0 = A | A + 1 = 1 | A + A = A | A + ~A = 1</p>
      <p><strong>Multiplicação (AND):</strong> A · 0 = 0 | A · 1 = A | A · A = A | A · ~A = 0</p>
    `,
    labType: "simplifier"
  },
  {
    id: "m4",
    title: "Módulo 4: Simplificação Algébrica e Leis de De Morgan",
    summary: "Aprenda a transformar expressões complexas em formas equivalentes simplificadas.",
    content: `
      <h3>Leis de De Morgan</h3>
      <p>1. O complemento do produto é a soma dos complementos: <strong>~(A · B) = ~A + ~B</strong></p>
      <p>2. O complemento da soma é o produto dos complementos: <strong>~(A + B) = ~A · ~B</strong></p>
    `,
    labType: "simplifier"
  },
  {
    id: "m5",
    title: "Módulo 5: Construção e Interpretação de Tabelas-Verdade",
    summary: "Descubra como listar todas as combinações de entrada e determinar as saídas.",
    content: `
      <h3>Regra das Combinatórias</h3>
      <p>Para <strong>N</strong> variáveis booleanas, existem exatamente <strong>2<sup>N</sup></strong> combinações possíveis de entrada.</p>
    `,
    labType: "truth"
  },
  {
    id: "m6",
    title: "Módulo 6: Mapas de Karnaugh (Veitch-Karnaugh)",
    summary: "Método gráfico de simplificação usando agrupamentos em potências de 2.",
    content: `
      <h3>Organização por Código de Gray</h3>
      <p>No Mapa de Karnaugh, as células vizinhas diferem em apenas 1 bit para permitir a eliminação das variáveis que mudam de estado.</p>
    `,
    labType: "kmap"
  },
  {
    id: "m7",
    title: "Módulo 7: Projeto de Circuitos Lógicos Combinacionais",
    summary: "Do problema real à expressão booleana e diagrama de portas lógicas.",
    content: `
      <h3>Síntese de Circuitos</h3>
      <p>Aprenda a interconectar portas lógicas para formar circuitos operacionais complexos.</p>
    `,
    labType: "circuit"
  },
  {
    id: "m8",
    title: "Módulo 8: Aplicações Práticas Industriais",
    summary: "Controle do reservatório de água e lógica de prioridade entre máquinas.",
    content: `
      <h3>Aplicações do Mundo Real</h3>
      <p>Estude casos práticos de automação industrial modelados por lógica booleana.</p>
    `,
    labType: "reservoir"
  }
];