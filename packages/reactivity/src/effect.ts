/*
// 4.2 基本的响应式
let activeEffect = null
export function getActiveEffect() {
	return activeEffect
}
export function effect(fn) {
	activeEffect = fn
	fn() // fn 内部触发 get
}
*/

import { ITERATOR_KEY } from './reactive'

/* // 4.3 完善的响应式
let activeEffect = null
export function getActiveEffect() {
	return activeEffect
}
export function effect(fn) {
	activeEffect = fn
	fn() // fn 内部触发 get
}

const bucket = new WeakMap()
// 在 get 拦截属性读取时，调用 track 进行依赖追踪
export function track(target: object, key: string | symbol) {
	 if (!getActiveEffect()) return 
	let depsMap = bucket.get(target) // key -> effects
	if (!depsMap) {
		bucket.set(target, (depsMap = new Map()))
	}
	let deps = depsMap.get(key)
	if (!deps) {
		depsMap.set(key, (deps = new Set()))
	}
	// 将激活的副作用函数添加到“桶”里
	deps.add(getActiveEffect())
}

// 在 set 拦截属性设置时，调用 trigger 触发副作用执行
export function trigger(target: object, key: string | symbol) {
	const depsMap = bucket.get(target)
	if (!depsMap) return
	const effects = depsMap.get(key)
	// 执行副作用函数
	effects && effects.forEach((fn) => fn())
}
 */

/* // 4.4 分支切换与 cleanup
let activeEffect
export function getActiveEffect() {
	return activeEffect
}

function cleanup(effectFn) {
	// 遍历 effectFn.deps 数组
	for (let i = 0; i < effectFn.deps.length; i++) {
		// deps 是一个依赖集合
		const deps = effectFn.deps[i]
		// 将 effectFn 从依赖集合中移除
		deps.delete(effectFn)
	}

	// 因为这里是一个双向的关系，所以还需要充值 effectFn.deps 数组
	effectFn.deps.length = 0
}
export function effect(fn) {
	const effectFn = () => {
		// 调用 cleanup 函数完成依赖联系清除工作
		cleanup(effectFn)
		// 当 effectFn 执行时，将其设置为当前激活的副作用函数
		activeEffect = effectFn
		fn()
	}

	// activeEffect.deps 用来存储所有与该副作用函数相关联的依赖集合
	effectFn.deps = []
	// 执行副作用函数
	effectFn()
}

const bucket = new WeakMap()
// 在 get 拦截属性读取时，调用 track 进行依赖追踪
export function track(target: object, key: string | symbol) {
	 if (!getActiveEffect()) return 
	let depsMap = bucket.get(target) // key -> effects
	if (!depsMap) {
		bucket.set(target, (depsMap = new Map()))
	}
	let deps = depsMap.get(key)
	if (!deps) {
		depsMap.set(key, (deps = new Set()))
	}
	// 将激活的副作用函数添加到“桶”里
	deps.add(getActiveEffect())
	// deps 就是一个与当前副作用函数存在联系的依赖集合，将其添加到 activeEffect.deps 数组中
	activeEffect.deps.push(deps)
}
// 在 set 拦截属性设置时，调用 trigger 触发副作用执行
export function trigger(target: object, key: string | symbol) {
	const depsMap = bucket.get(target)
	if (!depsMap) return
	const effects = depsMap.get(key)
	// 执行副作用函数
	// effects && effects.forEach((fn) => fn())
	const effectsToRun = new Set(effects)
	effectsToRun.forEach((effectFn: any) => effectFn())
}
 */

