// Memoize so we're much more friendly to non-dom envs
let memoizedNow: () => number;

const now = () => {
  if (!memoizedNow) {
    memoizedNow = 'performance' in window ? performance.now.bind(performance) : Date.now;
  }
  return memoizedNow();
};

const ease = (t: number) => 1 + --t * t * t * t * t;

const step = (context: {
  method: (elapsed: number, value: number, x: number, y: number) => void;
  startTime: number;
  startX: number;
  startY: number;
  x: number;
  y: number;
  duration: number;
  cb: () => void;
}) => {
  const time = now();
  const elapsed = Math.min((time - context.startTime) / context.duration, 1);
  // apply easing to elapsed time
  const value = ease(elapsed);

  const currentX = context.startX + (context.x - context.startX) * value;
  const currentY = context.startY + (context.y - context.startY) * value;

  context.method(currentX, currentY, elapsed, value);

  // scroll more if we have not reached our destination
  if (currentX !== context.x || currentY !== context.y) {
    requestAnimationFrame(() => step(context));
  } else {
    // If nothing left to scroll lets fire the callback
    context.cb();
  }
};

const smoothScroll = (el: Element, x: number, y: number, duration: number, cb: () => void) => {
  const method = (x: number, y: number) => {
    // TODO: use Element.scroll if it exists, as it is potentially better performing
    // use ceil to include the the fractional part of the number for the scrolling
    el.scrollLeft = Math.ceil(x);
    el.scrollTop = Math.ceil(y);
  };

  // scroll looping over a frame if needed
  step({
    method: method,
    startTime: now(),
    startX: el.scrollLeft,
    startY: el.scrollTop,
    x: x,
    y: y,
    duration,
    cb,
  });
};

export const smoothScrollBehavior =
  (duration = 600) =>
  (actions: Array<{ el: Element; left: number; top: number }>): Promise<void[]> =>
    Promise.all(
      actions.reduce<Promise<void>[]>(
        (results, { el, left, top }) =>
          el.scrollLeft === left && el.scrollTop === top
            ? results
            : [
                ...results,
                new Promise(resolve => {
                  return smoothScroll(el, left, top, duration, resolve);
                }),
              ],
        [],
      ),
    );
