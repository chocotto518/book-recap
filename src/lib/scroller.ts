/**
 * 要素を含むスクロール領域を返す。モーダルの中なら data-scroll-container の要素、それ以外はページ全体。
 */
export function getScroller(el: Element | null): Element {
  return el?.closest('[data-scroll-container]') ?? document.scrollingElement ?? document.documentElement;
}
