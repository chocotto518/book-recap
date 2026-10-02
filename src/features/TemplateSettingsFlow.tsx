import { useLayoutEffect, useRef, useState } from 'react';
import { templateTypeFromComment, type TemplateType } from '../constants/template';
import { getScroller } from '../lib/scroller';
import { BookCountScreen } from '../screens/BookCount/BookCountScreen';
import { CommentChoiceScreen } from '../screens/CommentChoice/CommentChoiceScreen';
import type { Template } from '../state/project';

type TemplateSettingsFlowProps = {
  onConfirm: (template: Template) => void;
  /** 最初のステップで「＜」を押したとき。渡さなければ「＜」を出さない */
  onExit?: () => void;
  confirmLabel?: string;
};

/** テンプレート設定（感想の有無 → 作品数の選択）。最初の流れと、編集画面のモーダルの両方で使う */
export function TemplateSettingsFlow({ onConfirm, onExit, confirmLabel }: TemplateSettingsFlowProps) {
  const [type, setType] = useState<TemplateType | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // ステップが変わったら先頭から見せる
  useLayoutEffect(() => {
    getScroller(rootRef.current).scrollTop = 0;
  }, [type]);

  return (
    <div ref={rootRef}>
      {type === null ? (
        <CommentChoiceScreen onSelect={(hasComment) => setType(templateTypeFromComment(hasComment))} onBack={onExit} />
      ) : (
        <BookCountScreen
          templateType={type}
          onBack={() => setType(null)}
          onConfirm={(count) => onConfirm({ type, count })}
          confirmLabel={confirmLabel}
        />
      )}
    </div>
  );
}
