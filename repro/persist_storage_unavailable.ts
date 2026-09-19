// Probe A: persist with unavailable storage (SSR case) -> `.persist` API disappears
import { createStore } from '../src/vanilla.ts'
import { persist, createJSONStorage } from '../src/middleware.ts'

console.log('typeof window =', typeof (globalThis as any).window)

// 1) default storage option: createJSONStorage(() => window.localStorage) throws -> undefined
const s1: any = createStore(
  persist((set: any) => ({ count: 0, inc: () => set({ count: 1 }) }), {
    name: 'probe-a',
  }),
)
console.log('s1.persist =', s1.persist)
console.log('keys(s1) =', Object.keys(s1))
try {
  s1.persist.rehydrate()
  console.log('rehydrate OK')
} catch (e) {
  console.log('REHYDRATE THREW:', (e as Error).constructor.name + ': ' + (e as Error).message)
}
try {
  console.log('hasHydrated =', s1.persist.hasHydrated())
} catch (e) {
  console.log('HASHYDRATED THREW:', (e as Error).message)
}

// 2) explicit storage: undefined (documented type allows `| undefined`)
const s2: any = createStore(
  persist((set: any) => ({ count: 0 }), {
    name: 'probe-a2',
    storage: undefined,
  }),
)
console.log('s2.persist =', s2.persist)
s2.setState({ count: 5 })
console.log('s2 state after setState =', s2.getState())

// 3) sanity: with a working storage the API exists
const mem = new Map<string, string>()
const s3: any = createStore(
  persist((set: any) => ({ count: 0 }), {
    name: 'probe-a3',
    storage: createJSONStorage(() => ({
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => void mem.set(k, v),
      removeItem: (k: string) => void mem.delete(k),
    })),
  }),
)
console.log('s3.persist methods =', s3.persist && Object.keys(s3.persist))
console.log('s3 hasHydrated =', s3.persist.hasHydrated())
