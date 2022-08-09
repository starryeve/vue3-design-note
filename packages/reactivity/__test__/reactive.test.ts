import { describe, it, expect, vi } from 'vitest'

import { reactive, effect } from '../src'

describe('reactivity', () => {
	let dummy
	let whoHaveNotSpendBirthday = new Set()
	let obj = reactive({
		name: 'rain',
		age: 20,
		birthdaySpent: false,
	})
	it('4.2-基本的响应式', () => {
		effect(() => {
			dummy = obj.name
		})
		expect(dummy).toBe('rain')
		obj.name = 'ice'
		expect(dummy).toBe('ice')
	})

	it('4.3-effect 只会在与其建立响应式联系的属性发生变化时执行', () => {
		const fn = vi.fn(() => {
			dummy = obj.name
		})
		effect(fn)
		obj.age = 22
		expect(fn).toBeCalledTimes(1)
	})

	it('4.4-分支切换与 cleanup', () => {
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

	it('4.5-嵌套的 effect 与 effect 栈', () => {
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

	it('4-6-避免无限递归循环', () => {
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
})
