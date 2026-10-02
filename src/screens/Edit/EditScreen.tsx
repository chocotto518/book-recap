import { useState } from 'react';
import { Button } from '../../components/Button/Button';
import { Header } from '../../components/Header/Header';
import { Modal } from '../../components/Modal/Modal';
import { Stepbar } from '../../components/Stepbar/Stepbar';
import { EDIT_STEPS, EDIT_TITLE, PREVIEW_TITLE, TEMPLATE_SETTINGS_TITLE } from '../../constants/flow';
import { TemplateSettingsFlow } from '../../features/TemplateSettingsFlow';
import { fitBooks, isBookFilled, type Project, type Template } from '../../state/project';
import { PreviewContent } from './PreviewContent';
import { PostInfoStep } from './PostInfoStep';
import { RegisterBooksStep } from './RegisterBooksStep';
import styles from './EditScreen.module.css';

type EditScreenProps = {
  project: Project;
  template: Template;
  step: number;
  onStepChange: (step: number) => void;
  onChange: (patch: Partial<Project>) => void;
};

/** 編集（投稿情報 → 本の登録 → カラー選択） */
export function EditScreen({ project, template, step, onStepChange, onChange }: EditScreenProps) {
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  // 開くたびにテンプレート設定を最初のステップから始める（閉じるアニメーション中は中身を変えない）
  const [templateModalKey, setTemplateModalKey] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);

  const goTo = (next: number) => {
    onStepChange(next);
    window.scrollTo(0, 0);
  };

  return (
    <div className={styles.screen}>
      <Header
        title={EDIT_TITLE}
        onBack={step > 0 ? () => goTo(step - 1) : undefined}
        onChangeTemplate={() => {
          setTemplateModalKey((k) => k + 1);
          setTemplateModalOpen(true);
        }}
        onPreview={() => setPreviewOpen(true)}
      />
      <main className={styles.main}>
        <Stepbar steps={EDIT_STEPS} current={step} lineWidth={60} gap={7} />
        {step === 0 ? (
          <PostInfoStep project={project} template={template} onChange={onChange} onNext={() => goTo(1)} />
        ) : step === 1 ? (
          <RegisterBooksStep
            template={template}
            books={project.books}
            onBooksChange={(books) => onChange({ books })}
            onNext={() => goTo(2)}
          />
        ) : (
          <div className={styles.placeholder}>
            <p>{EDIT_STEPS[step]}の画面は Figma のデザイン待ちです</p>
            <Button variant="text" onClick={() => goTo(step - 1)}>
              {EDIT_STEPS[step - 1]}に戻る
            </Button>
          </div>
        )}
      </main>

      <Modal open={templateModalOpen} onClose={() => setTemplateModalOpen(false)} label={TEMPLATE_SETTINGS_TITLE}>
        <TemplateSettingsFlow
          key={templateModalKey}
          confirmLabel="このテンプレートに変更"
          onExit={() => setTemplateModalOpen(false)}
          onConfirm={(next) => {
            const removed = project.books.slice(next.count).filter(isBookFilled).length;
            if (
              removed > 0 &&
              !window.confirm(`${next.count + 1}冊目以降に登録した本（${removed}冊）は削除されます。テンプレートを変更しますか？`)
            ) {
              return;
            }
            onChange({ template: next, books: fitBooks(project.books, next.count) });
            setTemplateModalOpen(false);
          }}
        />
      </Modal>

      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)} label={PREVIEW_TITLE}>
        <Header title={PREVIEW_TITLE} onBack={() => setPreviewOpen(false)} />
        <PreviewContent template={template} />
      </Modal>
    </div>
  );
}
