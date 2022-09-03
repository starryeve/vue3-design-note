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

/* // 4.5-4.9
import { track, trigger } from './effect'
export function reactive<T extends object>(target: T): T {
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

/* // 5.3 Object 的代理
import { track, trigger, TriggerType } from './effect'
export const ITERATOR_KEY = Symbol()
export function reactive<T extends object>(target: T): T {
	const obj = new Proxy(target, {
		// 拦截属性访问
		get(target, key, receiver) {
			// 建立联系
			track(target, key)
			// 返回属性值
			return Reflect.get(target, key, receiver)
		},
		// 拦截 in 操作符
		has(target, key) {
			track(target, key)
			return Reflect.has(target, key)
		},
		// 拦截循环遍历 for in
		ownKeys(target) {
			track(target, ITERATOR_KEY)
			return Reflect.ownKeys(target)
		},
		// 拦截设置操作
		set(target, key, value, receiver) {
			// 如果属性不存在，则说明是添加新属性，否则是设置已有属性
			const type = Object.prototype.hasOwnProperty.call(target, key) ? TriggerType.SET : TriggerType.ADD
			// 设置属性值
			const res = Reflect.set(target, key, value, receiver)
			// 将 type 作为第三个参数传给 trigger
			trigger(target, key, type)
			return res
		},
		deleteProperty(target, key) {
			// 检查被删除的属性是否是对象自己的属性
			const hadKey = Object.prototype.hasOwnProperty.call(target, key)
			// 使用 Reflect.deleteProperty 完成属性的删除
			const res = Reflect.deleteProperty(target, key)
			// 只有当操作的属性是对象自己的属性才触发更新
			if (res && hadKey) {
				trigger(target, key, TriggerType.DELETE)
			}

			return res
		},
	})

	return obj
} */

/* // 5.4 合理地触发响应
import { track, trigger, TriggerType } from './effect'
export const ITERATOR_KEY = Symbol()
export function reactive<T extends object>(target: T): T {
	const obj = new Proxy(target, {
		// 拦截属性访问
		get(target, key, receiver) {
			// 代理对象可以通过 raw 属性来访问原始数据
			if (key === 'raw') {
				return target
			}
			// 建立联系
			track(target, key)
			// 返回属性值
			return Reflect.get(target, key, receiver)
		},
		// 拦截 in 操作符
		has(target, key) {
			track(target, key)
			return Reflect.has(target, key)
		},
		// 拦截循环遍历 for in
		ownKeys(target) {
			track(target, ITERATOR_KEY)
			return Reflect.ownKeys(target)
		},
		// 拦截设置操作
		set(target, key, newVal, receiver) {
			// 先获取旧值
			const oldVal = target[key]
			// 如果属性不存在，则说明是添加新属性，否则是设置已有属性
			const type = Object.prototype.hasOwnProperty.call(target, key) ? TriggerType.SET : TriggerType.ADD
			// 设置属性值
			const res = Reflect.set(target, key, newVal, receiver)
			// target === receiver.raw 说明 receiver 就是 target 的代理对象
			if (target === receiver.raw) {
				// 比较新旧值，只有当不全等 且 不全都是 NaN 的时候才触发响应
				if (oldVal !== newVal && (oldVal === oldVal || newVal === newVal)) {
					// 将 type 作为第三个参数传给 trigger
					trigger(target, key, type)
				}
			}

			return res
		},
		deleteProperty(target, key) {
			// 检查被删除的属性是否是对象自己的属性
			const hadKey = Object.prototype.hasOwnProperty.call(target, key)
			// 使用 Reflect.deleteProperty 完成属性的删除
			const res = Reflect.deleteProperty(target, key)
			// 只有当操作的属性是对象自己的属性才触发更新
			if (res && hadKey) {
				trigger(target, key, TriggerType.DELETE)
			}

			return res
		},
	})

	return obj
} */