/* // 4.5 嵌套的 effect 和 effect 栈
let activeEffect
// effect 栈
const effectStack: Function[] = []
export function getActiveEffect() {
	return activeEffect
}

function cleanup(effectFn) {
	// 遍历 effectFn.deps 数组
	for (let i = 0; i < effectFn.deps.length; i++) {
		// deps 是一个依赖集合
		const deps = effectFn.deps[i]
		// 将 effectFn 从依赖集合中移除
		deps.delete(effectFn)
	}

	// 因为这里是一个双向的关系，所以还需要充值 effectFn.deps 数组
	effectFn.deps.length = 0
}
export function effect(fn) {
	const effectFn = () => {
		cleanup(effectFn)
		// 当调用 effect 注册副作用函数时，将副作用函数赋值给 activeEffect
		activeEffect = effectFn
		// 在调用副作用函数之前将当前的副作用韩式压入栈中
		effectStack.push(effectFn)
		fn()
		// 当前副作用函数执行完毕，将当前副作用函数弹出栈，并把 activeEffect 还原为之前的值
		effectStack.pop()
		activeEffect = effectStack[effectStack.length - 1]
	}
	// activeEffect.deps 用来存储所有与该副作用函数相关的依赖集合
	effectFn.deps = []
	// 执行副作用函数
	effectFn()
}
const bucket = new WeakMap()
// 在 get 拦截属性读取时，调用 track 进行依赖追踪
export function track(target: object, key: string | symbol) {
	 if (!getActiveEffect()) return 
	let depsMap = bucket.get(target) // key -> effects
	if (!depsMap) {
		bucket.set(target, (depsMap = new Map()))
	}
	let deps = depsMap.get(key)
	if (!deps) {
		depsMap.set(key, (deps = new Set()))
	}
	// 将激活的副作用函数添加到“桶”里
	deps.add(getActiveEffect())
	// deps 就是一个与当前副作用函数存在联系的依赖集合，将其添加到 activeEffect.deps 数组中
	activeEffect.deps.push(deps)
}
// 在 set 拦截属性设置时，调用 trigger 触发副作用执行
export function trigger(target: object, key: string | symbol) {
	const depsMap = bucket.get(target)
	if (!depsMap) return
	const effects = depsMap.get(key)
	// 执行副作用函数
	// effects && effects.forEach((fn) => fn())
	const effectsToRun = new Set(effects)
	effectsToRun.forEach((effectFn: any) => effectFn())
} */

/* // 4.6 避免无限递归循环
let activeEffect
// effect 栈
const effectStack: Function[] = []
export function getActiveEffect() {
	return activeEffect
}

function cleanup(effectFn) {
	// 遍历 effectFn.deps 数组
	for (let i = 0; i < effectFn.deps.length; i++) {
		// deps 是一个依赖集合
		const deps = effectFn.deps[i]
		// 将 effectFn 从依赖集合中移除
		deps.delete(effectFn)
	}

	// 因为这里是一个双向的关系，所以还需要充值 effectFn.deps 数组
	effectFn.deps.length = 0
}
export function effect(fn) {
	const effectFn = () => {
		cleanup(effectFn)
		// 当调用 effect 注册副作用函数时，将副作用函数赋值给 activeEffect
		activeEffect = effectFn
		// 在调用副作用函数之前将当前的副作用韩式压入栈中
		effectStack.push(effectFn)
		fn()
		// 当前副作用函数执行完毕，将当前副作用函数弹出栈，并把 activeEffect 还原为之前的值
		effectStack.pop()
		activeEffect = effectStack[effectStack.length - 1]
	}
	// activeEffect.deps 用来存储所有与该副作用函数相关的依赖集合
	effectFn.deps = []
	// 执行副作用函数
	effectFn()
}
const bucket = new WeakMap()
// 在 get 拦截属性读取时，调用 track 进行依赖追踪
export function track(target: object, key: string | symbol) {
	 if (!getActiveEffect()) return 
	let depsMap = bucket.get(target) // key -> effects
	if (!depsMap) {
		bucket.set(target, (depsMap = new Map()))
	}
	let deps = depsMap.get(key)
	if (!deps) {
		depsMap.set(key, (deps = new Set()))
	}
	// 将激活的副作用函数添加到“桶”里
	deps.add(getActiveEffect())
	// deps 就是一个与当前副作用函数存在联系的依赖集合，将其添加到 activeEffect.deps 数组中
	activeEffect.deps.push(deps)
}
// 在 set 拦截属性设置时，调用 trigger 触发副作用执行
export function trigger(target: object, key: string | symbol) {
	const depsMap = bucket.get(target)
	if (!depsMap) return
	const effects = depsMap.get(key)
	// 执行副作用函数
	// effects && effects.forEach((fn) => fn())
	const effectsToRun = new Set(effects)
	// effectsToRun.forEach((effectFn: any) => effectFn())
	effectsToRun.forEach((effectFn: any) => {
		// 如果 trigger 触发执行的副作用函数与当前正在执行的副作用函数相同，则不触发执行
		if (activeEffect !== effectFn) effectFn()
	})
}
 */

