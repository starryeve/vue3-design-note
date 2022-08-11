import { describe, it } from 'vitest'

describe('reactive', () => {
	it('5.1 理解 Proxy 与 Reflect', () => {
		const obj = {
			_age: 1,
			get age() {
				return this.age
			},
		}
	})
})
