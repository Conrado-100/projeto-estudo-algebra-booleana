/**
 * Motor para os Mapas de Karnaugh (2, 3 e 4 variáveis com Código de Gray)
 */
const KMapEngine = {
  // Sequência estrita do Código de Gray para preservar adjacência de 1 bit
  grayCodes: {
    1: ['0', '1'],
    2: ['00', '01', '11', '10']
  },

  getMapStructure(numVars) {
    if (numVars === 2) {
      return {
        rowVars: ['A'],
        colVars: ['B'],
        rowLabels: this.grayCodes[1],
        colLabels: this.grayCodes[1]
      };
    } else if (numVars === 3) {
      return {
        rowVars: ['A'],
        colVars: ['B', 'C'],
        rowLabels: this.grayCodes[1],
        colLabels: this.grayCodes[2]
      };
    } else if (numVars === 4) {
      return {
        rowVars: ['A', 'B'],
        colVars: ['C', 'D'],
        rowLabels: this.grayCodes[2],
        colLabels: this.grayCodes[2]
      };
    }
  }
};