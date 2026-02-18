import { useCallback } from "react";

const MAX_CONCURRENT = 3;

let active = 0;
const queue = [];

const runNext = () => {
  if (active >= MAX_CONCURRENT) return;
  const job = queue.shift();
  if (!job) return;

  active += 1;

  const done = () => {
    active = Math.max(0, active - 1);
    runNext();
  };

  job(done);
};

export default function usePreloadQueue() {
  return useCallback((job) => {
    queue.push(job);
    runNext();
  }, []);
}
