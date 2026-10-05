import { useState } from 'react';
import { Dialog } from '../../components/Dialog/Dialog';
import { EditMenu } from '../../components/EditMenu/EditMenu';
import { Header } from '../../components/Header/Header';
import { Modal } from '../../components/Modal/Modal';
import { Stepbar } from '../../components/Stepbar/Stepbar';
import { EDIT_STEPS, EDIT_TITLE, EXPORT_STEP, EXPORT_TITLE, PREVIEW_TITLE, TEMPLATE_CHANGE_TITLE } from '../../constants/flow';
import { TemplateSettingsFlow } from '../../features/TemplateSettingsFlow';
import { planTemplateChange, type Project, type Template } from '../../state/project';
import { PreviewContent } from './PreviewContent';
import { PostInfoStep } from './PostInfoStep';
import { RegisterBooksStep } from './RegisterBooksStep';
import { ColorStep } from './ColorStep';
import { ExportStep } from './ExportStep';
import styles from './EditScreen.module.css';

type EditScreenProps = {
  project: Project;
  template: Template;
  step: number;
  onStepChange: (step: number) => void;
  onChange: (patch: Partial<Project>) => void;
  /** 入力内容をすべて消して最初（テンプレート設定）からやり直す */
  onReset: () => void;
};

/** 編集（投稿情報 → 作品の登録 → カラー選択）と、その後の書き出し */
export function EditScreen({ project, template, step, onStepChange, onChange, onReset }: EditScreenProps) {
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  // 開くたびにテンプレート設定を最初のステップから始める（閉じるアニメーション中は中身を変えない）
  const [templateModalKey, setTemplateModalKey] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const goTo = (next: number) => {
    setMenuOpen(false);
    onStepChange(next);
    window.scrollTo(0, 0);
  };

  const openTemplateSettings = () => {
    setMenuOpen(false);
    setTemplateModalKey((k) => k + 1);
    setTemplateModalOpen(true);
  };

  const reset = () => {
    if (!window.confirm('入力した内容（テーマ・ユーザー名・登録した本・カラー）をすべて消して、最初からやり直しますか？')) return;
    setMenuOpen(false);
    onReset();
  };

  return (
    <div className={styles.screen}>
      <Header
        title={step === EXPORT_STEP ? EXPORT_TITLE : EDIT_TITLE}
        onBack={step > 0 ? () => goTo(step - 1) : undefined}
        onPreview={() => {
          setMenuOpen(false);
          setPreviewOpen(true);
        }}
        menu={{
          open: menuOpen,
          onToggle: setMenuOpen,
          content: <EditMenu onChangeTemplate={openTemplateSettings} onReset={reset} />,
        }}
      />
      <main className={styles.main}>
        {step < EXPORT_STEP && <Stepbar steps={EDIT_STEPS} current={step} width={304} gap={7} onStepClick={goTo} />}
        {step === 0 ? (
          <PostInfoStep project={project} template={template} onChange={onChange} onNext={() => goTo(1)} />
        ) : step === 1 ? (
          <RegisterBooksStep
            template={template}
            books={project.books}
            onBooksChange={(books) => onChange({ books })}
            onNext={() => goTo(2)}
          />
        ) : step === 2 ? (
          <ColorStep
            project={project}
            template={template}
            onColorChange={(color) => onChange({ color })}
            onConfirm={() => goTo(EXPORT_STEP)}
          />
        ) : (
          <ExportStep project={project} template={template} />
        )}
      </main>

      <Modal
        open={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        label={TEMPLATE_CHANGE_TITLE}
        from="right"
      >
        <TemplateSettingsFlow
          key={templateModalKey}
          change={{ current: template, onCancel: () => setTemplateModalOpen(false) }}
          onConfirm={(next) => {
            const { books, warnings } = planTemplateChange(project.books, next);
            if (warnings.length && !window.confirm(`${warnings.join('\n')}\nテンプレートを変更しますか？`)) return;
            onChange({ template: next, books });
            setTemplateModalOpen(false);
          }}
        />
      </Modal>

      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} label={PREVIEW_TITLE}>
        <PreviewContent project={project} template={template} onClose={() => setPreviewOpen(false)} />
      </Dialog>
    </div>
  );
}
