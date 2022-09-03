export const isString = (val: unknown): val is string => typeof val === 'string'
export const isSymbol = (val: unknown): val is symbol => typeof val === 'symbol'
export const isObject = (val: unknown): val is Record<any, any> => val !== null && typeof val === 'object'
export const isArray = Array.isArray

export function normalizeClass(value: unknown): string {
	let res = ''
	if (isString(value)) {
		res = value
	} else if (isArray(value)) {
		for (let i = 0; i < value.length; i++) {
			const normalized = normalizeClass(value[i])
			if (normalized) {
				res += normalized + ' '
			}
		}
	} else if (isObject(value)) {
		for (const name in value) {
			if (value[name]) {
				res += name + ' '
			}
		}
	}
	return res.trim()
}
