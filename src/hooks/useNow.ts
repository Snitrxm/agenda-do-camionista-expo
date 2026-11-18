/**
 * Hora atual que se atualiza sozinha (para contadores e prazos no ecrã).
 *
 * @module hooks/useNow
 */

import { useEffect, useState } from 'react';

/** Devolve `new Date()` e volta a renderizar a cada `intervalMs` (por omissão 30 s). */
export function useNow(intervalMs = 30000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
