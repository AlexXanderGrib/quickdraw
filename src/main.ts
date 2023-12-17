import "./style.css";

class Point {
  static readonly START = new Point(Infinity, Infinity);
  static readonly STOP = new Point(-Infinity, -Infinity);

  constructor(public readonly x: number, public readonly y: number) {
    Object.freeze(this);
  }
}

const store = (() => {
  const history: Point[] = [];
  const canAdd = () =>
    history.lastIndexOf(Point.START) > history.lastIndexOf(Point.STOP);

  return Object.freeze({
    points: (): Iterable<Point> => history,
    canAdd,
    add: (point: Point) =>
      (canAdd() || point === Point.START) && history.push(point),
  });
})();


const canvas = document.querySelector("canvas")!;
const context = canvas.getContext("2d", { alpha: false })!;

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.onresize = resize;
resize();

function render() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.lineWidth = 16;

  let first = true;
  let i = 0;

  for (const point of store.points()) {
    context.strokeStyle = `hsl(${Date.now() / 10 + ++i * 10}, 100%, 50%)`;

    if (point === Point.START) {
      first = true;
      context.beginPath();
      continue;
    }

    if (point === Point.STOP) {
      context.stroke();
      continue;
    }

    const { x, y } = point;

    if (first) {
      context.moveTo(x, y);
      first = false;
      continue;
    }

    context.lineTo(x, y);
  }

  context.stroke();
}

const stop = () => store.add(Point.STOP);
const start = () => store.add(Point.START);

canvas.onpointerdown = start;
canvas.onpointerup = stop;
canvas.onpointerout = stop;
canvas.onpointercancel = stop;
canvas.onpointermove = (e) => store.add(new Point(e.x, e.y));

(function loop() {
  render();
  requestAnimationFrame(loop);
})();
