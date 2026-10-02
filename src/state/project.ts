import type { TemplateType } from '../constants/template';
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
