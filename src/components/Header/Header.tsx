import styles from './Header.module.css';

type HeaderProps = {
  title: string;
  /** 戻る（＜） */
  onBack?: () => void;
  /** テンプレート変更（グリッドアイコン）→ デザイン選択へ直接ジャンプ */
  onChangeTemplate?: () => void;
  /** プレビュー（目のアイコン） */
  onPreview?: () => void;
};

/**
 * 画面上部のヘッダー。アイコンはハンドラが渡されたときだけ表示する。
 * アイコン画像は Figma の icon/back, icon/grid, icon/preview を public/icons に書き出して使う。
 */
export function Header({ title, onBack, onChangeTemplate, onPreview }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.bar}>
        {onBack && (
          <button type="button" className={`${styles.iconButton} ${styles.back}`} onClick={onBack} aria-label="戻る">
            <img src="/icons/back.svg" alt="" width={31} height={31} />
          </button>
        )}
        <h1 className={styles.title}>{title}</h1>
        <div className={styles.actions}>
          {onChangeTemplate && (
            <button type="button" className={styles.iconButton} onClick={onChangeTemplate} aria-label="テンプレート変更">
              <img src="/icons/grid.svg" alt="" width={24} height={24} />
            </button>
          )}
          {onPreview && (
            <button type="button" className={styles.iconButton} onClick={onPreview} aria-label="プレビュー">
              <img src="/icons/preview.svg" alt="" width={24} height={24} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
