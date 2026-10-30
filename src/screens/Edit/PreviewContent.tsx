import { useState } from 'react';
import { Button } from '../../components/Button/Button';
import { ImageViewer } from '../../components/ImageViewer/ImageViewer';
import { RecapPreview } from '../../components/RecapPreview/RecapPreview';
import { PREVIEW_TITLE } from '../../constants/flow';
import { paletteOf } from '../../render/colors';
import type { Project, Template } from '../../state/project';
import styles from './PreviewContent.module.css';

type PreviewContentProps = {
  project: Project;
  template: Template;
  onClose: () => void;
};

/**
 * プレビューのポップアップの中身（作品の登録の入力モーダルと同じ形）。
 * 書き出す画像と同じ描画で、今の入力内容を表示する。まだ入力していない本などは書き出しと同じく空白。
 * 画像をタップすると全画面で大きく見られる
 */
export function PreviewContent({ project, template, onClose }: PreviewContentProps) {
  const [fullscreen, setFullscreen] = useState(false);
  const input = {
    template,
    palette: paletteOf(project.color),
    theme: project.theme,
    userName: project.userName,
    books: project.books,
    fillEmpty: false,
  };
  return (
    <div className={styles.content}>
      <h2 className={styles.title}>{PREVIEW_TITLE}</h2>
      <button type="button" className={styles.image} aria-label="画像を全画面で見る" onClick={() => setFullscreen(true)}>
        <RecapPreview input={input} />
      </button>
      <ImageViewer open={fullscreen} onClose={() => setFullscreen(false)}>
        <RecapPreview input={input} />
      </ImageViewer>
      <Button size="M" className={styles.close} onClick={onClose}>
        閉じる
      </Button>
    </div>
  );
}
