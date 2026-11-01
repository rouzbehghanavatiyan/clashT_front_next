import { useCallback, useEffect, useRef, useState } from "react";

const PAGE_SIZE = 3;

function parseList<T>(res: any): T[] {
  if (Array.isArray(res?.data?.data)) return res.data.data;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res)) return res;
  return [];
}

export function useLoadMore<T = any>(
  fetchFn: (params: { skip: number; take: number }) => Promise<any>,
  onSuccess: (newItems: T[], isFirstPage: boolean) => void,
  cachedDataLength: number = 0,
  resetKey?: string | number,
) {
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const skipRef = useRef(0);
  const fetchFnRef = useRef(fetchFn);
  const onSuccessRef = useRef(onSuccess);
  fetchFnRef.current = fetchFn;
  onSuccessRef.current = onSuccess;

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMoreRef.current) return;

    loadingRef.current = true;
    setLoading(true);

    const skip = skipRef.current;
    const take = PAGE_SIZE;
    const isFirstPage = skip === 0;

    try {
      let list = parseList<T>(await fetchFnRef.current({ skip, take }));

      if (list.length === 0) {
        list = parseList<T>(await fetchFnRef.current({ skip, take }));
      }

      onSuccessRef.current(list, isFirstPage);

      skipRef.current = skip + take;
      const more = list.length === take;
      hasMoreRef.current = more;
      setHasMore(more);
    } catch (err) {
      console.error("Error to get profile videos:", err);
      hasMoreRef.current = false;
      setHasMore(false);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    skipRef.current = 0;
    hasMoreRef.current = true;
    setHasMore(true);
    if (cachedDataLength === 0) {
      void loadMore();
    } else {
      skipRef.current = Math.ceil(cachedDataLength / PAGE_SIZE) * PAGE_SIZE;
    }
  }, [resetKey, loadMore]);

  return { loading, hasMore, loadMore };
}
