import { RecapPreview } from '../../components/RecapPreview/RecapPreview';
import { paletteOf } from '../../render/colors';
import type { Project, Template } from '../../state/project';
import styles from './PreviewContent.module.css';

type PreviewContentProps = {
  project: Project;
  template: Template;
};

/** プレビューの中身。書き出す画像と同じ描画で、今の入力内容を表示する */
export function PreviewContent({ project, template }: PreviewContentProps) {
  return (
    <div className={styles.content}>
      <RecapPreview
        input={{
          template,
          palette: paletteOf(project.color),
          theme: project.theme,
          userName: project.userName,
          books: project.books,
          fillEmpty: true,
        }}
      />
      <p className={styles.note}>まだ入力していない本・テーマ・ユーザー名は見本の文字で表示しています</p>
    </div>
  );
}
