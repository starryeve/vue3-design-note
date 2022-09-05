import { reactive, effect } from '../../src'

const obj = reactive({
	foo: {
		bar: 1,
	},
})

effect(() => {
	console.log(obj.foo.bar)
})
obj.foo.bar++
