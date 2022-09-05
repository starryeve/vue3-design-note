import { describe, expect, it, vi } from 'vitest'
import { effect, reactive } from '../src'
import { ref, toRef, toRefs } from '../src/ref'

describe('ref', () => {
	it('6.1 ref', () => {
		const count = ref(0)

		const fn = vi.fn(() => {
			console.log(count.value)
		})

		effect(fn)

		count.value++

		expect(fn).toHaveBeenCalledTimes(2)
	})

	it('6.2 响应丢失问题', () => {
		const obj = reactive({
			foo: 1,
			bar: 2,
		})

		const newObj = {
			...toRefs(obj),
		}
		const fn = vi.fn(() => {
			console.log(newObj.foo.value)
		})

		effect(fn)
		newObj.foo.value++
		expect(fn).toHaveBeenCalledTimes(2)
	})
})
