/*
// 4.2 基本的响应式
let bucket = new Set() // bucket 里面的 effect 并没有与被操作对象的目标属性产生明确的响应式联系
export function reactive(target: object) {
	const obj = new Proxy(target, {
		get(target, key) {
			bucket.add(getActiveEffect())
			return target[key]
		},
		set(target, key, value) {
			target[key] = value
			bucket.forEach((fn) => fn())
			return true
		},
	})

	return obj
}
*/

/* // 4.3 完善的响应式
import { track, trigger } from './effect'

export function reactive(target: object) {
	const obj = new Proxy(target, {
		get(target, key) {
			// 将副作用函数 activeEffect 添加到存储副作用函数的“桶”中
			track(target, key)
			// 返回属性值
			return target[key]
		},
		set(target, key, value) {
			// 设置属性值
			target[key] = value
			// 把副作用函数从“桶”里取出并执行
			trigger(target, key, value)
			return true
		},
	})

	return obj
} */

/* // 4.4 分支切换与 cleanup
import { track, trigger } from './effect'

export function reactive(target: object) {
	const obj = new Proxy(target, {
		get(target, key) {
			// 将副作用函数 activeEffect 添加到存储副作用函数的“桶”中
			track(target, key)
			// 返回属性值
			return target[key]
		},
		set(target, key, value) {
			// 设置属性值
			target[key] = value
			// 把副作用函数从“桶”里取出并执行
			trigger(target, key)
			return true
		},
	})

	return obj
} */

/* // 4.5 嵌套的 effect 和 effect 栈
import { track, trigger } from './effect'
export function reactive(target: object) {
	const obj = new Proxy(target, {
		get(target, key) {
			// 将副作用函数 activeEffect 添加到存储副作用函数的“桶”中
			track(target, key)
			// 返回属性值
			return target[key]
		},
		set(target, key, value) {
			// 设置属性值
			target[key] = value
			// 把副作用函数从“桶”里取出并执行
			trigger(target, key)
			return true
		},
	})

	return obj
} */

// 4.5-4.7 嵌套的 effect 和 effect 栈
import { track, trigger } from './effect'
export function reactive(target: object) {
	const obj = new Proxy(target, {
		get(target, key) {
			// 将副作用函数 activeEffect 添加到存储副作用函数的“桶”中
			track(target, key)
			// 返回属性值
			return target[key]
		},
		set(target, key, value) {
			// 设置属性值
			target[key] = value
			// 把副作用函数从“桶”里取出并执行
			trigger(target, key)
			return true
		},
	})

	return obj
}