/* // 5.5 浅响应与深响应
import { track, trigger, TriggerType } from './effect'
export const ITERATOR_KEY = Symbol()
export function createReactive<T extends object>(target: T, isShallow = false): T {
	return new Proxy(target, {
		// 拦截属性访问
		get(target, key, receiver) {
			// 代理对象可以通过 raw 属性来访问原始数据
			if (key === 'raw') {
				return target
			}
			// 得到原始值结果
			const res = Reflect.get(target, key, receiver)
			// 建立联系
			track(target, key)

			// 如果是浅响应
			if (isShallow) {
				return res
			}

			if (typeof res === 'object' && res !== null) {
				return reactive(res)
			}

			return res
		},
		// 拦截 in 操作符
		has(target, key) {
			track(target, key)
			return Reflect.has(target, key)
		},
		// 拦截循环遍历 for in
		ownKeys(target) {
			track(target, ITERATOR_KEY)
			return Reflect.ownKeys(target)
		},
		// 拦截设置操作
		set(target, key, newVal, receiver) {
			// 先获取旧值
			const oldVal = target[key]
			// 如果属性不存在，则说明是添加新属性，否则是设置已有属性
			const type = Object.prototype.hasOwnProperty.call(target, key) ? TriggerType.SET : TriggerType.ADD
			// 设置属性值
			const res = Reflect.set(target, key, newVal, receiver)
			// target === receiver.raw 说明 receiver 就是 target 的代理对象
			if (target === receiver.raw) {
				// 比较新旧值，只有当不全等 且 不全都是 NaN 的时候才触发响应
				if (oldVal !== newVal && (oldVal === oldVal || newVal === newVal)) {
					// 将 type 作为第三个参数传给 trigger
					trigger(target, key, type)
				}
			}

			return res
		},
		deleteProperty(target, key) {
			// 检查被删除的属性是否是对象自己的属性
			const hadKey = Object.prototype.hasOwnProperty.call(target, key)
			// 使用 Reflect.deleteProperty 完成属性的删除
			const res = Reflect.deleteProperty(target, key)
			// 只有当操作的属性是对象自己的属性才触发更新
			if (res && hadKey) {
				trigger(target, key, TriggerType.DELETE)
			}

			return res
		},
	})
}

export function reactive<T extends object>(target: T) {
	return createReactive(target)
}

export function shallowReactive<T extends object>(target: T) {
	return createReactive(target, true)
}
 */

// 5.6 只读和浅只读
import { track, trigger, TriggerType } from './effect'
export const ITERATOR_KEY = Symbol()
export function createReactive<T extends object>(target: T, isShallow = false, isReadOnly = false): T {
	return new Proxy(target, {
		// 拦截属性访问
		get(target, key, receiver) {
			// 代理对象可以通过 raw 属性来访问原始数据
			if (key === 'raw') {
				return target
			}
			// 得到原始值结果
			const res = Reflect.get(target, key, receiver)
			// 建立联系
			track(target, key)

			// 如果是浅响应
			if (isShallow) {
				return res
			}

			if (typeof res === 'object' && res !== null) {
				return isReadOnly ? readonly(res) : reactive(res)
			}

			return res
		},
		// 拦截 in 操作符
		has(target, key) {
			track(target, key)
			return Reflect.has(target, key)
		},
		// 拦截循环遍历 for in
		ownKeys(target) {
			track(target, ITERATOR_KEY)
			return Reflect.ownKeys(target)
		},
		// 拦截设置操作
		set(target, key, newVal, receiver) {
			if (isReadOnly) {
				console.warn(`属性${String(key)}是只读的`)
				return true
			}
			// 先获取旧值
			const oldVal = target[key]
			// 如果属性不存在，则说明是添加新属性，否则是设置已有属性
			const type = Object.prototype.hasOwnProperty.call(target, key) ? TriggerType.SET : TriggerType.ADD
			// 设置属性值
			const res = Reflect.set(target, key, newVal, receiver)
			// target === receiver.raw 说明 receiver 就是 target 的代理对象
			if (target === receiver.raw) {
				// 比较新旧值，只有当不全等 且 不全都是 NaN 的时候才触发响应
				if (oldVal !== newVal && (oldVal === oldVal || newVal === newVal)) {
					// 将 type 作为第三个参数传给 trigger
					trigger(target, key, type)
				}
			}

			return res
		},
		deleteProperty(target, key) {
			if (isReadOnly) {
				console.warn(`属性${String(key)}是只读的`)
				return true
			}
			// 检查被删除的属性是否是对象自己的属性
			const hadKey = Object.prototype.hasOwnProperty.call(target, key)
			// 使用 Reflect.deleteProperty 完成属性的删除
			const res = Reflect.deleteProperty(target, key)
			// 只有当操作的属性是对象自己的属性才触发更新
			if (res && hadKey) {
				trigger(target, key, TriggerType.DELETE)
			}

			return res
		},
	})
}

export function reactive<T extends object>(target: T) {
	return createReactive(target)
}

export function shallowReactive<T extends object>(target: T) {
	return createReactive(target, true)
}

export function readonly<T extends object>(target: T) {
	return createReactive(target, false, true)
}

export function shallowReadonly<T extends object>(target: T) {
	return createReactive(target, true, true)
}
