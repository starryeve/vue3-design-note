import { describe, it, expect, vi, beforeEach } from 'vitest'
import { effect, reactive } from '../../reactivity/src'

import { renderer } from '../src/renderer'

describe('renderer', () => {
	beforeEach(() => {
		vi.useFakeTimers()
	})

	/**
	 * @vitest-environment jsdom
	 */
	it('4.8 计算属性 computed', () => {
		const data = reactive({
			title: '标题',
		})
		let dom = document.createElement('div')

		effect(() => {
			renderer(`<h1>${data.title}</h1>`, dom)
		})

		data.title = '2'

		expect(dom.innerHTML).toBe('<h1>2</h1>')
	})
})
