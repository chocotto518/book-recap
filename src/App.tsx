import { useEffect } from 'react';
import { EditScreen } from './screens/Edit/EditScreen';
import { TemplateSettingsFlow } from './features/TemplateSettingsFlow';
import { pruneCovers } from './state/covers';
import { emptyProject, fitBooks, type Project } from './state/project';
import { usePersistentState } from './state/usePersistentState';
import styles from './App.module.css';

type Route = { name: 'templateSettings' } | { name: 'edit'; step: number };

export function App() {
  // 書き出す前に入力内容が消えないよう、リロードしても続きから再開できるようにする
  const [project, setProject] = usePersistentState<Project>('book-recap:project', emptyProject);
  const [route, setRoute] = usePersistentState<Route>('book-recap:route', { name: 'templateSettings' });

  const update = (patch: Partial<Project>) => setProject((prev) => ({ ...prev, ...patch }));

  // 保存されていた内容が古い形式でも、冊数ぶんの枠がそろうようにする（ID が毎回変わらないよう state に書き戻す）
  if (project.template && project.books?.length !== project.template.count) {
    setProject((prev) => ({ ...prev, books: fitBooks(prev.books, prev.template?.count ?? 0) }));
  }
  const books = project.books ?? [];
  const coverIds = books.map((b) => b.coverId).join(',');

  // 使われなくなった書影画像を消す
  useEffect(() => {
    pruneCovers(coverIds.split(','));
  }, [coverIds]);

  return (
    <div className={styles.app}>
      {route.name === 'edit' && project.template ? (
        <EditScreen
          project={{ ...project, books }}
          template={project.template}
          step={route.step}
          onStepChange={(step) => setRoute({ name: 'edit', step })}
          onChange={update}
          onReset={() => {
            setProject(emptyProject);
            setRoute({ name: 'templateSettings' });
            window.scrollTo(0, 0);
          }}
        />
      ) : (
        <TemplateSettingsFlow
          onConfirm={(template) => {
            update({ template, books: fitBooks(project.books, template.count) });
            setRoute({ name: 'edit', step: 0 });
            window.scrollTo(0, 0);
          }}
        />
      )}
    </div>
  );
}
