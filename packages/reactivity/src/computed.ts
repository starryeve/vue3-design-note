import { effect, track, trigger } from './effect'

export function computed(getter: Function) {
	// value 用来缓存上一次计算的值
	let value
	// dirty 用来标识是否需要重新计算值
	let dirty = true

	// 将 getter 作为一个副作用函数，创建一个 lazy 的 effect
	const effectFn = effect(getter, {
		lazy: true,
		// 添加调度器，在调度器中将 dirty 重置为 true
		scheduler() {
			dirty = true
			// 当计算属性依赖的响应式数据变化时，手动调用 trigger 函数触发响应
			trigger(obj, 'value')
		},
	})

	const obj = {
		// 当读取 value 的时候，才会执行 effectFn
		get value() {
			if (dirty) {
				value = effectFn()
				// 将 dirty 置为 false, 下一次访问直接使用缓存到 value 中的值
				dirty = false
			}
			// 当读取 value 时，手动调用 track 函数进行追踪
			track(obj, 'value')
			return value
		},
	}

	return obj
}
