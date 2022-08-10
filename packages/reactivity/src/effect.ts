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
	if (!getActiveEffect()) return target[key]
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
	if (!getActiveEffect()) return target[key]
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
	if (!getActiveEffect()) return target[key]
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
	if (!getActiveEffect()) return target[key]
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

// 4.7 调度执行
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
	if (!getActiveEffect()) return target[key]
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
