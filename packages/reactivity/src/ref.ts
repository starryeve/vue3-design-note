import { reactive } from './reactive'

export interface Ref<T = any> {
	value: T
}

export function ref<T>(val: T): Ref<T> {
	// 在 ref 函数内部创建包裹对象
	const wrapper = {
		value: val,
	}

	// 定义一个不可枚举且不可写的属性 __v_isRef
	Object.defineProperty(wrapper, '__v_isRef', {
		value: true,
	})

	// 将包裹对象变成响应式数据
	return reactive(wrapper)
}

export type IfAny<T, Y, N> = 0 extends 1 & T ? Y : N
export type ToRef<T> = IfAny<T, Ref<T>, [T] extends [Ref] ? T : Ref<T>>

export function toRef<T extends object, K extends keyof T>(object: T, key: K): ToRef<T[K]> {
	const wrapper = {
		get value() {
			return object[key]
		},
		set value(val) {
			object[key] = val
		},
	}

	Object.defineProperty(wrapper, '__v_isRef', {
		value: true,
	})

	return wrapper as any
}

export type ToRefs<T = any> = {
	[K in keyof T]: ToRef<T[K]>
}
export function toRefs<T extends object>(object: T): ToRefs<T> {
	const ret = {}
	for (const key in object) {
		ret[key] = toRef(object, key)
	}

	return ret
}

export function proxyRefs(target) {
	return new Proxy(target, {
		get(target, key, receiver) {
			const value = Reflect.get(target, key, receiver)
			// 自动脱 ref 实现，如果读取的值是 ref, 则返回它的 value 属性值
			return value.__v_isRef ? value.value : value
		},
		set(target, key, newValue, receiver) {
			const value = target[key]
			// 如果值是 Ref, 则设置其对应的 value 属性值
			if (value.__v_isRef) {
				value.value = newValue
				return true
			}

			return Reflect.set(target, key, newValue, receiver)
		},
	})
}
