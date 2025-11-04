import { useState, useEffect, useCallback } from 'react';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

/**
 * Custom hook for handling API calls with loading, error, and data states
 */
export function useApi<T>(
  apiCall: () => Promise<T>,
  deps: React.DependencyList = [],
  options: UseApiOptions = {}
) {
  const { immediate = true, onSuccess, onError } = options;
  
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await apiCall();
      setState({ data: result, loading: false, error: null });
      onSuccess?.(result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setState({ data: null, loading: false, error: errorMessage });
      onError?.(errorMessage);
      throw error;
    }
  }, deps);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  const refetch = useCallback(() => {
    return execute();
  }, [execute]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    refetch,
    reset,
  };
}

/**
 * Hook for paginated API calls
 */
export function usePaginatedApi<T>(
  apiCall: (page: number, limit: number) => Promise<{ data: T[]; total: number; totalPages: number }>,
  initialPage = 1,
  pageSize = 20
) {
  const [page, setPage] = useState(initialPage);
  const [allData, setAllData] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const {
    data: response,
    loading,
    error,
    execute,
  } = useApi(
    () => apiCall(page, pageSize),
    [page, pageSize],
    {
      immediate: false,
      onSuccess: (newData) => {
        if (page === 1) {
          setAllData(newData.data);
        } else {
          setAllData(prev => [...prev, ...newData.data]);
        }
        setHasMore(page < newData.totalPages);
      },
    }
  );

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  }, [loading, hasMore]);

  const refresh = useCallback(() => {
    setPage(1);
    setAllData([]);
    setHasMore(true);
  }, []);

  useEffect(() => {
    execute();
  }, [page]);

  return {
    data: allData,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    total: response?.total || 0,
    totalPages: response?.totalPages || 0,
    currentPage: page,
  };
}

/**
 * Hook for mutations (POST, PUT, DELETE operations)
 */
export function useMutation<TData, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: UseApiOptions = {}
) {
  const { onSuccess, onError } = options;
  
  const [state, setState] = useState<ApiState<TData>>({
    data: null,
    loading: false,
    error: null,
  });

  const mutate = useCallback(async (variables: TVariables) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await mutationFn(variables);
      setState({ data: result, loading: false, error: null });
      onSuccess?.(result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      onError?.(errorMessage);
      throw error;
    }
  }, [mutationFn, onSuccess, onError]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    mutate,
    reset,
  };
}