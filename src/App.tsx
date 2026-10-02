import { useState } from 'react';
import { BookCountScreen } from './screens/BookCount/BookCountScreen';
import { CommentChoiceScreen } from './screens/CommentChoice/CommentChoiceScreen';
import { templateTypeFromComment, type TemplateType } from './constants/template';
import styles from './App.module.css';

type Screen = { name: 'commentChoice' } | { name: 'bookCount'; templateType: TemplateType };

export function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'commentChoice' });

  return (
    <div className={styles.app}>
      {screen.name === 'commentChoice' && (
        <CommentChoiceScreen
          onSelect={(hasComment) =>
            setScreen({ name: 'bookCount', templateType: templateTypeFromComment(hasComment) })
          }
        />
      )}
      {screen.name === 'bookCount' && (
        <BookCountScreen templateType={screen.templateType} onBack={() => setScreen({ name: 'commentChoice' })} />
      )}
    </div>
  );
}
