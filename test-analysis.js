/**
 * Análise de Segurança, Acessibilidade e Responsividade
 */
const fs = require('fs');

const files = [
  'js/app.js',
  'js/logic-engine.js',
  'js/labs/gates-lab.js',
  'js/labs/truth-builder.js',
  'js/labs/simplifier.js',
  'js/labs/kmap-lab.js',
  'js/labs/circuit-builder.js',
  'js/labs/reservoir-sim.js',
  'js/labs/priority-sim.js',
];

console.log('=== ANÁLISE DE SEGURANÇA ===');
const securityFindings = [];
files.forEach(f => {
  const c = fs.readFileSync(f, 'utf8');
  const inner = (c.match(/innerHTML/g) || []).length;
  const evalUse = (c.match(/\beval\b/g) || []).length;
  const functionCtor = (c.match(/new Function|Function\(/g) || []).length;
  console.log(f + ': innerHTML=' + inner + ' eval=' + evalUse + ' Function()=' + functionCtor);
  if (functionCtor > 0) securityFindings.push({ file: f, issue: 'Function() constructor usado para eval dinâmico', count: functionCtor });
});

console.log('\nAchados de segurança relevantes:');
securityFindings.forEach(s => console.log('  [!] ' + s.file + ': ' + s.issue));

// Verifica se o input do usuário chega ao Function() no simplifier
const simp = fs.readFileSync('js/labs/simplifier.js', 'utf8');
const simpUsesEval = simp.includes('evaluate(') && simp.includes('LogicEngine');
console.log('\nsimplifier.js usa LogicEngine.evaluate (input vai para Function()):', simpUsesEval);
const truth = fs.readFileSync('js/labs/truth-builder.js', 'utf8');
console.log('truth-builder.js: input do usuário vai para LogicEngine.evaluate:', truth.includes("getElementById('truth-expr-input')"));

// Análise de listeners duplicados
console.log('\n=== ANÁLISE DE LISTENERS DUPLICADOS ===');
const app = fs.readFileSync('js/app.js', 'utf8');
// renderModule é chamado por clique no sidebar
// Cada chamada chama loadLab que chama GatesLab.render(container)
// GatesLab.render faz container.innerHTML = '...' limpando o DOM
// attachEvents é chamado após render, adicionando listeners aos NOVOS elementos
// Portanto NÃO há duplicação de listeners (DOM é recriado)
console.log('GatesLab.render limpa container.innerHTML antes de attachEvents: SIM (por design)');
console.log('Não há duplicação de listeners pois innerHTML substitui o DOM inteiro');

// Verifica se currentStep do simplificador é reiniciado no render
console.log('\n=== ESTADO ENTRE RENDERIZAÇÕES ===');
console.log('SimplifierLab.currentStep = 0 em render():', simp.includes('this.currentStep = 0') || simp.includes('currentStep: 0'));
// currentStep é definido como propriedade do objeto (currentStep: 0)
// Se render() for chamado 2x, o currentStep persiste do estado anterior
const simpCurrentStepInRender = simp.includes('this.currentStep = 0');
console.log('  currentStep resetado no render:', simpCurrentStepInRender, '(se false = BUG: estado antigo persiste)');

// GatesLab: currentGate persiste entre renderizações
const gates = fs.readFileSync('js/labs/gates-lab.js', 'utf8');
const gatesReset = gates.includes('this.currentGate = ');
console.log('GatesLab.currentGate resetado no render:', gatesReset, '(se false = estado persiste — OK por design)');

console.log('\n=== RESPONSIVIDADE ===');
const main = fs.readFileSync('css/main.css', 'utf8');
const lab = fs.readFileSync('css/lab.css', 'utf8');
const comp = fs.readFileSync('css/components.css', 'utf8');
console.log('main.css media queries:', (main.match(/@media/g) || []).length);
console.log('lab.css media queries:', (lab.match(/@media/g) || []).length);
console.log('components.css media queries:', (comp.match(/@media/g) || []).length);
console.log('lab-tabs tem overflow-x:auto (scroll horizontal em mobile):', lab.includes('overflow-x: auto'));
console.log('sidebar: grid-template-columns cai para 1fr em <900px:', main.includes('grid-template-columns: 1fr'));

// SVG do circuit-builder: width=450 fixo — problemático em mobile
const circ = fs.readFileSync('js/labs/circuit-builder.js', 'utf8');
const svgWidthFixed = circ.match(/width="(\d+)"/);
console.log('SVG do circuit tem largura fixa:', svgWidthFixed ? svgWidthFixed[0] : 'não encontrado',
  '(pode causar overflow em telas <450px)');

console.log('\n=== ACESSIBILIDADE ===');
const html = fs.readFileSync('index.html', 'utf8');
console.log('lang="pt-BR":', html.includes('lang="pt-BR"'));
console.log('viewport meta:', html.includes('viewport'));
const ariaCount = (html.match(/aria-/g) || []).length;
const roleCount = (html.match(/\brole=/g) || []).length;
console.log('aria- no HTML estático:', ariaCount);
console.log('role= no HTML estático:', roleCount);
// Botões de navegação sem aria-label
console.log('Botões de nav sem aria-label:', html.includes('nav-modules-btn') && !html.includes('aria-label'));
// focus styles
console.log(':focus em main.css:', (main.match(/:focus/g) || []).length);
console.log(':focus em components.css:', (comp.match(/:focus/g) || []).length);
// input[type=checkbox] nos labs tem label associado?
console.log('Switches têm <label> wrapping input:', gates.includes('<label class="switch">'));

console.log('\n=== VERIFICAÇÃO: KMapLab — minimização ausente ===');
const kmap = fs.readFileSync('js/labs/kmap-lab.js', 'utf8');
console.log('kmap-lab.js tem lógica de agrupamento/minimização:', 
  kmap.includes('group') || kmap.includes('minimiz') || kmap.includes('implicant'));
console.log('kmap-lab.js só permite clicar células (sem simplificação):', 
  kmap.includes('e.target.innerText = this.cellValues[key]'));

console.log('\n=== VERIFICAÇÃO: CircuitBuilderLab — portas disponíveis ===');
const circGates = circ.match(/value="(\w+)"/g) || [];
console.log('Portas disponíveis no visualizador de circuitos:', circGates.map(g => g.replace(/value="|"/g, '')));
console.log('XNOR disponível no visualizador:', circ.includes('"XNOR"'));
console.log('NOT disponível no visualizador:', circ.includes('"NOT"'));

console.log('\n=== VERIFICAÇÃO: reservoir — pontos visuais dos sensores ===');
const reservoir = fs.readFileSync('js/labs/reservoir-sim.js', 'utf8');
// Os sensor-dots no HTML do reservoir são renderizados com estado estático
// this.sensorA ? 'active' : '' — mas só na renderização inicial
// Ao mudar o sensor, update() só atualiza os LEDs e o nível de água
// Os pontos visuais dos sensores NÃO são atualizados no update()
const sensorDotUpdate = reservoir.includes('sensor-dot');
const updateContent = reservoir.match(/update\(\)\s*\{[^}]+\}/s);
console.log('sensor-dot aparece em render():', sensorDotUpdate);
if (updateContent) {
  console.log('update() atualiza os sensor-dots:', updateContent[0].includes('sensor-dot'));
}
