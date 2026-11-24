import { commandDefinitions } from './commands.js';
export { chooseModel } from './commands.js';

export class SlashCommand {
  constructor(name, description, run) {
    this.label = '/' + name;
    this.description = description;
    this.run = run;
  }
}

export class SlashCommands {
  constructor(commands = commandDefinitions) {
    this.items = [];

    for (const command of commands) {
      this.register(command);
    }
  }

  register(command) {
    const item = command.label === undefined
        ? new SlashCommand(command.name, command.description, command.action)
        : command;

    this.items.push(item);
    return item;
  }

  matching(prefix) {
    return this.items.filter(command => command.label.startsWith(prefix));
  }
}
