import { EditScreen } from './screens/Edit/EditScreen';
import { TemplateSettingsFlow } from './features/TemplateSettingsFlow';
import { emptyProject, type Project } from './state/project';
import { usePersistentState } from './state/usePersistentState';
import styles from './App.module.css';

type Route = { name: 'templateSettings' } | { name: 'edit'; step: number };

export function App() {
  // 書き出す前に入力内容が消えないよう、リロードしても続きから再開できるようにする
  const [project, setProject] = usePersistentState<Project>('book-recap:project', emptyProject);
  const [route, setRoute] = usePersistentState<Route>('book-recap:route', { name: 'templateSettings' });

  const update = (patch: Partial<Project>) => setProject((prev) => ({ ...prev, ...patch }));

  return (
    <div className={styles.app}>
      {route.name === 'edit' && project.template ? (
        <EditScreen
          project={project}
          template={project.template}
          step={route.step}
          onStepChange={(step) => setRoute({ name: 'edit', step })}
          onChange={update}
        />
      ) : (
        <TemplateSettingsFlow
          onConfirm={(template) => {
            update({ template });
            setRoute({ name: 'edit', step: 0 });
            window.scrollTo(0, 0);
          }}
        />
      )}
    </div>
  );
}
