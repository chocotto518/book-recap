import { useEffect, useState } from 'react';

/**
 * localStorage に保存される useState。リロードしても入力内容が消えないようにする。
 * プライベートブラウズなどで保存できない環境では、ただの useState として動く。
 */
export function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved === null ? initial : (JSON.parse(saved) as T);
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // 保存できなくても動作は続ける
    }
  }, [key, value]);

  return [value, setValue] as const;
}
