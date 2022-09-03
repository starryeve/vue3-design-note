import { describe, it, expect, vi, beforeEach } from 'vitest'

import { reactive, effect } from '../src'

describe('effect', () => {
	beforeEach(() => {
		vi.useFakeTimers()
	})

	it('4.2 基本的响应式', () => {
		let dummy
		let obj = reactive({
			name: 'rain',
			age: 0,
			birthdaySpent: false,
		})

		effect(() => {
			dummy = obj.name
		})
		expect(dummy).toBe('rain')
		obj.name = 'ice'
		expect(dummy).toBe('ice')
	})

	it('4.3 effect 只会在与其建立响应式联系的属性发生变化时执行', () => {
		let dummy
		let obj = reactive({
			name: 'rain',
			age: 0,
			birthdaySpent: false,
		})
		const fn = vi.fn(() => {
			dummy = obj.name
		})
		effect(fn)
		obj.age = 22
		expect(fn).toBeCalledTimes(1)
	})

	it('4.4 分支切换与 cleanup', () => {
		let whoHaveNotSpendBirthday = new Set()
		let obj = reactive({
			name: 'rain',
			age: 0,
			birthdaySpent: false,
		})
		const fn = vi.fn(() => {
			if (!obj.birthdaySpent) {
				// 这个副作用仅在某人的生日还没过时才会执行，也就是说，当生日设置为已度过，副作用不应该执行
				whoHaveNotSpendBirthday.add(obj.name)
				whoHaveNotSpendBirthday.forEach((who) => {
					console.log(`记得哦：${who}快要过生日了`)
				})
			}
		})
		effect(fn)
		obj.birthdaySpent = true
		obj.name = 'fall rain'
		expect(fn).toBeCalledTimes(2)
	})

	it('4.5 嵌套的 effect 与 effect 栈', () => {
		let obj = reactive({
			name: 'rain',
			age: 0,
			birthdaySpent: false,
		})

		// 想象一下，这两个 render 就代表了两个嵌套组件的渲染函数
		let outerRender, innerRender
		const OuterComp = {
				render: outerRender,
			},
			InnerComp = {
				render: innerRender,
			}
		outerRender = vi.fn(() => {
			return {
				tag: OuterComp,
				children: [InnerComp],
			}
		})
		innerRender = vi.fn(() => {
			return {
				tag: InnerComp,
				children: ['div'],
			}
		})
		// 当<outer><inner/></outer> 时，就相当于
		effect(() => {
			outerRender()
			effect(() => {
				console.log(obj.age)
				innerRender()
			})
			console.log(obj.name) // 当执行到这里的时候，activeEffect 实际上已经变成了 innerRender 所在函数
		})

		obj.age = 22
		obj.age = 23
		expect(outerRender).toHaveBeenCalledTimes(1)
		expect(innerRender).toHaveBeenCalledTimes(3)
	})

	it('4.6 避免无限递归循环', () => {
		let obj = reactive({
			name: 'rain',
			age: 0,
			birthdaySpent: false,
		})
		let n = 0
		const fn = () => {
			obj.age++
			n++
			if (n > 999) throw new Error('死循环')
		}
		// expect(() => effect(fn)).toThrowError(RangeError)
		effect(fn)
		obj.age = 0
		expect(obj.age).toBe(1)
	})

	it('4.7 调度执行（控制执行顺序）', async () => {
		let obj = reactive({
			name: 'rain',
			age: 0,
			birthdaySpent: false,
		})
		const arr1 = [],
			arr2 = []
		effect(() => {
			arr1.push(obj.age)
		})
		effect(
			() => {
				arr2.push(obj.age)
			},
			{
				scheduler(fn) {
					setTimeout(fn)
				},
			}
		)
		obj.age++
		arr1.push('end')
		arr2.push('end')
		await vi.runAllTimers()
		expect(arr1).toEqual([0, 1, 'end'])
		expect(arr2).toEqual([0, 'end', 1])
	})

	it('4.7 调度执行（控制执行次数）', async () => {
		let obj = reactive({
			name: 'rain',
			age: 0,
			birthdaySpent: false,
		})
		const jobQueue = new Set()
		const p = Promise.resolve()

		// 表示是否正在刷新队列
		let isFlushing = false
		function flushJob() {
			// 如果队列正在刷新，则什么都不做
			if (isFlushing) return
			// 设置为 true, 代表正在刷新
			isFlushing = true
			// 在微任务队列中刷新 jobQueue
			p.then(() => {
				jobQueue.forEach((job: any) => job())
			}).finally(() => {
				// 结束后重置 isFlushing
				isFlushing = false
			})
		}

		const fn = vi.fn(() => {
			console.log(obj.age)
		})
		effect(fn, {
			scheduler(fn) {
				// 每次调度的时候，将副作用函数添加到 jobQueue 队列中
				jobQueue.add(fn)
				// 调用 flushJob 刷新队列
				flushJob()
			},
		})

		obj.age++
		obj.age++
		obj.age++
		await vi.runAllTimers()
		expect(fn).toHaveBeenCalledTimes(2)
		expect(obj.age).toBe(3)
	})

	it('4.8 懒执行 lazy', () => {
		let obj = reactive({
			name: 'rain',
			age: 0,
			birthdaySpent: false,
		})
		// 假设传给 effect 的是一个 getter，那么这个 getter 可以返回任何值
		const effectFn = effect(() => obj.name + obj.age + '岁啦！', {
			lazy: true,
		})

		obj.age++
		// value 是 getter 的一个返回值
		const value = effectFn()
		expect(value).toBe(obj.name + obj.age + '岁啦！')
	})
})
