/* 
// 7.4 自定义渲染器
export interface RendererNode {
	[key: string]: any
}

export interface RendererElement extends RendererNode {}

function createRenderer(options) {
	const { createElement, insert, setElementText } = options

	function mountElement(vnode, container) {
		// 调用 createElement 函数创建元素
		const el = createElement(vnode.type)
		// 处理子节点，如果子节点是字符串，代表元素剧透文本节点
		if (typeof vnode.children === 'string') {
			// 调用 setElementText 去设置元素的文本值
			setElementText(el, vnode.children)
		}

		// 调用 insert 函数将元素插入到容器内
		insert(el, container)
	}

	function patch(n1, n2, container) {
		if (!n1) {
			mountElement(n2, container)
		} else {
		}
	}

	function render(vnode, container) {
		if (vnode) {
			// 新 vnode 存在，将其与旧 vnode 一起传递给 patch 函数
			patch(container._vnode, vnode, container)
		} else {
			if (container._vnode) {
				// 旧 vnode 存在，且新 vnode 不存在，说明是卸载（unmount）行为
				// 只要将 container 内的 dom 清空即可
				container.innerHTML = ''
			}
		}
		// 将 vnode 存储到 container._vnode 下，即后续渲染中的旧 vnode
		container._vnode = vnode
	}

	return {
		render,
	}
}

const renderer = createRenderer({
	createElement(tag) {
		console.log(`创建元素${tag}`)
		return {
			tag,
		}
	},
	setElementText(el, text) {
		console.log(`设置${JSON.stringify(el)}的文本内容：${text}`)
		el.textContent = text
	},
	insert(el, parent, anchor = null) {
		console.log(`将${JSON.stringify(el)}添加到${JSON.stringify(parent)}下`)
		parent.children = el
	},
})

const vnode = {
	type: 'div',
	children: 'hello',
}

const container = {
	type: 'root',
}

renderer.render(vnode, container)
 */

/* // 8.3 正确地设置元素属性
export interface RendererNode {
	[key: string]: any
}

export interface VNode {
	type: string
	props?: {
		[key: string]: any
	}
	children?: VNode[] | string
}

export interface RendererElement extends RendererNode {}

function createRenderer(options) {
	const { createElement, insert, setElementText, patchProps } = options

	function mountElement(vnode: VNode, container) {
		// 调用 createElement 函数创建元素
		const el = createElement(vnode.type)

		// 处理子节点，如果子节点是字符串，代表元素剧透文本节点
		if (typeof vnode.children === 'string') {
			// 调用 setElementText 去设置元素的文本值
			setElementText(el, vnode.children)
		} else if (Array.isArray(vnode.children)) {
			// 如果 children 是一个数组，则遍历每一个字节点，并调用 patch 函数挂载它们
			vnode.children.forEach((child) => {
				// 挂载阶段，没有旧的 vnode，所以第一个参数要传递 null
				patch(null, child, el)
			})
		}

		// 如果 vnode.props 存在
		if (vnode.props) {
			// 遍历 vnode.props
			for (const key in vnode.props) {
				// 调用 patchProps 函数
				patchProps(el, key, null, vnode.props[key])
			}
		}

		// 调用 insert 函数将元素插入到容器内
		insert(el, container)
	}

	function patch(n1, n2, container) {
		if (!n1) {
			mountElement(n2, container)
		} else {
		}
	}

	function render(vnode, container) {
		if (vnode) {
			// 新 vnode 存在，将其与旧 vnode 一起传递给 patch 函数
			patch(container._vnode, vnode, container)
		} else {
			if (container._vnode) {
				// 旧 vnode 存在，且新 vnode 不存在，说明是卸载（unmount）行为
				// 只要将 container 内的 dom 清空即可
				container.innerHTML = ''
			}
		}
		// 将 vnode 存储到 container._vnode 下，即后续渲染中的旧 vnode
		container._vnode = vnode
	}

	return {
		render,
	}
}

function shouldSetAsProps(el, key, value) {
	// 特殊处理
	if (key === 'form' && el.tagName === 'INPUT') return false
	// 兜底
	return key in el
}

const renderer = createRenderer({
	createElement(tag) {
		console.log(`创建元素${tag}`)
		return {
			tag,
		}
	},
	setElementText(el, text) {
		console.log(`设置${JSON.stringify(el)}的文本内容：${text}`)
		el.textContent = text
	},
	insert(el, parent, anchor = null) {
		console.log(`将${JSON.stringify(el)}添加到${JSON.stringify(parent)}下`)
		parent.children = el
	},
	// 将属性设置相关操作封装到 patchProps 函数中，并作为渲染器选项传递
	patchProps(el, key, prevValue, nextValue) {
		if (shouldSetAsProps(el, key, nextValue)) {
			const type = typeof el[key]

			// 如果是 boolean, 并且 value 是空字符串，则将值矫正为 true
			if (type === 'boolean' && nextValue === '') {
				el[key] = true
			} else {
				el[key] = nextValue
			}
		} else {
			// 如果要设置的属性没有对应的 DOM Properties, 则使用 setAttribute 函数设置属性
			el.setAttribute(key, nextValue)
		}
	},
})

const vnode = {
	type: 'div',
	children: 'hello',
}

const container = {
	type: 'root',
}

renderer.render(vnode, container)
 */

