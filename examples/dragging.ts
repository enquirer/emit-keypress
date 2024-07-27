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
    this.deltaArray = [0, 0, 0];
    this.direction = 1;
    this.dragging = false;
    this.enabled = true;
    this.firstScroll = true;
    this.height = 0;
    this.internalX = 0;
    this.internalY = 0;
    this.isStopped = true;
    this.mode = null;
    this.options = { ...defaultOptions, ...options };
    this.percentX = 0;
    this.percentY = 0;
    this.velocityX = 0;
    this.velocityY = 0;
    this.wheelAcceleration = false;
    this.width = 0;
    this.x = 0;
    this.y = 0;
  }

  resize(height, width) {
    this.height = height;
    this.width = width;
    this.update(true);
  }

  reset() {
    this.internalY = 0;
    this.internalX = 0;
    this.update(true);
  }

  update(immediate) {
    if (this.enabled) {
      if (immediate || !this.dragging && (this.mode === 'touch' || this.mode === 'trackpad')) {
        this.y = this.internalY;
        this.velocityY = 0;
        this.x = this.internalX;
        this.velocityX = 0;
      } else if (!this.dragging) {
        this.y += (this.internalY - this.y) * this.options.easing;
        this.velocityY = this.internalY - this.y;
        this.x += (this.internalX - this.x) * this.options.easing;
        this.velocityX = this.internalX - this.x;
      }
    }

    this.percentY = this.y / this.height;
    this.percentX = this.x / this.width;
  }

  analyzeArray(deltaY, deltaX) {
    const deltaArrayFirstAbsY = Math.abs(this.deltaArray[0].y);
    const deltaArraySecondAbsY = Math.abs(this.deltaArray[1].y);
    const deltaArrayThirdAbsY = Math.abs(this.deltaArray[2].y);
    const deltaAbsY = Math.abs(deltaY);
    const deltaArrayFirstAbsX = Math.abs(this.deltaArray[0].x);
    const deltaArraySecondAbsX = Math.abs(this.deltaArray[1].x);
    const deltaArrayThirdAbsX = Math.abs(this.deltaArray[2].x);
    const deltaAbsX = Math.abs(deltaX);

    if ((deltaAbsY > deltaArrayThirdAbsY && deltaArrayThirdAbsY > deltaArraySecondAbsY && deltaArraySecondAbsY > deltaArrayFirstAbsY)
      || (deltaAbsX > deltaArrayThirdAbsX && deltaArrayThirdAbsX > deltaArraySecondAbsX && deltaArraySecondAbsX > deltaArrayFirstAbsX)) {
      this.wheelAcceleration = true;
    } else if ((deltaAbsY < deltaArrayThirdAbsY && deltaArrayThirdAbsY <= deltaArraySecondAbsY)
      || (deltaAbsX < deltaArrayThirdAbsX && deltaArrayThirdAbsX <= deltaArraySecondAbsX)) {
      this.wheelAcceleration = false;
      this.mode = 'trackpad';
    }

    this.deltaArray.shift();
    this.deltaArray.push({ x: deltaX, y: deltaY });
  }

  handleMouseWheel(deltaY, deltaX) {
    if (!this.mode || this.mode === 'touch') {
      this.mode = 'scroll';
    }

    // this.dragging = false;
    const directionY = deltaY > 0 ? 1 : -1;

    if (directionY !== this.direction) {
      this.deltaArray = [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }];
    }

    this.direction = directionY;

    if (this.isStopped) {
      this.isStopped = false;

      if (this.wheelAcceleration) {
        this.mode = 'scroll';
      }

      this.wheelAcceleration = true;
    }

    this.analyzeArray(deltaY, deltaX);
    this.internalY += deltaY;
    this.internalX += deltaX;

    if (this.stopped) {
      this.dragging = false;
      this.stopped = false;
    }
  }

  handleTouchStart() {
    this.dragging = false;
    this.mode = 'touch';
  }

  handleMouseUp() {
    this.stopped = true;
  }

  handleMouseMove(key) {
    if (this.dragging) {
      const deltaY = key.y - this.lastMouseY;
      const deltaX = key.x - this.lastMouseX;
      this.handleMouseWheel(deltaY, deltaX);
      this.lastMouseY = key.y;
      this.lastMouseX = key.x;
    } else if (key.action === 'mousedown') {
      this.dragging = true;
      this.lastMouseY = key.y;
      this.lastMouseX = key.x;
    }
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

  const details = [
    ['scroll mode:', scroll.mode].join(''),
    ['wheel acceleration:', scroll.wheelAcceleration].join(''),
    ['direction:', scroll.direction === -1 ? 'up' : 'down'].join(''),
    ['dragging:', scroll.dragging].join('')
  ];

  console.log(details.join(' | '));

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
      case 'mousedown':
      case 'mousemove':
        scroll.handleMouseMove(key);
        update();
        break;
      case 'mouseup':
        scroll.handleMouseUp();
        update();
        break;
      case 'wheeldown':
        scroll.handleMouseWheel(-3, 0);
        update();
        break;
      case 'wheelup':
        scroll.handleMouseWheel(3, 0);
        update();
        break;
      default:
        break;
    }
  }
});
