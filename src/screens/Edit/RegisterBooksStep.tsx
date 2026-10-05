import { useState } from 'react';
import { BookEditDialog } from '../../components/BookEditDialog/BookEditDialog';
import { BookSlot } from '../../components/BookSlot/BookSlot';
import { Button } from '../../components/Button/Button';
import { COMMENT_MAX_LENGTH } from '../../constants/template';
import { useLongPressReorder } from '../../hooks/useLongPressReorder';
import type { Book, Template } from '../../state/project';
import styles from './RegisterBooksStep.module.css';

type RegisterBooksStepProps = {
  template: Template;
  books: Book[];
  onBooksChange: (books: Book[]) => void;
  onNext: () => void;
};

/** グリッド型で 3 列に並べる冊数。それ以外（4・2・1 冊）は 2 列の幅で並べる */
const GRID_THREE_COLUMNS = [6, 5, 3];

/** 編集 step2：作品の登録。テンプレートの形（リスト型／グリッド型）に合わせて枠を並べる */
export function RegisterBooksStep({ template, books, onBooksChange, onNext }: RegisterBooksStepProps) {
  const [editing, setEditing] = useState<number | null>(null);
  // 閉じるアニメーション中も中身を出しておくため、最後に開いた枠を覚えておく
  const [lastEditing, setLastEditing] = useState(0);
  const { itemProps } = useLongPressReorder(books, onBooksChange);
  const isList = template.type === 'list';

  const open = (index: number) => {
    setEditing(index);
    setLastEditing(index);
  };

  return (
    <>
      <section className={`${styles.section} ${isList ? styles.sectionList : styles.sectionGrid}`} aria-label="作品の登録">
        <p className={styles.hint}>
          タップで変更
          <br />
          長押しで並べ替え
        </p>
        <div className={isList ? styles.list : GRID_THREE_COLUMNS.includes(template.count) ? styles.grid3 : styles.grid2}>
          {books.map((book, index) => (
            <BookSlot
              key={book.id}
              book={book}
              index={index}
              variant={template.type}
              onOpen={() => open(index)}
              {...itemProps(book.id, index)}
            />
          ))}
        </div>
      </section>

      <div className={styles.actions}>
        <Button onClick={onNext}>カラー選択へ進む</Button>
      </div>

      {books[lastEditing] && (
        <BookEditDialog
          open={editing !== null}
          book={books[lastEditing]}
          index={lastEditing}
          withComment={isList}
          commentMaxLength={COMMENT_MAX_LENGTH[template.count]}
          onCancel={() => setEditing(null)}
          onSave={(saved) => {
            onBooksChange(books.map((b) => (b.id === saved.id ? saved : b)));
            setEditing(null);
          }}
        />
      )}
    </>
  );
}
