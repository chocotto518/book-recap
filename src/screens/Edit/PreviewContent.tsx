import { OUTPUT_HEIGHT, OUTPUT_WIDTH } from '../../constants/template';
import { templateThumbnail, type Template } from '../../state/project';
import styles from './PreviewContent.module.css';

type PreviewContentProps = {
  template: Template;
};

/**
 * プレビューの中身。
 * 書き出し用の描画（1080×1440）ができるまでは、選んでいるテンプレートの見本を表示する。
 */
export function PreviewContent({ template }: PreviewContentProps) {
  return (
    <div className={styles.content}>
      <img
        className={styles.image}
        src={templateThumbnail(template)}
        alt="選択中のテンプレートの見本"
        width={OUTPUT_WIDTH}
        height={OUTPUT_HEIGHT}
      />
      <p className={styles.note}>本の登録ができるようになると、ここに実際の画像が表示されます</p>
    </div>
  );
}