/* // 4.7 调度执行
interface EffectOptions {
	scheduler?: (effectFn: Function) => void
}
let activeEffect
// effect 栈
const effectStack: Function[] = []
export function getActiveEffect() {
	return activeEffect
}

function cleanup(effectFn) {
	// 遍历 effectFn.deps 数组
	for (let i = 0; i < effectFn.deps.length; i++) {
		// deps 是一个依赖集合
		const deps = effectFn.deps[i]
		// 将 effectFn 从依赖集合中移除
		deps.delete(effectFn)
	}

	// 因为这里是一个双向的关系，所以还需要充值 effectFn.deps 数组
	effectFn.deps.length = 0
}
export function effect(fn, options: EffectOptions = {}) {
	const effectFn = () => {
		cleanup(effectFn)
		// 当调用 effect 注册副作用函数时，将副作用函数赋值给 activeEffect
		activeEffect = effectFn
		// 在调用副作用函数之前将当前的副作用韩式压入栈中
		effectStack.push(effectFn)
		fn()
		// 当前副作用函数执行完毕，将当前副作用函数弹出栈，并把 activeEffect 还原为之前的值
		effectStack.pop()
		activeEffect = effectStack[effectStack.length - 1]
	}
	// activeEffect.deps 用来存储所有与该副作用函数相关的依赖集合
	effectFn.deps = []
	// 将 options 挂载到 effectFn 上
	effectFn.options = options
	// 执行副作用函数
	effectFn()
}
const bucket = new WeakMap()
// 在 get 拦截属性读取时，调用 track 进行依赖追踪
export function track(target: object, key: string | symbol) {
	 if (!getActiveEffect()) return 
	let depsMap = bucket.get(target) // key -> effects
	if (!depsMap) {
		bucket.set(target, (depsMap = new Map()))
	}
	let deps = depsMap.get(key)
	if (!deps) {
		depsMap.set(key, (deps = new Set()))
	}
	// 将激活的副作用函数添加到“桶”里
	deps.add(getActiveEffect())
	// deps 就是一个与当前副作用函数存在联系的依赖集合，将其添加到 activeEffect.deps 数组中
	activeEffect.deps.push(deps)
}
// 在 set 拦截属性设置时，调用 trigger 触发副作用执行
export function trigger(target: object, key: string | symbol) {
	const depsMap = bucket.get(target)
	if (!depsMap) return
	const effects = depsMap.get(key)
	// 执行副作用函数
	// effects && effects.forEach((fn) => fn())
	const effectsToRun = new Set(effects)
	// effectsToRun.forEach((effectFn: any) => effectFn())
	effectsToRun.forEach((effectFn: any) => {
		// 如果 trigger 触发执行的副作用函数与当前正在执行的副作用函数相同，则不触发执行
		if (activeEffect !== effectFn) {
			// 如果一个副作用函数存在调度器，则调用调度器，并将副作用函数作为参数传递
			if (effectFn.options.scheduler) {
				effectFn.options.scheduler(effectFn)
			} else {
				effectFn()
			}
		}
	})
} */

