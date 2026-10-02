import { useState } from 'react';
import { BookCountScreen } from './screens/BookCount/BookCountScreen';
import { CommentChoiceScreen } from './screens/CommentChoice/CommentChoiceScreen';
import { DesignSelectScreen } from './screens/DesignSelect/DesignSelectScreen';
import { templateTypeFromComment, type TemplateType } from './constants/template';
import styles from './App.module.css';

type Screen =
  | { name: 'commentChoice' }
  | { name: 'bookCount'; templateType: TemplateType }
  | { name: 'designSelect'; templateType: TemplateType; bookCount: number };

export function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'commentChoice' });

  const goTo = (next: Screen) => {
    setScreen(next);
    window.scrollTo(0, 0);
  };

  return (
    <div className={styles.app}>
      {screen.name === 'commentChoice' && (
        <CommentChoiceScreen
          onSelect={(hasComment) => goTo({ name: 'bookCount', templateType: templateTypeFromComment(hasComment) })}
        />
      )}
      {screen.name === 'bookCount' && (
        <BookCountScreen
          templateType={screen.templateType}
          onBack={() => goTo({ name: 'commentChoice' })}
          onConfirm={(bookCount) => goTo({ name: 'designSelect', templateType: screen.templateType, bookCount })}
        />
      )}
      {screen.name === 'designSelect' && (
        <DesignSelectScreen
          templateType={screen.templateType}
          bookCount={screen.bookCount}
          onBack={() => goTo({ name: 'bookCount', templateType: screen.templateType })}
        />
      )}
    </div>
  );
}
