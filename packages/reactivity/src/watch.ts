import { effect } from './effect'
interface WatchOptions {
	immediate?: boolean
	flush?: 'sync' | 'post' | 'pre'
}

function traverse(value, seen = new Set()) {
	// 如果读取的数据是原始值，或者已经被读取过，那么什么都不做
	if (typeof value !== 'object' || value === null || seen.has(value)) return
	// 将数据添加到 seen 里，代表遍历地读取过了，避免循环引用引起的死循环
	seen.add(value)
	// 暂时不考虑数据等其他数据结构
	// 假设 value 就是个对象，使用 for...in 读取对象的每一个值，并递归地调用 traverse 进行处理
	for (const k in value) {
		traverse(value[k], seen)
	}

	return value
}

/* // 4.9 watch 的实现原理
export function watch(source: any, cb: Function, options: WatchOptions = {}) {
	// 定义 getter
	let getter
	// 如果 source 是函数，说明用户传递的是 getter，直接把 source 赋值给 getter
	if (typeof source === 'function') {
		getter = source
	} else {
		// 否则按照原来的实现调用 traverse 递归地读取
		getter = () => traverse(source)
	}

	// 定义旧值，新值
	let oldValue, newValue
	// 调用 traverse 函数进行递归地读取操作，这样就能读取一个对象上的任意属性，从而任意属性发生变化时都能触发回调执行
	const effectFn = effect(getter, {
		lazy: true,
		// 使用 job 函数作为调度器函数
		scheduler: () => {
			newValue = effectFn()
			cb(newValue, oldValue)
			oldValue = newValue
		},
	})

	oldValue = effectFn()
} */

/* // 4.10 立即执行的 watch 与回调执行时机
export function watch(source: any, cb: Function, options: WatchOptions = {}) {
	// 定义 getter
	let getter
	// 如果 source 是函数，说明用户传递的是 getter，直接把 source 赋值给 getter
	if (typeof source === 'function') {
		getter = source
	} else {
		// 否则按照原来的实现调用 traverse 递归地读取
		getter = () => traverse(source)
	}

	// 定义旧值，新值
	let oldValue, newValue

	// 提取 scheduler 调度函数为一个独立的 job
	const job = () => {
		newValue = effectFn()
		cb(newValue, oldValue)
		oldValue = newValue
	}
	// 调用 traverse 函数进行递归地读取操作，这样就能读取一个对象上的任意属性，从而任意属性发生变化时都能触发回调执行
	const effectFn = effect(getter, {
		lazy: true,
		// 使用 job 函数作为调度器函数
		scheduler: () => {
			// 在调度函数中判断 flush 是否为 post，如果是，则将其放到微任务队列中执行
			if (options.flush === 'post') {
				const p = Promise.resolve()
				p.then(job)
			} else {
				job()
			}
		},
	})

	if (options.immediate) {
		// 当 immediate 为 true 时，立即执行 job，从而触发回调执行
		job()
	} else {
		oldValue = effectFn()
	}
} */

// 4.11 过期的副作用
export function watch(source: any, cb: Function, options: WatchOptions = {}) {
	// 定义 getter
	let getter
	// 如果 source 是函数，说明用户传递的是 getter，直接把 source 赋值给 getter
	if (typeof source === 'function') {
		getter = source
	} else {
		// 否则按照原来的实现调用 traverse 递归地读取
		getter = () => traverse(source)
	}

	// 定义旧值，新值
	let oldValue, newValue

	// cleanup 用来存储用户注册的过期回调
	let cleanup

	// 定义 onInvalidate 函数
	function onInvalidate(fn) {
		// 将过期回调存储到 cleanup 中
		cleanup = fn
	}

	// 提取 scheduler 调度函数为一个独立的 job
	const job = () => {
		newValue = effectFn()
		// 在调用回调函数 cb 之前，先调用过期回调
		if (cleanup) {
			cleanup()
		}
		// 将 onInvalidate 作为回调函数的第三个参数，以便用户调用
		cb(newValue, oldValue, onInvalidate)
		oldValue = newValue
	}
	// 调用 traverse 函数进行递归地读取操作，这样就能读取一个对象上的任意属性，从而任意属性发生变化时都能触发回调执行
	const effectFn = effect(getter, {
		lazy: true,
		// 使用 job 函数作为调度器函数
		scheduler: () => {
			// 在调度函数中判断 flush 是否为 post，如果是，则将其放到微任务队列中执行
			if (options.flush === 'post') {
				const p = Promise.resolve()
				p.then(job)
			} else {
				job()
			}
		},
	})

	if (options.immediate) {
		// 当 immediate 为 true 时，立即执行 job，从而触发回调执行
		job()
	} else {
		oldValue = effectFn()
	}
}
