;
(function() {
	// const todos = [{
	// 		id: 1,
	// 		title: '吃饭',
	// 		completed: true
	// 	},
	// 	{
	// 		id: 2,
	// 		title: '睡觉',
	// 		completed: false
	// 	},
	// 	{
	// 		id: 3,
	// 		title: '写代码',
	// 		completed: true
	// 	}
	// ]

	//主要输入框聚焦---只需要聚焦一次
	Vue.directive('focus', {
		inserted(el, binding) {
			el.focus()
		}
	})

	//编辑输入框聚焦----更新的时候需要聚焦
	Vue.directive('todo-focus', {
		update(el, binding) {
			if (binding.value) {
				el.focus()
			}
		}
	})

	const app = new Vue({
		data: {
			//注意：得到的是字符串需要转换成数组，而且最后要给一个默认值[]
			todos: JSON.parse(window.localStorage.getItem('todos') || '[]'),
			currentEditing: null,
			todoText: 'active'
		},
		methods: {
			handleRemoveOne(index, $event) {
				this.todos.splice(index, 1)
			},

			handleAddLi(e) {
				const target = e.target
				const value = target.value.trim()
				if (!value.length) {
					return
				}
				const newLi =
					this.todos.push({
						id: this.todos.length ? this.todos[this.todos.length - 1].id + 1 : 0,
						title: value,
						completed: false
					})
				target.value = ''
			},

			handleDbllick(item) {
				this.currentEditing = item
			},

			handleEditMsg(item, index, e) {
				const value = e.target.value.trim()
				if (!value.length) {
					return this.todos.splice(index, 1)
				}
				item.title = value
				this.currentEditing = null
			},

			handleEditMsgEsc() {
				this.currentEditing = null
			},

			/* 			handleChange(e) {
							const checked = e.target.checked
							this.todos.forEach((item) => {
								item.completed = checked
							})
						}, */
			handleRemoveAll() {
				this.todos = this.todos.filter(item => !item.completed)
			}
		},
		computed: {
			handleLength() {
				return this.todos.filter(item => !item.completed).length
			},
			toggleAllState: {
				get() {
					return this.todos.every(t => t.completed)
				},
				set() {
					const checked = !this.toggleAllState
					this.todos.forEach((item) => {
						item.completed = checked
					})
				}
			},
			handleSelectState() {
				switch (this.todoText) {
					case 'active':
						return this.todos.filter(t => !t.completed)
						break
					case 'completed':
						return this.todos.filter(t => t.completed)
						break
					default:
						return this.todos
				}
			}
		},
		watch: {
			//监视todos 的变化，当todos变化时执行
			//应用类型只能监视一层，不能监视到内层孩子的而变化
			todos: {
				//两个参数，一个是变化之前监视的值，一个是变化后的值
				handler(val, oldVal) {
					window.localStorage.setItem('todos', JSON.stringify(this.todos))
				},
				deep: true
				// ,immediate: true //立即调用一次
			}
		}
	}).$mount('#app')


	let hashchange = function() {
		app.todoText = window.location.hash.substr(2)
	}
	window.onhashchange = hashchange
	//因为当页面加载的时候hashchange不会执行，所以需要先执行一次
	hashchange()

})()

/**
 *  1. 在todos长度为0的时候，消除footer
 *     - 但是此时main区域的结构仍然处于HTML中，且高度为1px
 *     - 为消除这种影响，一种方式是放在div内用v-if判断，但是会增加DOM操作
 *     - 用template代替这样就不会再HTML中显示了
 *
 *  2. 删除功能
 *  	- 当事件处理函数没有传参的时候，第一个参数就是事件的元对象
 *  	- 当手动传参的时候，就没办法获取默认的事件源对象，需要手动在调用方法的时候传递$event来接收事件源对象
 *  	- v-for可传递数组索引，因此可以根据该索引判断哪个被点击了
 *
 *   3.添加元素
 *      - 元素的id：通过数组的最后一个元素的id加一得到，注意判断数组的长度
 *      - 获取值：绑定事件（修饰符为enter）有一个参数e，e.target即为当前事件的对象
 *
 *   4.编辑：
 *     - 双击时：判断点击的是哪一个，然后将其样式设为editing
 *     - 书写完按enter时：如果为空则删除，否则就保存高数据，且退出编辑状态
 *     - 按esc直接退出编辑状态
 *
 *   5.勾选关联
 *     - 当最上面的input被点击的时候，其余的勾选状态都要与它相同
 *     - 使用计算属性，toggleAllState
 *       - 当没被点击的时候，全选框会根据 toggleAllState来获取当前的应该有的状态
 *       - 当被点击的时候，根据全选框的值去改变其他所有框的状态
 *
 *   6.剩余条数
 *     - 用计算属性来解决
 *
 *   7.缓存数据
 *     - 获取数据的时候根据本地缓存获取
 *       - window.localStorage.getItem()
 *       - 由于todos 保存的时候是字符串，所以应该先转换成数组
 *       - 此时需要设置一个默认值'[]'，不然为空时会报错
 *
 *    8.切换选项
 *     - 使用计算属性：不同的选项对应不同的渲染方法
 *     - 判断当前点击的按钮，从而确定以哪种方式显示
 *     - 通过hash值来判断
 *     - 由于hash值刷新时不触发，会导致最后的结果回到原位
 *     - 因此要提前执行一次hash改变的函数
 *
 *    9.自动聚焦
 *      - 主要输入框聚焦：自定义focus，binding时不稳定，所以在inserted时定义
 *        - 以上均只执行一次即可
 *      - 编辑框聚焦：自定义todo-focus，因为每次模板更新时就会调用---update
 *        - 定义完之后，点击编辑框时所有的编辑框只有第一个聚焦（但是打印时是所有的打印）
 *        - 解决方法，为todo-foucs绑定一个值，这个值需要能够确定哪个被点击了
 *                - 然后通过判断最后决定谁会被聚焦
 */
