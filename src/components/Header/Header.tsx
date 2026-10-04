import { useEffect, useId, type ReactNode } from 'react';
import styles from './Header.module.css';

type HeaderProps = {
  title: string;
  /** 戻る（＜） */
  onBack?: () => void;
  /** プレビュー（目のアイコン）→ プレビューをモーダルで開く */
  onPreview?: () => void;
  /**
   * 3 点リーダーのメニュー（右端）。タップでヘッダーの下にメニューがせり出す。
   * content にメニューの中身を渡す
   */
  menu?: { open: boolean; onToggle: (open: boolean) => void; content: ReactNode };
};

/**
 * 画面上部のヘッダー。アイコンはハンドラが渡されたときだけ表示する。
 * アイコン画像は public/icons の back / preview / grid（3 点リーダー）を使う。
 */
export function Header({ title, onBack, onPreview, menu }: HeaderProps) {
  const menuId = useId();
  const menuOpen = menu?.open ?? false;

  // Esc でメニューを閉じる
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') menu?.onToggle(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen, menu]);

  return (
    <>
      {/* メニューの外をタップしたら閉じる（下の画面には操作を通さない） */}
      {menuOpen && <div className={styles.backdrop} onClick={() => menu?.onToggle(false)} aria-hidden="true" />}
      <header className={styles.header}>
        <div className={styles.bar}>
          {onBack && (
            <button type="button" className={`${styles.iconButton} ${styles.back}`} onClick={onBack} aria-label="戻る">
              <img src={`${import.meta.env.BASE_URL}icons/back.svg`} alt="" width={31} height={31} />
            </button>
          )}
          <h1 className={styles.title}>{title}</h1>
          <div className={styles.actions}>
            {onPreview && (
              <button type="button" className={styles.iconButton} onClick={onPreview} aria-label="プレビュー">
                <img src={`${import.meta.env.BASE_URL}icons/preview.svg`} alt="" width={24} height={24} />
              </button>
            )}
            {menu && (
              <button
                type="button"
                className={`${styles.iconButton} ${menuOpen ? styles.menuButtonActive : ''}`}
                onClick={() => menu.onToggle(!menuOpen)}
                aria-label="メニュー"
                aria-expanded={menuOpen}
                aria-controls={menuId}
              >
                <img src={`${import.meta.env.BASE_URL}icons/grid.svg`} alt="" width={24} height={24} />
              </button>
            )}
          </div>
        </div>
        {menu && (
          <div className={styles.menuClip}>
            <div id={menuId} className={`${styles.menu} ${menuOpen ? styles.menuOpen : ''}`} inert={!menuOpen}>
              {menu.content}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
