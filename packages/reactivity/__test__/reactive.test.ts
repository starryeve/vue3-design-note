import { describe, expect, it, vi } from 'vitest'
import { effect, reactive } from '../src'
import { readonly, shallowReactive } from '../src/reactive'

describe('reactive', () => {
	it('5.1 理解 Proxy 与 Reflect', () => {
		const obj = reactive({
			_age: 1,
			get age() {
				return this._age
			},
		})
		const fn = vi.fn(() => {
			console.log(obj.age)
		})
		effect(fn)

		obj._age++

		expect(fn).toHaveBeenCalledTimes(2)
	})

	it('5.3 代理 Object - 添加/删除属性，重新执行 forin 所在副作用函数', () => {
		const obj = reactive({
			name: 'rain',
		})
		Object.setPrototypeOf(obj, {
			property: 200,
		})

		const log = vi.fn(console.log)
		const fn = vi.fn(() => {
			for (const key in obj) {
				log(key)
			}
		})
		effect(fn)
		obj.age = 10
		delete obj.name
		expect(fn).toHaveBeenCalledTimes(3)
	})

	it('5.4 合理地触发响应', () => {
		const obj = {}
		const proto = {
			bar: 1,
		}

		const child = reactive(obj)
		const parent = reactive(proto)

		// 使用 parent 作为 child 的原型
		Object.setPrototypeOf(child, parent)

		const fn = vi.fn(() => {
			console.log(child.bar) //1
		})

		effect(fn)

		// 修改 child.bar 的值
		child.bar = 2

		expect(fn).toHaveBeenCalledTimes(2)
	})

	it('5.5 浅响应', () => {
		const obj = reactive({
			foo: {
				bar: 1,
			},
		})

		const fn = vi.fn(() => {
			console.log(obj.foo.bar)
		})

		effect(fn)
		obj.foo.bar++

		expect(fn).toHaveBeenCalledTimes(2)
	})

	it('5.5 深响应', () => {
		const obj = shallowReactive({
			foo: {
				bar: 1,
			},
		})

		const fn = vi.fn(() => {
			console.log(obj.foo.bar)
		})

		effect(fn)
		obj.foo.bar++

		expect(fn).toHaveBeenCalledTimes(1)
	})

	it('5.6 只读', () => {
		const obj = readonly({
			foo: {
				bar: 1,
			},
		})

		effect(() => {
			console.log(obj.foo.bar)
		})

		obj.foo.bar = 2

		expect(obj.foo.bar).toBe(1)
	})

	it('5.7 代理数组（索引与length）', () => {
		const arr = reactive(['foo'])

		let arr1
		const fn = vi.fn(() => {
			arr1 = arr[1]
		})

		effect(fn)
		arr.length = 0

		expect(arr1).toBe(undefined)
	})

	it('5.7 代理数组（for...in）', () => {
		const arr = reactive(['foo'])

		const fn = vi.fn(() => {
			for (const index in arr) {
				console.log(index)
			}
		})

		effect(fn)
		arr[1] = 'bar'
		arr.length = 0

		expect(fn).toHaveBeenCalledTimes(3)
	})

	it('5.7 代理数组（for...of）', () => {
		const originArr = [1, 2, 3, 4]
		originArr[Symbol.iterator] = function () {
			const target = this
			const len = target.length
			let index = 0

			return {
				next() {
					return {
						value: index < len ? target[index] : undefined,
						done: index++ >= len,
					}
				},
			}
		}

		const arr = reactive(originArr)

		const fn = vi.fn(() => {
			for (const val of arr) {
				console.log(val)
			}
		})

		effect(fn)
		debugger
		arr[1] = 20
		expect(fn).toHaveBeenCalledTimes(2)
	})
})