/* // 4.8 计算属性 computed 与 lazy
interface EffectOptions {
	lazy?: boolean
	scheduler?: (effectFn: Function) => void
}
let activeEffect
// effect 栈
const effectStack: Function[] = []
export function getActiveEffect() {
	return activeEffect
}

function cleanup(effectFn) {
	// 遍历 effectFn.deps 数组
	for (let i = 0; i < effectFn.deps.length; i++) {
		// deps 是一个依赖集合
		const deps = effectFn.deps[i]
		// 将 effectFn 从依赖集合中移除
		deps.delete(effectFn)
	}

	// 因为这里是一个双向的关系，所以还需要充值 effectFn.deps 数组
	effectFn.deps.length = 0
}
export function effect(fn, options: EffectOptions = {}) {
	const effectFn = () => {
		cleanup(effectFn)
		// 当调用 effect 注册副作用函数时，将副作用函数赋值给 activeEffect
		activeEffect = effectFn
		// 在调用副作用函数之前将当前的副作用韩式压入栈中
		effectStack.push(effectFn)
		// 将副作用函数执行的结果存储到 res 中
		const res = fn()
		// 当前副作用函数执行完毕，将当前副作用函数弹出栈，并把 activeEffect 还原为之前的值
		effectStack.pop()
		activeEffect = effectStack[effectStack.length - 1]
		// 将 res 作为 effectFn 的返回值
		return res
	}
	// activeEffect.deps 用来存储所有与该副作用函数相关的依赖集合
	effectFn.deps = []
	// 将 options 挂载到 effectFn 上
	effectFn.options = options
	if (!options.lazy) {
		// 立即执行副作用函数
		effectFn()
	}

	// 将副作用函数作为返回值返回
	return effectFn
}
const bucket = new WeakMap()
// 在 get 拦截属性读取时，调用 track 进行依赖追踪
export function track(target: object, key: string | symbol) {
	if (!getActiveEffect()) return
	let depsMap = bucket.get(target) // key -> effects
	if (!depsMap) {
		bucket.set(target, (depsMap = new Map()))
	}
	let deps = depsMap.get(key)
	if (!deps) {
		depsMap.set(key, (deps = new Set()))
	}
	// 将激活的副作用函数添加到“桶”里
	deps.add(getActiveEffect())
	// deps 就是一个与当前副作用函数存在联系的依赖集合，将其添加到 activeEffect.deps 数组中
	activeEffect.deps.push(deps)
}
// 在 set 拦截属性设置时，调用 trigger 触发副作用执行
export function trigger(target: object, key: string | symbol) {
	const depsMap = bucket.get(target)
	if (!depsMap) return
	const effects = depsMap.get(key)
	// 执行副作用函数
	// effects && effects.forEach((fn) => fn())
	const effectsToRun = new Set(effects)
	// effectsToRun.forEach((effectFn: any) => effectFn())
	effectsToRun.forEach((effectFn: any) => {
		// 如果 trigger 触发执行的副作用函数与当前正在执行的副作用函数相同，则不触发执行
		if (activeEffect !== effectFn) {
			// 如果一个副作用函数存在调度器，则调用调度器，并将副作用函数作为参数传递
			if (effectFn.options.scheduler) {
				effectFn.options.scheduler(effectFn)
			} else {
				effectFn()
			}
		}
	})
}
 */

// 5.3 代理 Object
interface EffectOptions {
	lazy?: boolean
	scheduler?: (effectFn: Function) => void
}
let activeEffect
// effect 栈
const effectStack: Function[] = []
export function getActiveEffect() {
	return activeEffect
}

