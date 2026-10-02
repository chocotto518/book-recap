import { Button } from '../../components/Button/Button';
import { TextField } from '../../components/TextField/TextField';
import { templateThumbnail, type Project, type Template } from '../../state/project';
import styles from './PostInfoStep.module.css';

type PostInfoStepProps = {
  project: Project;
  template: Template;
  onChange: (patch: Partial<Project>) => void;
  onNext: () => void;
};

/** 編集 step1：投稿情報（テーマ・ユーザー名） */
export function PostInfoStep({ project, template, onChange, onNext }: PostInfoStepProps) {
  return (
    <>
      <div className={styles.form}>
        <TextField
          label="テーマ"
          value={project.theme}
          placeholder="心にグッと来た恋愛小説４選"
          onChange={(theme) => onChange({ theme })}
        />
        <TextField
          label="ユーザー名"
          value={project.userName}
          placeholder="@123_456"
          onChange={(userName) => onChange({ userName })}
        />
      </div>

      {/* テーマとユーザー名が画像のどこに入るかの説明図（Figma の配置をそのまま使う） */}
      <figure className={styles.diagram} aria-label="テーマは画像の上部、ユーザー名は画像の下部に入ります">
        <img className={styles.thumbnail} src={templateThumbnail(template)} alt="" width={1080} height={1440} />
        <span className={`${styles.line} ${styles.lineTheme}`} aria-hidden="true">
          <img src={`${import.meta.env.BASE_URL}icons/annotation-line-theme.svg`} alt="" width={107.355} height={1} />
        </span>
        <span className={`${styles.note} ${styles.noteTheme}`}>テーマ</span>
        <span className={`${styles.line} ${styles.lineUser}`} aria-hidden="true">
          <img src={`${import.meta.env.BASE_URL}icons/annotation-line-user.svg`} alt="" width={116.726} height={1} />
        </span>
        <span className={`${styles.note} ${styles.noteUser}`}>ユーザー名</span>
      </figure>

      <div className={styles.actions}>
        <Button onClick={onNext}>作品の登録へ進む</Button>
        <Button variant="text" onClick={onNext}>
          スキップ
        </Button>
      </div>
    </>
  );
}
