import styles from './TemplateOptionCard.module.css';

type TemplateOptionCardProps = {
  title: string;
  description: string;
  thumbnailSrc: string;
  onSelect: () => void;
  /** 選択中（茶色の枠線、影なし） */
  active?: boolean;
};

export function TemplateOptionCard({ title, description, thumbnailSrc, onSelect, active }: TemplateOptionCardProps) {
  return (
    <button
      type="button"
      className={`${styles.card} ${active ? styles.active : ''}`}
      onClick={onSelect}
      aria-pressed={active === undefined ? undefined : active}
    >
      <img className={styles.thumbnail} src={thumbnailSrc} alt="" width={86} height={114} />
      <span className={styles.text}>
        <span className={styles.title}>{title}</span>
        <span className={styles.description}>{description}</span>
      </span>
    </button>
  );
}
