import { useEffect, useState } from 'react';
import { Button } from '../../components/Button/Button';
import { SaveDoneDialog } from '../../components/SaveDoneDialog/SaveDoneDialog';
import { paletteOf } from '../../render/colors';
import { canShareFiles, createRecapPng, downloadFile, isIOS, openXIntent, shareFile } from '../../render/exportImage';
import type { Project, Template } from '../../state/project';
import styles from './ExportStep.module.css';

type ExportStepProps = {
  project: Project;
  template: Template;
  /** 保存後の「もう1枚作る」：入力内容を消して最初（テンプレート設定）から */
  onCreateAnother: () => void;
};

/**
 * 書き出し。表示している画像は、保存・共有する PNG そのもの。
 * 共有シートは「タップした瞬間」に呼ばないと開けない端末があるため、PNG は画面を開いた時点で作っておく
 */
export function ExportStep({ project, template, onCreateAnother }: ExportStepProps) {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [saved, setSaved] = useState(false);
  const key = JSON.stringify([project, template]);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;
    setFile(null);
    createRecapPng({
      template,
      palette: paletteOf(project.color),
      theme: project.theme,
      userName: project.userName,
      books: project.books,
      fillEmpty: false,
    })
      .then((png) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(png);
        setFile(png);
        setUrl(objectUrl);
      })
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
    // 入力内容が変わったときだけ作り直す（key は project・template の中身を文字列にしたもの）
  }, [key]);

  const postText = project.theme;

  // 端末に保存：Android・PC はダウンロード（Android はそのまま写真アプリの「Download」に入る）。
  // iPhone はダウンロードだと「ファイル」アプリに入ってしまうため、共有シートを開いて「画像を保存」で写真に入れてもらう
  const save = async () => {
    if (!file) return;
    if (isIOS() && canShareFiles(file)) {
      // 共有シートを閉じた（キャンセルした）ときは出さない
      if (await shareFile(file)) setSaved(true);
    } else {
      downloadFile(file);
      setSaved(true);
    }
  };

  // 共有する：共有シートを開く（X・LINE などを選べる。文章はテーマ）。共有シートがない PC は、保存してから X の投稿画面を開く
  const share = async () => {
    if (!file) return;
    if (canShareFiles(file)) {
      await shareFile(file, postText);
    } else {
      downloadFile(file);
      openXIntent(postText);
    }
  };

  return (
    <section className={styles.section} aria-label="書き出し">
      <p className={styles.question}>このデザインで保存しますか？</p>
      <div className={styles.image}>
        {url ? (
          <img src={url} alt="書き出す画像" width={1080} height={1440} />
        ) : (
          <span className={styles.loading}>{error ? '画像を作れませんでした' : '画像を作成中…'}</span>
        )}
      </div>
      <div className={styles.actions}>
        <Button onClick={() => void save()} disabled={!file}>
          端末に保存する
        </Button>
        <Button variant="secondary" onClick={() => void share()} disabled={!file}>
          共有する
        </Button>
      </div>
      <SaveDoneDialog
        open={saved}
        onClose={() => setSaved(false)}
        onCreateAnother={() => {
          setSaved(false);
          onCreateAnother();
        }}
      />
    </section>
  );
}
