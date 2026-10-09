/**
 * Controlador Principal da Aplicação
 */
document.addEventListener('DOMContentLoaded', () => {
  // Inicializa barra de progresso
  updateProgressBar();

  // Renderiza Lista de Módulos na Trilha
  const moduleListContainer = document.getElementById('module-list');
  CourseData.forEach((mod, idx) => {
    const li = document.createElement('li');
    li.className = `module-item ${idx === 0 ? 'active' : ''}`;
    li.innerText = mod.title;
    li.addEventListener('click', () => {
      document.querySelectorAll('.module-item').forEach(m => m.classList.remove('active'));
      li.classList.add('active');
      renderModule(mod);
    });
    moduleListContainer.appendChild(li);
  });

  // Carrega Módulo 1 por padrão
  renderModule(CourseData[0]);

  // Alternância de Abas Superiores (Trilha vs Laboratórios Diretos)
  const navModulesBtn = document.getElementById('nav-modules-btn');
  const navLabsBtn = document.getElementById('nav-labs-btn');
  const viewModules = document.getElementById('view-modules');
  const viewLabs = document.getElementById('view-labs');

  navModulesBtn.addEventListener('click', () => {
    navModulesBtn.classList.add('active');
    navLabsBtn.classList.remove('active');
    viewModules.classList.add('active');
    viewLabs.classList.remove('active');
  });

  navLabsBtn.addEventListener('click', () => {
    navLabsBtn.classList.add('active');
    navModulesBtn.classList.remove('active');
    viewLabs.classList.add('active');
    viewModules.classList.remove('active');
    loadLab('gates');
  });

  // Eventos de troca de laboratório na aba direta
  document.querySelectorAll('.lab-tab-btn').forEach(tab => {
    tab.addEventListener('click', (e) => {
      document.querySelectorAll('.lab-tab-btn').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      loadLab(tab.getAttribute('data-lab'));
    });
  });
});

function renderModule(mod) {
  const display = document.getElementById('module-display');
  display.innerHTML = `
    <h2>${mod.title}</h2>
    <div>${mod.content}</div>
    <div class="card-box" style="margin-top: 1rem;">
      <h3>Experiência Interativa do Módulo</h3>
      <div id="module-interactive-area"></div>
    </div>
    <button id="btn-complete-module" class="btn-action" style="align-self: flex-end;">Marcar Módulo como Concluído</button>
  `;

  // Carrega a simulação interativa vinculada ao módulo
  const labContainer = document.getElementById('module-interactive-area');
  loadLab(mod.labType, labContainer);

  document.getElementById('btn-complete-module').addEventListener('click', () => {
    ProgressManager.markCompleted(mod.id);
    updateProgressBar();
    alert("Módulo marcado como concluído com sucesso!");
  });
}

function loadLab(labType, targetContainer = null) {
  const container = targetContainer || document.getElementById('lab-container');
  switch (labType) {
    case 'gates': GatesLab.render(container); break;
    case 'truth': TruthBuilderLab.render(container); break;
    case 'simplifier': SimplifierLab.render(container); break;
    case 'kmap': KMapLab.render(container); break;
    case 'circuit': CircuitBuilderLab.render(container); break;
    case 'reservoir': ReservoirSimLab.render(container); break;
    case 'priority': PrioritySimLab.render(container); break;
    default: GatesLab.render(container); break;
  }
}

function updateProgressBar() {
  const percent = ProgressManager.calculatePercentage(CourseData.length);
  document.getElementById('progress-text').innerText = `Progresso: ${percent}%`;
  document.getElementById('progress-fill').style.width = `${percent}%`;
}