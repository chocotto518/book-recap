import { useState } from 'react';
import { Button } from '../../components/Button/Button';
import { Header } from '../../components/Header/Header';
import { Stepbar } from '../../components/Stepbar/Stepbar';
import { TemplateOptionCard } from '../../components/TemplateOptionCard/TemplateOptionCard';
import { TEMPLATE_CHANGE_TITLE, TEMPLATE_SETTINGS_STEPS, TEMPLATE_SETTINGS_TITLE } from '../../constants/flow';
import { MAX_BOOKS } from '../../constants/template';
import styles from './CommentChoiceScreen.module.css';

/** 編集画面の「テンプレート変更」から開いたときの設定 */
export type TemplateChangeMode = {
  /** 「現在の設定：感想を書く／4冊」 */
  currentLabel: string;
  /** 今の設定（感想あり＝true）。最初はこれが選ばれた状態 */
  currentHasComment: boolean;
  /** 「編集に戻る」 */
  onCancel: () => void;
};

type CommentChoiceScreenProps = {
  /**
   * 選んだとき。最初の流れではカードのタップですぐ進む。
   * テンプレート変更ではカードのタップは選択だけで、「作品数の選択へ進む」で進む
   */
  onSelect: (hasComment: boolean) => void;
  /** 渡したときだけヘッダーに「＜」を出す */
  onBack?: () => void;
  change?: TemplateChangeMode;
  /** テンプレート変更で、作品数の選択から戻ってきたときの選択 */
  initialHasComment?: boolean;
};

/** テンプレート設定 step1：感想の有無 */
export function CommentChoiceScreen({ onSelect, onBack, change, initialHasComment }: CommentChoiceScreenProps) {
  const [selected, setSelected] = useState(initialHasComment ?? change?.currentHasComment ?? true);
  const choose = (hasComment: boolean) => (change ? setSelected(hasComment) : onSelect(hasComment));

  return (
    <div className={styles.screen}>
      <Header title={change ? TEMPLATE_CHANGE_TITLE : TEMPLATE_SETTINGS_TITLE} onBack={onBack} />
      <main className={`${styles.main} ${change ? styles.mainChange : ''}`}>
        {change && <p className={styles.current}>{change.currentLabel}</p>}
        <Stepbar steps={TEMPLATE_SETTINGS_STEPS} current={0} />
        <section className={styles.content} aria-labelledby="comment-choice-heading">
          <div className={styles.heading}>
            <h2 id="comment-choice-heading" className={styles.question}>
              感想を書きますか？
            </h2>
            <p className={styles.hint}>タップで選択</p>
          </div>
          <div className={styles.options}>
            <TemplateOptionCard
              title="感想を書く"
              description={`1枚につき最大${MAX_BOOKS.list}冊`}
              thumbnailSrc={`${import.meta.env.BASE_URL}images/template-list.png`}
              active={change ? selected : undefined}
              onSelect={() => choose(true)}
            />
            <TemplateOptionCard
              title="感想を書かない"
              description={`1枚につき最大${MAX_BOOKS.grid}冊`}
              thumbnailSrc={`${import.meta.env.BASE_URL}images/template-grid.png`}
              active={change ? !selected : undefined}
              onSelect={() => choose(false)}
            />
          </div>
        </section>
        {change && (
          <div className={styles.actions}>
            <Button onClick={() => onSelect(selected)}>作品数の選択へ進む</Button>
            <Button variant="text" onClick={change.onCancel}>
              編集に戻る
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
