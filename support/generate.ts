
const mods = ['fn', 'ctrl', 'shift', 'meta'];
const arrows = ['up', 'down', 'left', 'right'];
const shortcuts: string[] = [];

const shortcutCombinations = (arr: string[]): string[][] => {
  const result: string[][] = [[]];
  for (const value of arr) {
    const copy = [...result];

    for (const prefix of copy) {
      result.push(prefix.concat(value));
    }
  }

  return result.filter(ele => ele.length > 0);
};

// Get all combinations of the mods array
const modCombinations = shortcutCombinations(mods);

// Add arrow keys to shortcuts
for (const arrow of arrows) {
  shortcuts.push(arrow);
}

// Add mod + arrow combinations to shortcuts
for (const arrow of arrows) {
  for (const modComb of modCombinations) {
    shortcuts.push(`${modComb.join('+')}+${arrow}`);
  }
}

shortcuts.sort();
shortcuts.sort((a, b) => a.split('+').length - b.split('+').length);
console.log(shortcuts);
// console.log(JSON.stringify(shortcuts));
