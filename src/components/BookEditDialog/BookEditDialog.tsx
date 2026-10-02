import { useRef, useState } from 'react';
import { BookNumber } from '../BookNumber/BookNumber';
import { Button } from '../Button/Button';
import { Dialog } from '../Dialog/Dialog';
import { TextField } from '../TextField/TextField';
import { readCoverFile, saveCover, useCover } from '../../state/covers';
import { coverPlaceholder, type Book } from '../../state/project';
import styles from './BookEditDialog.module.css';

type BookEditDialogProps = {
  open: boolean;
  book: Book;
  index: number;
  /** 感想欄を出す（リスト型） */
  withComment: boolean;
  commentMaxLength?: number;
  onCancel: () => void;
  onSave: (book: Book) => void;
};

/** 1 冊ぶんの情報を入力するモーダル。「保存する」を押すまで一覧には反映しない */
export function BookEditDialog(props: BookEditDialogProps) {
  return (
    <Dialog open={props.open} onClose={props.onCancel} label={`${props.index + 1}冊目の本の情報`}>
      {/* 開くたびに入力中の内容を作り直す */}
      <BookEditForm key={`${props.book.id}-${String(props.open)}`} {...props} />
    </Dialog>
  );
}

function BookEditForm({ book, index, withComment, commentMaxLength, onCancel, onSave }: BookEditDialogProps) {
  const [draft, setDraft] = useState(book);
  const [loadingCover, setLoadingCover] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const cover = useCover(draft.coverId);
  const commentTooLong = withComment && commentMaxLength !== undefined && [...draft.comment].length > commentMaxLength;

  const pickCover = async (file: File | undefined) => {
    if (!file) return;
    setLoadingCover(true);
    try {
      const coverId = saveCover(await readCoverFile(file));
      setDraft((d) => ({ ...d, coverId }));
    } catch {
      alert('画像を読み込めませんでした。別の画像を選んでください。');
    } finally {
      setLoadingCover(false);
    }
  };

  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault();
        if (!commentTooLong) onSave(draft);
      }}
    >
      <div className={styles.body}>
        <span className={styles.number}>
          <BookNumber value={index + 1} />
        </span>
        <button
          type="button"
          className={styles.coverButton}
          onClick={() => fileRef.current?.click()}
          aria-label={cover ? '書影の画像を変更する' : '書影の画像を選ぶ'}
          disabled={loadingCover}
        >
          <img className={cover ? styles.coverImage : styles.coverPlaceholder} src={cover ?? coverPlaceholder} alt="" />
          {!cover && <span className={styles.coverHint}>{loadingCover ? '読み込み中…' : 'タップで画像を選択'}</span>}
        </button>
        <input
          ref={fileRef}
          className={styles.file}
          type="file"
          accept="image/*"
          tabIndex={-1}
          onChange={(e) => {
            void pickCover(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
        <TextField
          label="本のタイトル"
          value={draft.title}
          placeholder="こころ"
          onChange={(title) => setDraft((d) => ({ ...d, title }))}
        />
        <TextField
          label="作者"
          value={draft.author}
          placeholder="夏目漱石"
          onChange={(author) => setDraft((d) => ({ ...d, author }))}
        />
        {withComment && (
          <TextField
            label="感想"
            value={draft.comment}
            placeholder="おもしろかった！"
            multiline
            maxLength={commentMaxLength}
            showCount
            onChange={(comment) => setDraft((d) => ({ ...d, comment }))}
          />
        )}
      </div>
      <div className={styles.actions}>
        <Button variant="outline" size="M" onClick={onCancel}>
          キャンセル
        </Button>
        <Button type="submit" size="M" disabled={commentTooLong || loadingCover}>
          保存する
        </Button>
      </div>
    </form>
  );
}
