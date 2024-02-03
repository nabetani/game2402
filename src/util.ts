const b32Val = (1 << 30) * 4;

let globalID = 0;
export function newID() {
  return ++globalID;
}

/**
 * from https://zenn.dev/uhyo/articles/array-n-keys-yamero
 * Returns an iterator that iterates integers in [start, end).
 */
export function* range(start: integer, end: integer) {
  for (let i = start; i < end; i++) {
    yield i;
  }
}

export function* rep<T>(count: integer, value: T) {
  for (let i = 0; i < count; ++i) {
    yield value;
  }
}

// https://prng.di.unimi.it/xoshiro128plusplus.c
/*

static inline uint32_t rotl(const uint32_t x, int k) {
  return (x << k) | (x >> (32 - k));
}
static uint32_t s[4];
uint32_t next(void) {
  const uint32_t result = rotl(s[0] + s[3], 7) + s[0];
  const uint32_t t = s[1] << 9;
  s[2] ^= s[0];
  s[3] ^= s[1];
  s[1] ^= s[2];
  s[0] ^= s[3];
  s[2] ^= t;
  s[3] = rotl(s[3], 11);
  return result;
}
*/

const rotl = (x: number, k: number) => {
  x = x >>> 0;
  k = k >>> 0;
  return ((x << k) | (x >>> (32 - k))) >>> 0;
}
export class Rng {
  s: number[] = []
  constructor(seeds: integer[]) {
    for (let i = 0; i < 4; i++) {
      this.s[i] = (747796405 * (i + 1) + 2891336453) >>> 0;
      for (const e of seeds) {
        this.s[i] = (this.s[i] * 12829 + e) >>> 0;
      }
    }
    this.s[0] |= 1;
    for (let i = 0; i < 16; ++i) {
      this.u32;
    }
  }

  // 0 ≦ f01 < 1 の数を返す
  get f01(): number {
    return (this.u32 + ((this.u32 & ~((1 << 11) - 1)) >>> 0) / b32Val) / b32Val
  }

  // 0 ≦ n < sup の整数を返す。素朴に剰余なので若干偏る。
  n(sup: integer): integer {
    return this.u32 % sup
  }

  sel<T>(samples: T[]): T {
    return samples[this.n(samples.length)]
  }

  shuffle<T>(s: T[]): T[] {
    let r = [...s]
    for (let i = 1; i < r.length; ++i) {
      const j = this.n(i + 1);
      if (i != j) {
        [r[i], r[j]] = [r[j], r[i]]
      }
    }
    return r
  }

  // 0 ≦ n < 2**32 の整数を返す。
  get u32(): integer {
    const result = (rotl(this.s[0] + this.s[3], 7) + this.s[0]) >>> 0;
    const t = (this.s[1] << 9) >>> 0;
    this.s[2] ^= this.s[0];
    this.s[3] ^= this.s[1];
    this.s[1] ^= this.s[2];
    this.s[0] ^= this.s[3];
    this.s[2] ^= t;
    this.s[3] = rotl(this.s[3], 11);
    return result;
  }
}