/* // 8.4 处理 class(style同理)
export interface RendererNode {
	[key: string]: any
}

export interface VNode {
	type: string
	props?: {
		[key: string]: any
	}
	children?: VNode[] | string
}

export interface RendererElement extends RendererNode {}

function createRenderer(options) {
	const { createElement, insert, setElementText, patchProps } = options

	function mountElement(vnode: VNode, container) {
		// 调用 createElement 函数创建元素
		const el = createElement(vnode.type)

		// 处理子节点，如果子节点是字符串，代表元素剧透文本节点
		if (typeof vnode.children === 'string') {
			// 调用 setElementText 去设置元素的文本值
			setElementText(el, vnode.children)
		} else if (Array.isArray(vnode.children)) {
			// 如果 children 是一个数组，则遍历每一个字节点，并调用 patch 函数挂载它们
			vnode.children.forEach((child) => {
				// 挂载阶段，没有旧的 vnode，所以第一个参数要传递 null
				patch(null, child, el)
			})
		}

		// 如果 vnode.props 存在
		if (vnode.props) {
			// 遍历 vnode.props
			for (const key in vnode.props) {
				// 调用 patchProps 函数
				patchProps(el, key, null, vnode.props[key])
			}
		}

		// 调用 insert 函数将元素插入到容器内
		insert(el, container)
	}

	function patch(n1, n2, container) {
		if (!n1) {
			mountElement(n2, container)
		} else {
		}
	}

	function render(vnode, container) {
		if (vnode) {
			// 新 vnode 存在，将其与旧 vnode 一起传递给 patch 函数
			patch(container._vnode, vnode, container)
		} else {
			if (container._vnode) {
				// 旧 vnode 存在，且新 vnode 不存在，说明是卸载（unmount）行为
				// 只要将 container 内的 dom 清空即可
				container.innerHTML = ''
			}
		}
		// 将 vnode 存储到 container._vnode 下，即后续渲染中的旧 vnode
		container._vnode = vnode
	}

	return {
		render,
	}
}

function shouldSetAsProps(el, key, value) {
	// 特殊处理
	if (key === 'form' && el.tagName === 'INPUT') return false
	// 兜底
	return key in el
}

const renderer = createRenderer({
	createElement(tag) {
		console.log(`创建元素${tag}`)
		return {
			tag,
		}
	},
	setElementText(el, text) {
		console.log(`设置${JSON.stringify(el)}的文本内容：${text}`)
		el.textContent = text
	},
	insert(el, parent, anchor = null) {
		console.log(`将${JSON.stringify(el)}添加到${JSON.stringify(parent)}下`)
		parent.children = el
	},
	// 将属性设置相关操作封装到 patchProps 函数中，并作为渲染器选项传递
	patchProps(el, key, prevValue, nextValue) {
		// 对 class 进行特殊处理
		if (key === 'class') {
			el.className = nextValue || ''
		} else if (shouldSetAsProps(el, key, nextValue)) {
			const type = typeof el[key]
			// 如果是 boolean, 并且 value 是空字符串，则将值矫正为 true
			if (type === 'boolean' && nextValue === '') {
				el[key] = true
			} else {
				el[key] = nextValue
			}
		} else {
			// 如果要设置的属性没有对应的 DOM Properties, 则使用 setAttribute 函数设置属性
			el.setAttribute(key, nextValue)
		}
	},
})

const vnode = {
	type: 'div',
	children: 'hello',
}

const container = {
	type: 'root',
}

renderer.render(vnode, container)
 */

