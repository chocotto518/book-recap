import type { TemplateType } from '../constants/template';

export type Template = {
  type: TemplateType;
  /** 冊数 */
  count: number;
};

/** 1 枚の画像を作るために入力する内容 */
export type Project = {
  template: Template | null;
  /** 投稿情報：テーマ（画像の上部に入る） */
  theme: string;
  /** 投稿情報：ユーザー名（画像の下部に入る） */
  userName: string;
};

export const emptyProject: Project = {
  template: null,
  theme: '',
  userName: '',
};

export const templateThumbnail = ({ type, count }: Template) =>
  `${import.meta.env.BASE_URL}images/count-${type}-${count}.png`;
