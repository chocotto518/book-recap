import { Header } from '../../components/Header/Header';
import { Stepbar } from '../../components/Stepbar/Stepbar';
import { TemplateOptionCard } from '../../components/TemplateOptionCard/TemplateOptionCard';
import { TEMPLATE_SETTINGS_STEPS, TEMPLATE_SETTINGS_TITLE } from '../../constants/flow';
import { MAX_BOOKS } from '../../constants/template';
import styles from './CommentChoiceScreen.module.css';

type CommentChoiceScreenProps = {
  onSelect: (hasComment: boolean) => void;
  /** 渡したときだけヘッダーに「＜」を出す（モーダルで開いたときに閉じる用） */
  onBack?: () => void;
};

/** テンプレート設定 step1：感想の有無 */
export function CommentChoiceScreen({ onSelect, onBack }: CommentChoiceScreenProps) {
  return (
    <div className={styles.screen}>
      <Header title={TEMPLATE_SETTINGS_TITLE} onBack={onBack} />
      <main className={styles.main}>
        <Stepbar steps={TEMPLATE_SETTINGS_STEPS} current={0} />
        <section className={styles.content} aria-labelledby="comment-choice-heading">
          <div className={styles.heading}>
            <h2 id="comment-choice-heading" className={styles.question}>
              あなたの感想を書きますか？
            </h2>
            <p className={styles.hint}>タップで選択</p>
          </div>
          <div className={styles.options}>
            <TemplateOptionCard
              title="感想を書く"
              description={`1枚につき最大${MAX_BOOKS.list}冊`}
              thumbnailSrc={`${import.meta.env.BASE_URL}images/template-list.png`}
              onSelect={() => onSelect(true)}
            />
            <TemplateOptionCard
              title="感想を書かない"
              description={`1枚につき最大${MAX_BOOKS.grid}冊`}
              thumbnailSrc={`${import.meta.env.BASE_URL}images/template-grid.png`}
              onSelect={() => onSelect(false)}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
