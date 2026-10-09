/**
 * Gerenciador de Progresso com salvamento local (localStorage)
 */
const ProgressManager = {
  STORAGE_KEY: 'boole_lab_progress',

  getCompletedModules() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  markCompleted(moduleId) {
    const completed = this.getCompletedModules();
    if (!completed.includes(moduleId)) {
      completed.push(moduleId);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(completed));
    }
  },

  calculatePercentage(totalModules) {
    const completed = this.getCompletedModules().length;
    return Math.round((completed / totalModules) * 100);
  }
};