import { Header } from '../../components/Header/Header';
import { DESIGN_SELECT_TITLE } from '../../constants/flow';
import type { TemplateType } from '../../constants/template';
import styles from './DesignSelectScreen.module.css';

type DesignSelectScreenProps = {
  templateType: TemplateType;
  bookCount: number;
  onBack: () => void;
};

/** デザイン選択（デザイン未受領のため仮実装） */
export function DesignSelectScreen({ templateType, bookCount, onBack }: DesignSelectScreenProps) {
  return (
    <div className={styles.screen}>
      <Header title={DESIGN_SELECT_TITLE} onBack={onBack} />
      <main className={styles.main}>
        <p className={styles.placeholder}>
          {templateType === 'list' ? '感想あり' : '感想なし'}・{bookCount}冊
          <br />
          この画面は Figma のデザイン待ちです
        </p>
      </main>
    </div>
  );
}
