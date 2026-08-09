import { useEffect, useRef } from "react";

export default function usePolling(fn, intervalMs = 30000) {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    fnRef.current();
    const id = setInterval(() => fnRef.current(), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
}
