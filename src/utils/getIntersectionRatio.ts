export function getIntersectionRatio(element: Element, root?: Element): number {
  const elementRect = element.getBoundingClientRect();
  const rootRect = root
    ? root.getBoundingClientRect()
    : { top: 0, left: 0, bottom: window.innerHeight, right: window.innerWidth };

  const intersectionTop = Math.max(elementRect.top, rootRect.top);
  const intersectionLeft = Math.max(elementRect.left, rootRect.left);
  const intersectionBottom = Math.min(elementRect.bottom, rootRect.bottom);
  const intersectionRight = Math.min(elementRect.right, rootRect.right);

  const intersectionWidth = Math.max(0, intersectionRight - intersectionLeft);
  const intersectionHeight = Math.max(0, intersectionBottom - intersectionTop);
  const intersectionArea = intersectionWidth * intersectionHeight;

  const rootWidth = rootRect.right - rootRect.left;
  const rootHeight = rootRect.bottom - rootRect.top;
  const rootArea = rootWidth * rootHeight;

  return rootArea === 0 ? 0 : intersectionArea / rootArea;
}
