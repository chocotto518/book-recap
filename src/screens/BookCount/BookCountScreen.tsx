import { Header } from '../../components/Header/Header';
import { Stepbar } from '../../components/Stepbar/Stepbar';
import { TEMPLATE_SETTINGS_STEPS, TEMPLATE_SETTINGS_TITLE } from '../../constants/flow';
import { MAX_BOOKS, type TemplateType } from '../../constants/template';
import styles from './BookCountScreen.module.css';

type BookCountScreenProps = {
  templateType: TemplateType;
  onBack: () => void;
};

/** テンプレート設定 step2：作品数の選択（デザイン未受領のため仮実装） */
export function BookCountScreen({ templateType, onBack }: BookCountScreenProps) {
  return (
    <div className={styles.screen}>
      <Header title={TEMPLATE_SETTINGS_TITLE} />
      <main className={styles.main}>
        <Stepbar steps={TEMPLATE_SETTINGS_STEPS} current={1} />
        <p className={styles.placeholder}>
          作品数の選択（1〜{MAX_BOOKS[templateType]}冊）
          <br />
          この画面は Figma のデザイン待ちです
        </p>
        <button type="button" className={styles.back} onClick={onBack}>
          感想の有無に戻る
        </button>
      </main>
    </div>
  );
}
