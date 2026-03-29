# react-use-observer-hooks

A collection of React hooks for syncing scroll position with navigation state, detecting element visibility, and tracking scroll offset.

## Installation

```bash
npm install react-use-observer-hooks
```

## Hooks

- [useAnchorObserver](#useanchorobserver) — sync page URL with scroll position (single-page anchor navigation)
- [useWasScrolled](#usewasscrolled) — detect whether the page (or an element) has been scrolled past an offset
- [useVisible](#usevisible) — detect whether a single element is visible in the viewport

---

## useAnchorObserver

**[Live Demo on StackBlitz](https://stackblitz.com/edit/vitejs-vite-rd7g5dua)**

Synchronizes URL/router state with the current scroll position on a single page divided into named sections. When the user scrolls to a section, the URL updates automatically. When the URL changes (e.g., via navigation links or browser back/forward), the page scrolls to the corresponding section.

### Signature

```ts
useAnchorObserver<T extends HTMLElement>(props: UseAnchorObserverProps): UseAnchorObserver<T>
```

### Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `anchors` | `string[]` | yes | Ordered list of anchor identifiers — one per section, matched by index to the container's children |
| `currentAnchor` | `string` | yes | The currently active anchor (e.g., current URL pathname) |
| `onAnchorChange` | `(anchor: string) => void` | no | Called when the visible section changes due to scrolling |

### Return value

| Field | Type | Description |
|---|---|---|
| `ref` | `RefObject<T>` | Attach to the container element whose **direct children** are the sections |
| `focusedAnchor` | `string \| undefined` | The anchor identifier of the currently visible section |
| `scrollToAnchor` | `(anchor: string) => void` | Programmatically scroll to a section by its anchor identifier |

### How it works

- `ref` must be attached to a **wrapper element** whose direct children correspond 1-to-1 with the `anchors` array (by index).
- The hook uses `IntersectionObserver` to watch all children and determines which one is most visible.
- When the visible child changes, `onAnchorChange` is called with the matching anchor string — use this to update the URL.
- When `currentAnchor` changes externally (URL change), the hook automatically scrolls to the matching section with a smooth animation.
- On initial mount, the page instantly scrolls to the section matching `currentAnchor` (no animation).
- During programmatic scrolling, observer updates are locked to prevent feedback loops.

### Example: Next.js single-page navigation (Pages Router)

This example shows a page with three sections — `About`, `Timeline`, `Contacts` — where each section corresponds to a URL path.

```tsx
// pages/[[...slug]].tsx
import { useMemo } from 'react';
import { useAnchorObserver } from 'react-use-observer-hooks';
import { usePathname } from 'next/navigation';
import Router from 'next/router';

// Sections and their corresponding URL paths
const SECTIONS = [
  { href: '/',          label: 'About',    Component: About },
  { href: '/timeline',  label: 'Timeline', Component: Timeline },
  { href: '/contacts',  label: 'Contacts', Component: Contacts },
];

const ANCHORS = SECTIONS.map(s => s.href); // ['/', '/timeline', '/contacts']

export default function Page() {
  const pathName = usePathname();

  const { ref, focusedAnchor } = useAnchorObserver<HTMLDivElement>({
    anchors: ANCHORS,
    currentAnchor: pathName,       // current URL path drives the initial scroll position
    onAnchorChange: (anchor: string) => {
      Router.push(anchor, undefined, { scroll: false, shallow: false });
    },
  });

  const currentSection = useMemo(
    () => SECTIONS.find(s => s.href === focusedAnchor),
    [focusedAnchor],
  );

  return (
    <>
      {/* Navigation menu highlights the active section */}
      <Header pages={SECTIONS} currentPage={currentSection} />

      {/*
        The container ref is attached here.
        Each direct child maps to ANCHORS[index]:
          children[0] → '/'
          children[1] → '/timeline'
          children[2] → '/contacts'
      */}
      <div ref={ref}>
        {SECTIONS.map(({ href, Component }) => (
          <section key={href} style={{ minHeight: '100vh' }}>
            <Component />
          </section>
        ))}
      </div>
    </>
  );
}
```

**Navigation link** — use `scroll={false}` so Next.js doesn't scroll on its own; the hook handles scrolling:

```tsx
<Link href="/timeline" scroll={false} shallow>
  Timeline
</Link>
```

**Programmatic scroll** — call `scrollToAnchor` directly:

```tsx
const { ref, scrollToAnchor } = useAnchorObserver<HTMLDivElement>({ ... });

<button onClick={() => scrollToAnchor('/contacts')}>
  Go to Contacts
</button>
```

---

## useWasScrolled

Returns `true` when the window (or a given element) has been scrolled past `offset` pixels.

### Signature

```ts
useWasScrolled(element?: HTMLElement | Window | null, offset?: number): boolean
```

### Parameters

| Param | Type | Default | Description |
|---|---|---|---|
| `element` | `HTMLElement \| Window \| null` | `window` | Element to observe. Defaults to the browser window. |
| `offset` | `number` | `0` | Scroll distance in pixels after which the hook returns `true` |

### Example: sticky header shadow

```tsx
import { useWasScrolled } from 'react-use-observer-hooks';

export const Header = () => {
  const isScrolled = useWasScrolled(); // true once page scrolls past 0px

  return (
    <header className={isScrolled ? 'header header--sticked' : 'header'}>
      ...
    </header>
  );
};
```

With a custom offset — show a "back to top" button only after 300px:

```tsx
const showBackToTop = useWasScrolled(null, 300);
```

---

## useVisible

Returns `true` when a given DOM element intersects the viewport (is visible on screen).

### Signature

```ts
useVisible(element: Element | null, options?: IntersectionObserverInit & { freezeOnceVisible?: boolean }): boolean
```

### Options

Accepts all standard `IntersectionObserver` options plus:

| Option | Type | Default | Description |
|---|---|---|---|
| `threshold` | `number` | `0` | Fraction of the element that must be visible |
| `root` | `Element \| null` | `null` | Scroll container (defaults to viewport) |
| `rootMargin` | `string` | `'0%'` | Margin around the root |
| `freezeOnceVisible` | `boolean` | `false` | Stop observing once the element becomes visible |

### Example: lazy-render a heavy component

```tsx
import { useRef } from 'react';
import { useVisible } from 'react-use-observer-hooks';

const LazySection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useVisible(ref.current, { freezeOnceVisible: true });

  return (
    <div ref={ref}>
      {isVisible ? <HeavyComponent /> : <Placeholder />}
    </div>
  );
};
```

---

## License

MIT
