import { useLayoutEffect, useRef, useState } from 'react';
import { templateTypeFromComment, type TemplateType } from '../constants/template';
import { getScroller } from '../lib/scroller';
import { BookCountScreen } from '../screens/BookCount/BookCountScreen';
import { CommentChoiceScreen } from '../screens/CommentChoice/CommentChoiceScreen';
import type { Template } from '../state/project';

type TemplateSettingsFlowProps = {
  onConfirm: (template: Template) => void;
  /**
   * 編集画面の「テンプレート変更」から開くときに渡す。
   * 「現在の設定」を表示し、感想の有無はカードで選んでから「作品数の選択へ進む」で進む
   */
  change?: { current: Template; onCancel: () => void };
};

export const templateLabel = ({ type, count }: Template) => `${type === 'list' ? '感想を書く' : '感想を書かない'}／${count}冊`;

/** テンプレート設定（感想の有無 → 作品数の選択）。最初の流れと、編集画面のテンプレート変更の両方で使う */
export function TemplateSettingsFlow({ onConfirm, change }: TemplateSettingsFlowProps) {
  const [type, setType] = useState<TemplateType | null>(null);
  // 作品数の選択から戻ったとき、さっき選んだ感想の有無を選んだ状態にする
  const [lastType, setLastType] = useState<TemplateType | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const currentLabel = change ? `現在の設定：${templateLabel(change.current)}` : undefined;

  // ステップが変わったら先頭から見せる
  useLayoutEffect(() => {
    getScroller(rootRef.current).scrollTop = 0;
  }, [type]);

  return (
    <div ref={rootRef}>
      {type === null ? (
        <CommentChoiceScreen
          onSelect={(hasComment) => {
            const next = templateTypeFromComment(hasComment);
            setType(next);
            setLastType(next);
          }}
          change={
            change && {
              currentLabel: currentLabel!,
              currentHasComment: change.current.type === 'list',
              onCancel: change.onCancel,
            }
          }
          initialHasComment={lastType ? lastType === 'list' : undefined}
        />
      ) : (
        <BookCountScreen
          templateType={type}
          onBack={() => setType(null)}
          onConfirm={(count) => onConfirm({ type, count })}
          confirmLabel={change ? 'このテンプレートに変更' : undefined}
          changeLabel={currentLabel}
          onCancel={change?.onCancel}
        />
      )}
    </div>
  );
}
