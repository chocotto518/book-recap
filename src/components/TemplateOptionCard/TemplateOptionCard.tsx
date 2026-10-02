import styles from './TemplateOptionCard.module.css';

type TemplateOptionCardProps = {
  title: string;
  description: string;
  thumbnailSrc: string;
  onSelect: () => void;
};

export function TemplateOptionCard({ title, description, thumbnailSrc, onSelect }: TemplateOptionCardProps) {
  return (
    <button type="button" className={styles.card} onClick={onSelect}>
      <img className={styles.thumbnail} src={thumbnailSrc} alt="" width={86} height={114} />
      <span className={styles.text}>
        <span className={styles.title}>{title}</span>
        <span className={styles.description}>{description}</span>
      </span>
    </button>
  );
}
