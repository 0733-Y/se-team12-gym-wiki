// Node 22+ 自带一个全局 localStorage，没给 --localstorage-file 时它是 undefined，
// 并且会盖住 jsdom 的实现。测试里统一换成内存版。
class MemoryStorage {
  #items = new Map()

  get length() {
    return this.#items.size
  }

  key(index) {
    return [...this.#items.keys()][index] ?? null
  }

  getItem(key) {
    return this.#items.has(String(key)) ? this.#items.get(String(key)) : null
  }

  setItem(key, value) {
    this.#items.set(String(key), String(value))
  }

  removeItem(key) {
    this.#items.delete(String(key))
  }

  clear() {
    this.#items.clear()
  }
}

Object.defineProperty(globalThis, 'localStorage', { value: new MemoryStorage(), configurable: true, writable: true })

// jsdom 没有实现 scrollTo；路由切换时 vue-router 会调用它
globalThis.scrollTo = () => {}
