import { useEffect, useRef, useState } from 'react';
import { BookNumber } from '../BookNumber/BookNumber';
import { BookSearch } from '../BookSearch/BookSearch';
import { Button } from '../Button/Button';
import { ConfirmDialog } from '../ConfirmDialog/ConfirmDialog';
import { CoverCropDialog } from '../CoverCropDialog/CoverCropDialog';
import { Dialog } from '../Dialog/Dialog';
import { TextField } from '../TextField/TextField';
import { cropToDataUrl, loadImageBlob, saveCover, useCover, type CropRect } from '../../state/covers';
import { bookSearchAvailable } from '../../lib/bookSearch';
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

const COVER_UNREADABLE = '画像を読み込めませんでした。\n別の画像を選んでください。';
const NO_IMAGE_IN_CLIPBOARD = '画像がコピーされていません。\n画像をコピーしてから貼り付けてください。';

/** コピーしてある画像をボタンから読み取れるブラウザか */
const canPasteImage = () => typeof navigator !== 'undefined' && typeof navigator.clipboard?.read === 'function';

/** カメラで撮れる端末か（指で操作する端末。PC では「選ぶ」と同じになるので出さない） */
const canTakePhoto = () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

const icon = (name: string) => `${import.meta.env.BASE_URL}icons/${name}.svg`;

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
  /** 書影を入れられなかったときに出すお知らせ（null なら出さない） */
  const [coverError, setCoverError] = useState<string | null>(null);
  /** 切り抜き中の画像（撮った・選んだ・貼り付けた画像は、切り抜いてから書影にする） */
  const [cropImage, setCropImage] = useState<HTMLImageElement | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const cover = useCover(draft.coverId);
  const commentTooLong = withComment && commentMaxLength !== undefined && [...draft.comment].length > commentMaxLength;

  const pickCover = async (file: Blob | undefined) => {
    if (!file) return;
    setLoadingCover(true);
    try {
      setCropImage(await loadImageBlob(file));
    } catch {
      setCoverError(COVER_UNREADABLE);
    } finally {
      setLoadingCover(false);
    }
  };

  const closeCrop = () => {
    if (cropImage) URL.revokeObjectURL(cropImage.src);
    setCropImage(null);
  };

  const confirmCrop = (rect: CropRect) => {
    if (!cropImage) return;
    try {
      const coverId = saveCover(cropToDataUrl(cropImage, rect));
      setDraft((d) => ({ ...d, coverId }));
    } catch {
      setCoverError(COVER_UNREADABLE);
    }
    closeCrop();
  };

  // PC：モーダルを開いている間は Ctrl+V / ⌘V で画像を貼り付けられる（画像のときだけ受け取り、文字の貼り付けは邪魔しない）
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const image = [...(e.clipboardData?.files ?? [])].find((f) => f.type.startsWith('image/'));
      if (!image || cropImage) return;
      e.preventDefault();
      void pickCover(image);
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  });

  // スマホ：「画像を貼り付け」ボタンで、コピーしてある画像を読み取る（iPhone は Safari の「ペースト」の確認をはさむ）
  const pasteCover = async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const type = item.types.find((t) => t.startsWith('image/'));
        if (type) return void (await pickCover(await item.getType(type)));
      }
      setCoverError(NO_IMAGE_IN_CLIPBOARD);
    } catch (e) {
      // 「ペースト」の確認を閉じた・許可しなかったときは何もしない
      if (e instanceof DOMException && e.name === 'NotAllowedError') return;
      setCoverError(NO_IMAGE_IN_CLIPBOARD);
    }
  };

  return (
    <>
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
            <img
              className={cover ? styles.coverImage : styles.coverPlaceholder}
              src={cover ?? coverPlaceholder}
              alt=""
            />
            {loadingCover && <span className={styles.coverHint}>読み込み中…</span>}
          </button>
          <div className={styles.coverActions}>
            {canTakePhoto() && (
              <button
                type="button"
                className={styles.coverAction}
                onClick={() => cameraRef.current?.click()}
                disabled={loadingCover}
              >
                <span
                  className={styles.coverActionIcon}
                  style={{ maskImage: `url(${icon('camera')})`, WebkitMaskImage: `url(${icon('camera')})` }}
                />
                撮る
              </button>
            )}
            <button
              type="button"
              className={styles.coverAction}
              onClick={() => fileRef.current?.click()}
              disabled={loadingCover}
            >
              <span
                className={styles.coverActionIcon}
                style={{ maskImage: `url(${icon('image')})`, WebkitMaskImage: `url(${icon('image')})` }}
              />
              選ぶ
            </button>
            {canPasteImage() && (
              <button
                type="button"
                className={styles.coverAction}
                onClick={() => void pasteCover()}
                disabled={loadingCover}
              >
                <span
                  className={styles.coverActionIcon}
                  style={{
                    maskImage: `url(${icon('clipboard-paste')})`,
                    WebkitMaskImage: `url(${icon('clipboard-paste')})`,
                  }}
                />
                貼り付け
              </button>
            )}
          </div>
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
          <input
            ref={cameraRef}
            className={styles.file}
            type="file"
            accept="image/*"
            capture="environment"
            tabIndex={-1}
            onChange={(e) => {
              void pickCover(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
          {bookSearchAvailable() && (
            <BookSearch onSelect={({ title, author }) => setDraft((d) => ({ ...d, title, author }))} />
          )}
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
      <CoverCropDialog image={cropImage} onCancel={closeCrop} onConfirm={confirmCrop} />
      <ConfirmDialog
        open={coverError !== null}
        message={coverError ?? ''}
        confirmLabel="閉じる"
        onConfirm={() => setCoverError(null)}
      />
    </>
  );
}