function cleanup(effectFn) {
	// 遍历 effectFn.deps 数组
	for (let i = 0; i < effectFn.deps.length; i++) {
		// deps 是一个依赖集合
		const deps = effectFn.deps[i]
		// 将 effectFn 从依赖集合中移除
		deps.delete(effectFn)
	}

	// 因为这里是一个双向的关系，所以还需要充值 effectFn.deps 数组
	effectFn.deps.length = 0
}
export function effect(fn, options: EffectOptions = {}) {
	const effectFn = () => {
		cleanup(effectFn)
		// 当调用 effect 注册副作用函数时，将副作用函数赋值给 activeEffect
		activeEffect = effectFn
		// 在调用副作用函数之前将当前的副作用韩式压入栈中
		effectStack.push(effectFn)
		// 将副作用函数执行的结果存储到 res 中
		const res = fn()
		// 当前副作用函数执行完毕，将当前副作用函数弹出栈，并把 activeEffect 还原为之前的值
		effectStack.pop()
		activeEffect = effectStack[effectStack.length - 1]
		// 将 res 作为 effectFn 的返回值
		return res
	}
	// activeEffect.deps 用来存储所有与该副作用函数相关的依赖集合
	effectFn.deps = []
	// 将 options 挂载到 effectFn 上
	effectFn.options = options
	if (!options.lazy) {
		// 立即执行副作用函数
		effectFn()
	}

	// 将副作用函数作为返回值返回
	return effectFn
}
const bucket = new WeakMap()
// 在 get 拦截属性读取时，调用 track 进行依赖追踪
export function track(target: object, key: string | symbol) {
	if (!getActiveEffect()) return
	let depsMap = bucket.get(target) // key -> effects
	if (!depsMap) {
		bucket.set(target, (depsMap = new Map()))
	}
	let deps = depsMap.get(key)
	if (!deps) {
		depsMap.set(key, (deps = new Set()))
	}
	// 将激活的副作用函数添加到“桶”里
	deps.add(getActiveEffect())
	// deps 就是一个与当前副作用函数存在联系的依赖集合，将其添加到 activeEffect.deps 数组中
	activeEffect.deps.push(deps)
}

export const enum TriggerType {
	SET = 'SET',
	ADD = 'ADD',
	DELETE = 'DELETE',
}
// 为 trigger 函数增加第四个参数，newVal，即新值
export function trigger(target: object, key: string | symbol, type: TriggerType = TriggerType.SET, newVal) {
	const depsMap = bucket.get(target)
	if (!depsMap) return

	// 取得与 key 相关联的副作用函数
	const effects = depsMap.get(key)
	// 取得与 ITERATE_KEY 相关联的副作用函数
	const iterateEffects = depsMap.get(ITERATOR_KEY)

	const effectsToRun = new Set(effects)

	// 将与 key 相关联的副作用函数添加到 effectsToRun
	effects &&
		effects.forEach((effectFn) => {
			if (effectFn !== activeEffect) {
				effectsToRun.add(effectFn)
			}
		})

	// 只有当操作类型为 'ADD' 或 'DELETE' 时，才触发与 ITERATE_KEY 相关联的副作用函数重新执行
	if (type === TriggerType.ADD || type === TriggerType.DELETE) {
		// 将与 ITERATE_KEY 相关联的副作用函数添加到 effectsToRun
		iterateEffects &&
			iterateEffects.forEach((effectFn) => {
				if (effectFn !== activeEffect) {
					effectsToRun.add(effectFn)
				}
			})
	}

	// 当操作类型为 ADD 并且目标对象是数组时，应该取出并执行那些与 length 属性相关的副作用函数
	if (type === TriggerType.ADD && Array.isArray(target)) {
		const lengthEffects = depsMap.get('length')
		// 将这些副作用函数天添加到 effectToRuns 中，待执行
		lengthEffects &&
			lengthEffects.forEach((effectFn) => {
				if (effectFn !== activeEffect) {
					effectsToRun.add(effectFn)
				}
			})
	}

	// 如果操作目标是数组，并且修改了数组的 length 属性
	if (Array.isArray(target) && key === 'length') {
		// 对于索引大于或等于新的 length 值的元素
		// 需要把相关联的副作用函数取出并添加到 effectsToRun 中待执行
		depsMap.forEach((effects, key) => {
			if (key >= newVal) {
				effects.forEach((effectFn) => {
					if (effectFn !== activeEffect) {
						effectsToRun.add(effectFn)
					}
				})
			}
		})
	}

	// 执行 effect 函数
	effectsToRun.forEach((effectFn: any) => {
		// 如果 trigger 触发执行的副作用函数与当前正在执行的副作用函数相同，则不触发执行
		if (activeEffect !== effectFn) {
			// 如果一个副作用函数存在调度器，则调用调度器，并将副作用函数作为参数传递
			if (effectFn.options.scheduler) {
				effectFn.options.scheduler(effectFn)
			} else {
				effectFn()
			}
		}
	})
}
