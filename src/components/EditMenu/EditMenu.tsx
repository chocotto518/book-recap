import styles from './EditMenu.module.css';

type EditMenuProps = {
  onChangeTemplate: () => void;
  onReset: () => void;
};

/** 編集画面の 3 点リーダーのメニュー：テンプレート変更・リセット */
export function EditMenu({ onChangeTemplate, onReset }: EditMenuProps) {
  return (
    <div className={styles.menu}>
      <button type="button" className={styles.edit} onClick={onChangeTemplate}>
        <span className={styles.label}>テンプレート変更</span>
        <img src={`${import.meta.env.BASE_URL}icons/open.svg`} alt="" width={20} height={20} />
      </button>
      <button type="button" className={styles.reset} onClick={onReset}>
        リセット
      </button>
    </div>
  );
}
