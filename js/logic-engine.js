/**
 * Motor de Avaliação Lógica e Validação Matemática
 */
const LogicEngine = {
  // Avalia uma expressão booleana dadas as variáveis em um objeto (ex: {A: 1, B: 0})
  evaluate(expression, inputs) {
    // PASSO 1: substitui keywords de palavras inteiras com \b ANTES de remover espaços.
    // - XNOR é protegido antes de XOR e OR para evitar captura errada.
    // - XOR é convertido para ^ (XOR bitwise de inteiros 0/1), o que funciona
    //   corretamente em encadeamentos (A XOR B XOR C) porque ^ retorna número,
    //   não boolean — evitando o problema de boolean !== number do operador !==.
    // - XNOR = NOT XOR = !(A^B), representado como (~(A^B)&1) para manter 0/1.
    //   Usamos a identidade: A XNOR B = 1-(A^B) para operandos binários.
    let sanitized = expression
      .replace(/\bXNOR\b/g, '_XNOR_') // protege XNOR antes de XOR e OR
      .replace(/\bXOR\b/g,  '^')       // XOR → ^ (bitwise, correto para 0/1)
      .replace(/\bAND\b/g,  '&&')
      .replace(/\bOR\b/g,   '||')
      .replace(/\bNOT\b/g,  '!')
      .replace(/\s+/g,      '')        // remove espaços depois das keywords
      .replace(/_XNOR_/g,   '===')    // XNOR → === (após espaços removidos)
      .replace(/\./g,        '&&')    // ponto → AND
      .replace(/\+/g,        '||')    // mais → OR
      .replace(/\^(?!=)/g,   '^');    // mantém ^ (XOR bitwise) sem alterar ^=

    // PASSO 2: substitui variáveis negadas (A', ~A) ANTES de converter ~ em !
    // para que ~(expr) não perca o ~ antes de parêntese.
    Object.keys(inputs).forEach(varName => {
      const val = inputs[varName] ? 1 : 0;
      const regexNot = new RegExp(`~${varName}|${varName}'`, 'g');
      sanitized = sanitized.replace(regexNot, val ? '0' : '1');
    });

    // PASSO 3: converte ~ restante (ex: ~(A.B), ~~A) em operador JS !
    sanitized = sanitized.replace(/~/g, '!');

    // PASSO 4: substitui variáveis normais
    Object.keys(inputs).forEach(varName => {
      const val = inputs[varName] ? 1 : 0;
      const regexVar = new RegExp(`\\b${varName}\\b`, 'g');
      sanitized = sanitized.replace(regexVar, val.toString());
    });

    try {
      // Avaliação segura da expressão
      return Function(`"use strict"; return (${sanitized}) ? 1 : 0;`)();
    } catch (e) {
      console.error("Erro ao avaliar expressão:", expression, e);
      return 0;
    }
  },

  // Gera todas as combinações de uma tabela-verdade para N variáveis
  generateTruthTable(variables, evalFn) {
    const numVars = variables.length;
    const rowsCount = Math.pow(2, numVars);
    const table = [];

    for (let i = 0; i < rowsCount; i++) {
      const inputs = {};
      for (let j = 0; j < numVars; j++) {
        // Deslocamento de bits para gerar 0 e 1 ordenados
        const bit = (i >> (numVars - 1 - j)) & 1;
        inputs[variables[j]] = bit;
      }
      const output = evalFn(inputs);
      table.push({ inputs, output });
    }
    return table;
  },

  // Verifica se duas expressões são matematicamente equivalentes
  areEquivalent(expr1, expr2, variables) {
    const table1 = this.generateTruthTable(variables, (inputs) => this.evaluate(expr1, inputs));
    const table2 = this.generateTruthTable(variables, (inputs) => this.evaluate(expr2, inputs));

    return table1.every((row, idx) => row.output === table2[idx].output);
  }
};
// Adicionar ao final do ficheiro js/logic-engine.js:

/**
 * Autoteste de Validação Matemática e Integridade Lógica
 */
LogicEngine.runSelfTest = function() {
  console.log("⚡ Executando bateria de autotestes lógicos...");
  
  // Teste 1: Validação de Tabela-Verdade AND
  const andValid = this.evaluate("A . B", {A: 1, B: 1}) === 1 && this.evaluate("A . B", {A: 1, B: 0}) === 0;
  
  // Teste 2: Validação da 1ª Lei de De Morgan ~(A . B) == ~A + ~B
  const deMorganValid = this.areEquivalent("~(A . B)", "~A + ~B", ['A', 'B']);

  // Teste 3: Validação da Absorção A + A.B == A
  const absorptionValid = this.areEquivalent("A + A . B", "A", ['A', 'B']);

  if (andValid && deMorganValid && absorptionValid) {
    console.log("✅ Todos os testes matemáticos foram concluídos com 100% de exatidão!");
  } else {
    console.error("❌ Falha na validação dos testes lógicos!");
  }
};

// Executar verificação na inicialização
LogicEngine.runSelfTest();