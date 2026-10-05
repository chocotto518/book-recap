/** 開いているモーダル・ポップアップの重なり順。Esc は一番上のものだけを閉じる */
const stack: symbol[] = [];

export function pushOverlay(): { isTop: () => boolean; remove: () => void } {
  const id = Symbol('overlay');
  stack.push(id);
  return {
    isTop: () => stack[stack.length - 1] === id,
    remove: () => {
      const i = stack.indexOf(id);
      if (i >= 0) stack.splice(i, 1);
    },
  };
}
