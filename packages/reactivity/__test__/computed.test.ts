import { describe, it, expect, vi, beforeEach } from 'vitest'

import { reactive, effect } from '../src'
import { computed } from '../src/computed'
import { watch } from '../src/watch'

describe('reactivity', () => {
	beforeEach(() => {
		vi.useFakeTimers()
	})

	it('4.8 计算属性 computed', () => {
		let obj = reactive({
			name: 'rain',
			age: 0,
			birthdaySpent: false,
		})

		const fn = () => obj.name + obj.age + '岁啦！'
		const res = computed(fn)
		obj.age = 10

		console.log(res.value)
		console.log(res.value)

		expect(res.value).toBe(obj.name + '10岁啦！')
	})

	it('4.9 watch的实现原理', () => {
		let obj = reactive({
			name: 'rain',
			age: 0,
			birthdaySpent: false,
		})
		const cb = vi.fn((nv, ov) => {
			console.log(nv, ov)
			expect(nv).toBe(1)
		})
		watch(() => obj.age, cb)

		obj.age++
		expect(cb).toHaveBeenCalledTimes(1)
	})

	it('4.10 立即执行的watch与回调执行时间', () => {
		let obj = reactive({
			name: 'rain',
			age: 0,
			birthdaySpent: false,
		})
		const cb = vi.fn((nv, ov) => {
			console.log(nv, ov)
		})
		watch(() => obj.age, cb, {
			immediate: true,
		})

		obj.age++
		expect(cb).toHaveBeenCalledTimes(2)
	})

	it('4.11 过期的副作用', async () => {
		let obj = reactive({
			name: 'rain',
			age: 0,
			birthdaySpent: false,
		})
		async function fakeFetch(path, data) {
			const p = new Promise((resolve) => {
				setTimeout(() => resolve(data), 1000 * Math.random())
			})
			return p
		}
		let finalData
		const cb = vi.fn(async (nv, ov, onInvalidate) => {
			let expired = false
			onInvalidate(() => {
				expired = true
			})

			const res = await fakeFetch('/fake/path', obj.age)

			if (!expired) {
				finalData = res
			}
		})

		watch(() => obj.age, cb)

		obj.age++
		setTimeout(() => {
			obj.age++
		}, 1000)
		setTimeout(() => {
			expect(finalData).toBe(2) // 保证res永远是第二次请求返回的结果
		}, 2000)
	})
})
