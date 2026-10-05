import { useEffect, useState } from 'react';
import { Button } from '../../components/Button/Button';
import { Toast } from '../../components/Toast/Toast';
import { paletteOf } from '../../render/colors';
import { canShareImage, createRecapPng, downloadFile, openXIntent, shareFile } from '../../render/exportImage';
import type { Project, Template } from '../../state/project';
import styles from './ExportStep.module.css';

type ExportStepProps = {
  project: Project;
  template: Template;
};

/**
 * 書き出し。表示している画像は、保存・共有する PNG そのもの。
 * 共有シートは「タップした瞬間」に呼ばないと開けない端末があるため、PNG は画面を開いた時点で作っておく
 */
export function ExportStep({ project, template }: ExportStepProps) {
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

  const save = async () => {
    if (!file) return;
    if (canShareImage(file)) {
      // 共有シートを閉じた（キャンセルした）ときは出さない
      if (await shareFile(file)) setSaved(true);
    } else {
      downloadFile(file);
      setSaved(true);
    }
  };

  const shareToX = async () => {
    if (!file) return;
    if (canShareImage(file)) {
      // スマホ：共有シートで X アプリを選ぶと画像付きで投稿できる
      await shareFile(file, postText);
    } else {
      // PC：X の投稿画面には画像を添付できないため、先に保存してから投稿画面を開く
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
          端末に保存
        </Button>
        <Button variant="secondary" onClick={() => void shareToX()} disabled={!file}>
          Xで共有
        </Button>
      </div>
      <Toast message={saved ? '端末に保存しました' : null} onHide={() => setSaved(false)} />
    </section>
  );
}
