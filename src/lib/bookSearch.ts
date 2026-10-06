/**
 * 書名・作者名で本を探す（楽天ブックス API）。
 * ブラウザから直接呼ぶのでアプリ ID はページの中から見える（楽天のアプリ ID は公開される前提のもの）。
 * アプリ ID が未設定のあいだは検索欄を出さない。URL に `?searchMock` を付けると見本のデータで画面を確かめられる。
 */

/** 楽天ウェブサービスのアプリ ID（未設定なら空） */
export const RAKUTEN_APP_ID = '';

export type BookCandidate = {
  title: string;
  author: string;
  publisher: string;
  /** 発売日（「2016年06月」など、楽天の表記のまま） */
  salesDate: string;
  isbn: string;
};

export class BookSearchError extends Error {
  constructor(readonly reason: 'busy' | 'failed') {
    super(reason);
  }
}

const isMock = () => typeof location !== 'undefined' && new URLSearchParams(location.search).has('searchMock');

/** 検索欄を出せるか */
export const bookSearchAvailable = () => Boolean(RAKUTEN_APP_ID) || isMock();

/** 「Supported by Rakuten Developers」の表示が必要か（楽天の利用規約） */
export const needsRakutenCredit = () => Boolean(RAKUTEN_APP_ID) && !isMock();

export async function searchBooks(query: string, signal?: AbortSignal): Promise<BookCandidate[]> {
  const keyword = query.trim();
  if (!keyword) return [];
  if (isMock()) return mockSearch(keyword, signal);

  const params = new URLSearchParams({
    format: 'json',
    formatVersion: '2',
    applicationId: RAKUTEN_APP_ID,
    keyword,
    booksGenreId: '001', // 本
    hits: '20',
  });
  let res: Response;
  try {
    res = await fetch(`https://app.rakuten.co.jp/services/api/BooksTotal/Search/20170404?${params}`, { signal });
  } catch (e) {
    if (signal?.aborted) throw e;
    throw new BookSearchError('failed');
  }
  if (res.status === 429) throw new BookSearchError('busy');
  // 該当なしは 404 で返ってくることがある
  if (res.status === 404) return [];
  if (!res.ok) throw new BookSearchError('failed');
  const data = (await res.json()) as { Items?: Record<string, string>[] };
  return (data.Items ?? []).map((item) => ({
    title: item.title ?? '',
    author: normalizeAuthor(item.author ?? ''),
    publisher: item.publisherName ?? '',
    salesDate: item.salesDate ?? '',
    isbn: item.isbn ?? '',
  }));
}

/** 楽天は複数の作者を「/」で区切るので読点にする */
function normalizeAuthor(author: string) {
  return author
    .split('/')
    .map((a) => a.trim())
    .filter(Boolean)
    .join('、');
}

const MOCK: BookCandidate[] = [
  { title: 'こころ', author: '夏目漱石', publisher: '新潮社', salesDate: '2004年03月', isbn: '9784101010137' },
  { title: '吾輩は猫である', author: '夏目漱石', publisher: '新潮社', salesDate: '2003年06月', isbn: '9784101010014' },
  { title: '坊っちゃん', author: '夏目漱石', publisher: '新潮社', salesDate: '2003年04月', isbn: '9784101010038' },
  { title: '小説 君の名は。', author: '新海誠', publisher: 'KADOKAWA', salesDate: '2016年06月', isbn: '9784041026229' },
  { title: 'ONE PIECE 1', author: '尾田栄一郎', publisher: '集英社', salesDate: '1997年12月', isbn: '9784088725093' },
  { title: '世界の中心で、愛をさけぶ', author: '片山恭一', publisher: '小学館', salesDate: '2006年03月', isbn: '9784094080133' },
];

/** 見本のデータで検索する（「エラー」で失敗、「混雑」で混み合っているときの表示を確かめられる） */
function mockSearch(keyword: string, signal?: AbortSignal) {
  return new Promise<BookCandidate[]>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      if (keyword.includes('エラー')) return reject(new BookSearchError('failed'));
      if (keyword.includes('混雑')) return reject(new BookSearchError('busy'));
      const words = keyword.split(/\s+/);
      resolve(MOCK.filter((b) => words.every((w) => `${b.title}${b.author}`.includes(w))));
    }, 600);
    signal?.addEventListener('abort', () => {
      window.clearTimeout(timer);
      reject(new DOMException('aborted', 'AbortError'));
    });
  });
}
