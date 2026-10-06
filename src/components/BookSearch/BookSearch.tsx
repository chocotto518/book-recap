import { useEffect, useId, useRef, useState } from 'react';
import { Button } from '../Button/Button';
import { BookSearchError, needsRakutenCredit, searchBooks, type BookCandidate } from '../../lib/bookSearch';
import styles from './BookSearch.module.css';

type BookSearchProps = {
  /** 候補をタップしたとき */
  onSelect: (book: BookCandidate) => void;
};

type Status =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'done'; results: BookCandidate[] }
  | { kind: 'error'; reason: 'busy' | 'failed' };

/** 書名・作者名で検索して、候補をタップするとタイトル・作者を入れる（仮デザイン） */
export function BookSearch({ onSelect }: BookSearchProps) {
  const id = useId();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const search = async () => {
    if (!query.trim()) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setStatus({ kind: 'loading' });
    try {
      const results = await searchBooks(query, controller.signal);
      if (!controller.signal.aborted) setStatus({ kind: 'done', results });
    } catch (e) {
      if (controller.signal.aborted) return;
      setStatus({ kind: 'error', reason: e instanceof BookSearchError ? e.reason : 'failed' });
    }
  };

  return (
    <div className={styles.search}>
      <label htmlFor={id} className={styles.label}>
        書名・作者名で検索
      </label>
      <div className={styles.row}>
        <input
          id={id}
          className={styles.input}
          type="search"
          enterKeyHint="search"
          value={query}
          placeholder="例：こころ 夏目漱石"
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            // Enter で本の保存（フォームの送信）をしない。変換確定の Enter は無視
            if (e.key !== 'Enter' || e.nativeEvent.isComposing) return;
            e.preventDefault();
            void search();
          }}
        />
        <Button
          variant="secondary"
          size="M"
          className={styles.button}
          onClick={() => void search()}
          disabled={!query.trim() || status.kind === 'loading'}
        >
          検索
        </Button>
      </div>

      <div aria-live="polite">
        {status.kind === 'loading' && <p className={styles.message}>検索中…</p>}
        {status.kind === 'error' && (
          <p className={styles.message}>
            {status.reason === 'busy' ? '混み合っています。' : '検索できませんでした。'}
            時間をおいて試すか、下の欄に入力してください。
          </p>
        )}
        {status.kind === 'done' &&
          (status.results.length === 0 ? (
            <p className={styles.message}>見つかりませんでした。下の欄に入力してください。</p>
          ) : (
            <ul className={styles.results} aria-label="検索結果">
              {status.results.map((book, i) => (
                <li key={`${book.isbn}-${i}`}>
                  <button
                    type="button"
                    className={styles.result}
                    onClick={() => {
                      onSelect(book);
                      setStatus({ kind: 'idle' });
                    }}
                  >
                    <span className={styles.title}>{book.title}</span>
                    <span className={styles.meta}>
                      {[book.author, book.publisher, book.salesDate].filter(Boolean).join('／')}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ))}
      </div>

      {needsRakutenCredit() && (
        <a className={styles.credit} href="https://webservice.rakuten.co.jp/" target="_blank" rel="noopener noreferrer">
          Supported by Rakuten Developers
        </a>
      )}
    </div>
  );
}
