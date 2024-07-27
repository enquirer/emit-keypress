import { emitKeypress } from '../index';

const rotate = (items, count = 0) => {
  if (items.length > 0) {
    const n = ((count % items.length) + items.length) % items.length;
    return n === 0 ? [...items] : [...items.slice(-n), ...items.slice(0, -n)];
  }

  return [...items];
};

const items = [
  'Item 1',
  'Item 2',
  'Item 3',
  'Item 4',
  'Item 5',
  'Item 6',
  'Item 7',
  'Item 8',
  'Item 9',
  'Item 10',
  'Item 11',
  'Item 12',
  'Item 13',
  'Item 14',
  'Item 15',
  'Item 16',
  'Item 17',
  'Item 18',
  'Item 19',
  'Item 20'
];

const defaultOptions = {
  autoResize: true,
  disablePointerEvents: true,
  easing: 0.1
};

export class SmoothScroll {
  constructor(options = {}) {
    this.options = { ...defaultOptions, ...options };
    this.x = 0;
    this.y = 0;
    this.internalY = 0;
    this.velocityY = 0;
    this.percent = 0;
    this.enabled = true;
    this.firstScroll = true;
    this.deltaArray = [0, 0, 0];
    this.direction = 1;
    this.isStopped = true;
  }

  resize(height) {
    this.height = height;
    this.update(true);
  }

  reset() {
    this.internalY = 0;
    this.update(true);
  }

  update(immediate) {
    if (this.enabled) {
      if (immediate || !this.dragging && (this.mode === 'touch' || this.mode === 'trackpad')) {
        this.y = this.internalY;
        this.velocityY = 0;
      } else {
        this.y += (this.internalY - this.y) * this.options.easing;
        this.velocityY = this.internalY - this.y;
      }
    }

    this.percent = this.y / this.height;
  }

  analyzeArray(deltaY) {
    const deltaArrayFirstAbs = Math.abs(this.deltaArray[0]);
    const deltaArraySecondAbs = Math.abs(this.deltaArray[1]);
    const deltaArrayThirdAbs = Math.abs(this.deltaArray[2]);
    const deltaAbs = Math.abs(deltaY);

    if (deltaAbs > deltaArrayThirdAbs && deltaArrayThirdAbs > deltaArraySecondAbs && deltaArraySecondAbs > deltaArrayFirstAbs) {
      this.wheelAcceleration = true;
    } else if (deltaAbs < deltaArrayThirdAbs && deltaArrayThirdAbs <= deltaArraySecondAbs) {
      this.wheelAcceleration = false;
      this.mode = 'trackpad';
    }

    this.deltaArray.shift();
    this.deltaArray.push(deltaY);
  }

  handleMouseWheel(deltaY) {
    if (!this.mode || this.mode === 'touch') {
      this.mode = 'mouse';
    }

    this.dragging = false;
    const direction = deltaY > 0 ? 1 : -1;

    if (direction !== this.direction) {
      this.deltaArray = [0, 0, 0];
    }

    this.direction = direction;

    if (this.isStopped) {
      this.isStopped = false;

      if (this.wheelAcceleration) {
        this.mode = 'mouse';
      }

      this.wheelAcceleration = true;
    }

    this.analyzeArray(deltaY);
    this.internalY += deltaY;
  }

  handleTouchStart() {
    this.dragging = false;
    this.mode = 'touch';
  }
}

const scroll = new SmoothScroll();

const createState = () => {
  const length = Math.min(process.stdout.rows - 5, items.length);
  const rotated = startIndex === 0 ? items : rotate(items, startIndex);
  const visible = rotated.slice(0, length);
  return visible;
};

let startIndex = 0;
let cursor = 0;
let visible = createState();

function renderList() {
  console.clear();
  visible = createState(startIndex);

  for (let i = 0; i < visible.length; i++) {
    if (i === cursor) {
      console.log('> ' + visible[i]);
    } else {

      console.log('  ' + visible[i]);
    }

  }
}

renderList();

const update = () => {
  scroll.update();
  startIndex = Math.floor(scroll.y) % items.length;
  renderList();
};

emitKeypress({
  enableMouseEvents: true,
  onKeypress: (input, key, close) => {
    // console.log('keypress:', { input, key });
    switch (key.name) {
      case 'up':
        cursor--;
        renderList();
        break;
      case 'down':
        cursor++;
        renderList();
        break;
      default: {
        if (input === '\x03' || input === '\r') {
          console.log(visible[cursor]);
          close();
        }
        break;
      }
    }
  },
  onMousepress: key => {
    // console.log(key);
    switch (key.action) {
      case 'wheeldown':
        scroll.handleMouseWheel(-3);
        update();
        break;
      case 'wheelup':
        scroll.handleMouseWheel(3);
        update();
        break;
      default: {
        break;
      }
    }

  }
});
