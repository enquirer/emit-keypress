import { PickerScreen } from './screens.js';

export const commandDefinitions = [
  { name: 'model', description: 'Choose model and effort', action: chooseModel },
  { name: 'agents', description: 'Switch conversation', action: app => app.agents() },
  {
    name: 'messages',
    description: 'Browse conversation history',
    action: app => app.history()
  },
  {
    name: 'warnings',
    description: 'Review session warnings',
    action: app => app.showWarnings()
  },
  {
    name: 'keys',
    description: 'View keyboard shortcuts',
    action: app => app.shortcuts()
  },
  { name: 'quit', description: 'Close the workspace', action: app => app.close() }
];

export function chooseModel(app) {
  const items = app.models.map(model => ({
    label: model.name + (app.model === model.name ? ' (current)' : ''),
    description: model.description,
    run() {
      const efforts = model.efforts.map(effort => ({
        label: effort + (app.model === model.name && app.effort === effort ? ' (current)' : ''),
        run() {
          app.model = model.name;
          app.effort = effort;
          app.finish();
        }
      }));

      const picker = new PickerScreen(model.name + '  /  effort', efforts);
      picker.menu.index = Math.max(0, model.efforts.indexOf(app.effort));
      app.push(picker);
    }
  }));

  const picker = new PickerScreen('Select Model and Effort', items);
  picker.menu.index = Math.max(0, app.models.findIndex(model => model.name === app.model));
  app.push(picker);
}
