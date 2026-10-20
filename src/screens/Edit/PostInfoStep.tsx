import { Button } from '../../components/Button/Button';
import { TextField } from '../../components/TextField/TextField';
import type { Project, Template } from '../../state/project';
import styles from './PostInfoStep.module.css';

type PostInfoStepProps = {
  project: Project;
  template: Template;
  onChange: (patch: Partial<Project>) => void;
  onNext: () => void;
};

/** 説明図の見本画像（テンプレートごと）。どの見本もテーマ・ユーザー名の位置は同じなので、指す線は共通 */
const postInfoSample = ({ type, count }: Template) => `${import.meta.env.BASE_URL}images/post-info-${type}-${count}.png`;

/** 編集 step1：投稿情報（テーマ・ユーザー名） */
export function PostInfoStep({ project, template, onChange, onNext }: PostInfoStepProps) {
  // テーマかユーザー名のどちらかを入力したら進める（入力しない場合は「スキップ」）
  const canProceed = Boolean(project.theme.trim() || project.userName.trim());

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

      {/* テーマとユーザー名が画像のどこに入るかの説明図（見本画像 195×260 と、テーマ・ユーザー名を指す線） */}
      <figure className={styles.diagram} aria-label="テーマは画像の上部、ユーザー名は画像の下部に入ります">
        <img
          className={styles.thumbnail}
          src={postInfoSample(template)}
          alt=""
          width={195}
          height={260}
        />
        <svg className={styles.lines} viewBox="0 0 335 260" aria-hidden="true">
          <line x1="138" y1="11" x2="243" y2="29" />
          <line x1="118" y1="249" x2="223" y2="232" />
        </svg>
        <span className={`${styles.note} ${styles.noteTheme}`}>テーマ</span>
        <span className={`${styles.note} ${styles.noteUser}`}>ユーザー名</span>
      </figure>

      <div className={styles.actions}>
        <Button onClick={onNext} disabled={!canProceed}>
          作品の登録へ進む
        </Button>
        <Button variant="text" onClick={onNext}>
          スキップ
        </Button>
      </div>
    </>
  );
}
