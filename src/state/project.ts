import { COMMENT_MAX_LENGTH, type TemplateType } from '../constants/template';
import type { ColorId } from '../render/colors';

export type Template = {
  type: TemplateType;
  /** 冊数 */
  count: number;
};

/** 登録した 1 冊ぶんの情報 */
export type Book = {
  id: string;
  title: string;
  author: string;
  /** 感想（リスト型のときだけ使う） */
  comment: string;
  /** 書影。画像本体は covers.ts に別に保存し、ここには ID だけ持つ */
  coverId: string | null;
};

/** 1 枚の画像を作るために入力する内容 */
export type Project = {
  template: Template | null;
  /** 投稿情報：テーマ（画像の上部に入る） */
  theme: string;
  /** 投稿情報：ユーザー名（画像の下部に入る） */
  userName: string;
  /** テンプレートの冊数ぶん並ぶ。未登録の枠は空の Book */
  books: Book[];
  /** カラー選択で選んだ色 */
  color: ColorId;
};

export const emptyProject: Project = {
  template: null,
  theme: '',
  userName: '',
  books: [],
  color: 'default',
};

export const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

export const emptyBook = (): Book => ({ id: newId(), title: '', author: '', comment: '', coverId: null });

export const isBookFilled = (book: Book) => Boolean(book.title || book.author || book.comment || book.coverId);

/** 冊数に合わせて枠を増減する。減らすときは後ろの枠から消える */
export const fitBooks = (books: Book[] | undefined, count: number): Book[] => {
  const list = (books ?? []).slice(0, count);
  while (list.length < count) list.push(emptyBook());
  return list;
};

export const templateThumbnail = ({ type, count }: Template) =>
  `${import.meta.env.BASE_URL}images/count-${type}-${count}.png`;

export const coverPlaceholder = `${import.meta.env.BASE_URL}images/cover-placeholder.png`;

/**
 * テンプレートを変えたときに本の情報がどう変わるかを調べる。
 * - 冊数が減る：後ろの枠の本が消える
 * - 感想なしにする：感想が消える
 * - 感想ありのまま冊数が増える：感想の上限文字数が減り、超えた分が消える
 */
export function planTemplateChange(books: Book[], next: Template) {
  const kept = fitBooks(books, next.count);
  const removedBooks = books.slice(next.count).filter(isBookFilled).length;
  const limit = COMMENT_MAX_LENGTH[next.count] ?? Infinity;
  let clearedComments = 0;
  let truncatedComments = 0;
  const nextBooks = kept.map((book) => {
    if (!book.comment) return book;
    if (next.type === 'grid') {
      clearedComments++;
      return { ...book, comment: '' };
    }
    const chars = [...book.comment];
    if (chars.length <= limit) return book;
    truncatedComments++;
    return { ...book, comment: chars.slice(0, limit).join('') };
  });
  const warnings: string[] = [];
  // 本の削除と感想の切り詰めは同時に起きない（冊数が減ると感想の上限は増える）
  if (removedBooks && clearedComments) warnings.push(`${next.count + 1}冊目以降の本と登録した感想は削除されます。`);
  else if (removedBooks) warnings.push(`${next.count + 1}冊目以降の本は削除されます。`);
  else if (clearedComments) warnings.push('登録した感想は削除されます。');
  if (truncatedComments) warnings.push(`感想の${limit}字を超えた部分は削除されます。`);
  return { books: nextBooks, warnings };
}
