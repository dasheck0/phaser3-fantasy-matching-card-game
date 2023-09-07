export const times = <T = any>(n: number, iteratee: (index: number) => T) => {
  if (n < 1) {
    return [];
  }

  const result: T[] = new Array(n);

  for (let i = 0; i < n; i++) {
    result[i] = iteratee(i);
  }

  return result;
};

export const sample = <T = any>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

export const sampleAndConsume = <T = any>(array: T[]): T => {
  const index = Math.floor(Math.random() * array.length);
  const result = array[index];
  array.splice(index, 1);
  return result;
};
