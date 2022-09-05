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

/* // 5.6 只读和浅只读
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
			// 非只读的时候才需要建立响应联系
			if (!isReadOnly) {
				// 建立联系
				track(target, key)
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
} */

// 5.7 代理数组
import { track, trigger, TriggerType } from './effect'
export const ITERATOR_KEY = Symbol()

const arrayInstrumentations = {}
;['includes', 'indexOf', 'lastIndexOf'].forEach((method) => {
	const originMethod = Array.prototype[method]
	arrayInstrumentations[method] = function (...argus) {
		// this 是代理对象，现在代理对象中查找，将结果存储到 res 中
		let res = originMethod.apply(this, argus)

		if (res === false) {
			// res 为 false 说明没找到，通过 this.raw 拿到原始数组，再去其中查找并更新 res 值
			res = originMethod.apply(this.raw, argus)
		}

		// 返回最终结果
		return res
	}
})
export let shouldTrack = true
;['push', 'pop', 'shift', 'unshift', 'splice'].forEach((method) => {
	// 取得原始方法
	const originMethod = Array.prototype[method]
	// 重写
	arrayInstrumentations[method] = function (...argus) {
		// 在调用原始方法之前，禁止追踪
		shouldTrack = false
		// push 方法的默认行为
		let res = originMethod.push(this, argus)
		// 在调用原始方法之后，恢复原来的默认行为，即允许追踪
		shouldTrack = true
		return res
	}
})

export function createReactive<T extends object>(target: T, isShallow = false, isReadOnly = false): T {
	return new Proxy(target, {
		// 拦截属性访问
		get(target, key, receiver) {
			// 代理对象可以通过 raw 属性来访问原始数据
			if (key === 'raw') {
				return target
			}
			// 如果操作的目标对象是数组，并且 key 存在于 arrayInstrumentations 上，
			// 那么返回定义在 arrayInstrumentations 上的值
			if (Array.isArray(target) && arrayInstrumentations.hasOwnProperty(key)) {
				return Reflect.get(arrayInstrumentations, key, receiver)
			}
			// 追加判断。如果 key 的类型是 symbol，则不进行追踪
			if (!isReadOnly && typeof key !== 'symbol') {
				// 建立联系
				track(target, key)
			}
			// 得到原始值结果
			const res = Reflect.get(target, key, receiver)

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
			// 如果操作目标 target 是数组，则使用 length 属性作为 key 并建立响应联系
			track(target, Array.isArray(target) ? 'length' : ITERATOR_KEY)
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
			const type = Array.isArray(target)
				? // 如果代理目标是数组，则检测被设置的索引值是否小于数组长度，是则视为 SET 操作，否则视为 ADD 操作
				  Number[key] < target.length
					? TriggerType.SET
					: TriggerType.ADD
				: Object.prototype.hasOwnProperty.call(target, key)
				? TriggerType.SET
				: TriggerType.ADD
			// 设置属性值
			const res = Reflect.set(target, key, newVal, receiver)
			// target === receiver.raw 说明 receiver 就是 target 的代理对象
			if (target === receiver.raw) {
				// 比较新旧值，只有当不全等 且 不全都是 NaN 的时候才触发响应
				if (oldVal !== newVal && (oldVal === oldVal || newVal === newVal)) {
					// 增加第四个参数，则触发响应的新值
					trigger(target, key, type, newVal)
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

// 定义一个 Map 实例，存储原始对象到代理对象的映射
export const reactiveMap = new Map()
export function reactive<T extends object>(target: T) {
	// 优先通过原始对象 obj 寻找之前创建的代理对象，如果找到了，直接返回已有的代理对象
	const existionProxy = reactiveMap.get(target)
	if (existionProxy) return existionProxy

	// 否则，创建新的代理对象
	const proxy = createReactive(target)
	// 存储到 Map 中，从而避免重复创建
	reactiveMap.set(target, proxy)

	return proxy
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