// 8.5 卸载操作
export interface RendererNode {
	[key: string]: any
}

export interface VNode {
	el: any
	type: string
	props?: {
		[key: string]: any
	}
	children?: VNode[] | string
}

export interface RendererElement extends RendererNode {}

function createRenderer(options) {
	const { createElement, insert, setElementText, patchProps } = options

	function mountElement(vnode: VNode, container) {
		// 调用 createElement 函数创建元素同时让 vnode.el 引用真实 DOM 元素
		const el = (vnode.el = createElement(vnode.type))

		// 处理子节点，如果子节点是字符串，代表元素剧透文本节点
		if (typeof vnode.children === 'string') {
			// 调用 setElementText 去设置元素的文本值
			setElementText(el, vnode.children)
		} else if (Array.isArray(vnode.children)) {
			// 如果 children 是一个数组，则遍历每一个字节点，并调用 patch 函数挂载它们
			vnode.children.forEach((child) => {
				// 挂载阶段，没有旧的 vnode，所以第一个参数要传递 null
				patch(null, child, el)
			})
		}

		// 如果 vnode.props 存在
		if (vnode.props) {
			// 遍历 vnode.props
			for (const key in vnode.props) {
				// 调用 patchProps 函数
				patchProps(el, key, null, vnode.props[key])
			}
		}

		// 调用 insert 函数将元素插入到容器内
		insert(el, container)
	}

	function patch(n1, n2, container) {
		if (n1 && n1.type !== n2.type) {
			// 如果新旧 vnode 的类型不同，则直接将旧 vnode 卸载
			unmount(n1)
			// 卸载完成，n1 还需要置为 null, 才能保证后续挂载操作正确执行
			n1 = null
		}

		// 代码运行到这里，证明 n1 和 n2 所描述的内容相同
		const { type } = n2
		if (typeof type === 'string') {
			// 描述的是个标签
			if (!n1) {
				mountElement(n2, container)
			} else {
			}
		} else if (typeof type === 'object') {
			// 描述的是个组件
		} else {
			// 描述的是其他类型的 vnode
		}
	}

	function unmount(vnode) {
		// 获取 el 的父元素
		const parent = vnode.el.parentNode
		// 调用 removeChild 移除元素
		if (parent) {
			parent.removeChild(vnode.el)
		}
	}

	function render(vnode, container) {
		if (vnode) {
			// 新 vnode 存在，将其与旧 vnode 一起传递给 patch 函数
			patch(container._vnode, vnode, container)
		} else {
			if (container._vnode) {
				// 旧 vnode 存在，且新 vnode 不存在，说明是卸载（unmount）行为
				unmount(container._vnode)
			}
		}
		// 将 vnode 存储到 container._vnode 下，即后续渲染中的旧 vnode
		container._vnode = vnode
	}

	return {
		render,
	}
}

function shouldSetAsProps(el, key, value) {
	// 特殊处理
	if (key === 'form' && el.tagName === 'INPUT') return false
	// 兜底
	return key in el
}

export const renderer = createRenderer({
	createElement(tag) {
		console.log(`创建元素${tag}`)
		return {
			tag,
		}
	},
	setElementText(el, text) {
		console.log(`设置${JSON.stringify(el)}的文本内容：${text}`)
		el.textContent = text
	},
	insert(el, parent, anchor = null) {
		console.log(`将${JSON.stringify(el)}添加到${JSON.stringify(parent)}下`)
		parent.children = el
	},
	// 将属性设置相关操作封装到 patchProps 函数中，并作为渲染器选项传递
	patchProps(el, key, prevValue, nextValue) {
		if (shouldSetAsProps(el, key, nextValue)) {
			const type = typeof el[key]

			// 如果是 boolean, 并且 value 是空字符串，则将值矫正为 true
			if (type === 'boolean' && nextValue === '') {
				el[key] = true
			} else {
				el[key] = nextValue
			}
		} else {
			// 如果要设置的属性没有对应的 DOM Properties, 则使用 setAttribute 函数设置属性
			el.setAttribute(key, nextValue)
		}
	},
})

const vnode = {
	type: 'div',
	children: 'hello',
}

const container = {
	type: 'root',
}

renderer.render(vnode, container)
