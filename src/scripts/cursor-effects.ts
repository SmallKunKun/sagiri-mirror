interface Point {
  x: number;
  y: number;
}

interface CircleOptions {
  origin: Point;
  speed: number;
  color: string;
  angle: number;
  context: CanvasRenderingContext2D;
}

interface BoomOptions {
  origin: Point;
  context: CanvasRenderingContext2D;
  area: { width: number; height: number };
  circleCount?: number;
}

class Circle {
  origin: Point;
  position: Point;
  color: string;
  speed: number;
  angle: number;
  context: CanvasRenderingContext2D;
  renderCount = 0;

  constructor({ origin, speed, color, angle, context }: CircleOptions) {
    this.origin = origin;
    this.position = { ...origin };
    this.color = color;
    this.speed = speed;
    this.angle = angle;
    this.context = context;
  }

  draw() {
    this.context.fillStyle = this.color;
    this.context.beginPath();
    this.context.arc(this.position.x, this.position.y, 2, 0, Math.PI * 2);
    this.context.fill();
  }

  move() {
    this.position.x = Math.sin(this.angle) * this.speed + this.position.x;
    this.position.y =
      Math.cos(this.angle) * this.speed +
      this.position.y +
      this.renderCount * 0.3;
    this.renderCount++;
  }
}

class Boom {
  origin: Point;
  context: CanvasRenderingContext2D;
  circleCount: number;
  area: { width: number; height: number };
  stop = false;
  circles: Circle[] = [];

  constructor({
    origin,
    context,
    circleCount = 10,
    area,
  }: BoomOptions) {
    this.origin = origin;
    this.context = context;
    this.circleCount = circleCount;
    this.area = area;
  }

  randomArray<T>(range: T[]) {
    return range[Math.floor(range.length * Math.random())];
  }

  randomColor() {
    const range = ["8", "9", "A", "B", "C", "D", "E", "F"];
    return `#${this.randomArray(range)}${this.randomArray(range)}${this.randomArray(range)}${this.randomArray(range)}${this.randomArray(range)}${this.randomArray(range)}`;
  }

  randomRange(start: number, end: number) {
    return (end - start) * Math.random() + start;
  }

  init() {
    for (let index = 0; index < this.circleCount; index++) {
      this.circles.push(
        new Circle({
          context: this.context,
          origin: this.origin,
          color: this.randomColor(),
          angle: this.randomRange(Math.PI - 1, Math.PI + 1),
          speed: this.randomRange(1, 6),
        }),
      );
    }
  }

  move() {
    this.circles.forEach((circle, index) => {
      if (
        circle.position.x > this.area.width ||
        circle.position.y > this.area.height
      ) {
        this.circles.splice(index, 1);
        return;
      }
      circle.move();
    });

    if (this.circles.length === 0) {
      this.stop = true;
    }
  }

  draw() {
    this.circles.forEach((circle) => circle.draw());
  }
}

class CursorSpecialEffects {
  computerCanvas = document.createElement("canvas");
  renderCanvas = document.createElement("canvas");
  computerContext = this.computerCanvas.getContext("2d")!;
  renderContext = this.renderCanvas.getContext("2d")!;
  globalWidth = window.innerWidth;
  globalHeight = window.innerHeight;
  booms: Boom[] = [];
  running = false;

  handleMouseDown(event: MouseEvent) {
    const boom = new Boom({
      origin: { x: event.clientX, y: event.clientY },
      context: this.computerContext,
      area: {
        width: this.globalWidth,
        height: this.globalHeight,
      },
    });

    boom.init();
    this.booms.push(boom);
    if (!this.running) this.run();
  }

  handlePageHide() {
    this.booms = [];
    this.running = false;
  }

  init() {
    const style = this.renderCanvas.style;
    style.position = "fixed";
    style.top = "0";
    style.left = "0";
    style.zIndex = "2147483647";
    style.pointerEvents = "none";

    style.width = `${this.globalWidth}px`;
    style.height = `${this.globalHeight}px`;
    this.renderCanvas.width = this.globalWidth;
    this.renderCanvas.height = this.globalHeight;
    this.computerCanvas.width = this.globalWidth;
    this.computerCanvas.height = this.globalHeight;

    this.renderCanvas.setAttribute("aria-hidden", "true");
    document.body.append(this.renderCanvas);

    window.addEventListener("mousedown", this.handleMouseDown.bind(this));
    window.addEventListener("pagehide", this.handlePageHide.bind(this));
  }

  run() {
    this.running = true;

    if (this.booms.length === 0) {
      this.running = false;
      return;
    }

    requestAnimationFrame(this.run.bind(this));

    this.computerContext.clearRect(0, 0, this.globalWidth, this.globalHeight);
    this.renderContext.clearRect(0, 0, this.globalWidth, this.globalHeight);

    this.booms.forEach((boom, index) => {
      if (boom.stop) {
        this.booms.splice(index, 1);
        return;
      }
      boom.move();
      boom.draw();
    });

    this.renderContext.drawImage(
      this.computerCanvas,
      0,
      0,
      this.globalWidth,
      this.globalHeight,
    );
  }
}

const cursorSpecialEffects = new CursorSpecialEffects();
cursorSpecialEffects.init();
