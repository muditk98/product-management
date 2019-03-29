const DEFAULT_TAX = 7
class Category {
	constructor(name, parent, tax) {
		this.name = name
		this.children_ids = []
		this.product_ids = []
		this.tax = tax || (parent ? parent.tax : DEFAULT_TAX) || DEFAULT_TAX
		Category.count = Category.count || 0
		this.id = Category.count
		Category.count++
		if (parent) {
			this.parent_id = parent.id
			parent.children_ids.push(this.id)
		} else {
			this.parent_id = 0
		}
	}
	stage() {
		let staged_category = {
			id: this.id,
			name: this.name,
			parent_id: this.parent_id,
			tax: this.tax,
			children_ids: this.children_ids,
			product_ids: this.product_ids,
			links: [
				{
					rel: 'self',
					href: `/categories/${this.id}`,
					method: `GET`
				},
				{
					rel: 'parent',
					href: `/categories/${this.parent_id}`,
					method: `GET`
				},
				{
					rel: 'update',
					href: `/categories/${this.id}`,
					method: `PUT`
				},
				{
					rel: 'delete',
					href: `/categories/${this.id}`,
					method: `DELETE`
				},
			]
		}
		return staged_category
	}
	removeProduct(id) {
		this.product_ids = this.product_ids.filter(pid => pid != id)
	}
	removeChild(id) {
		this.children_ids = this.children_ids.filter(cid => cid != id)
	}
}

class Product {
	constructor(name, category, brand, price, attributes) {
		this.name = name
		this.brand = brand
		this.attributes = attributes
		this.price = price
		Product.count = Product.count ? Product.count + 1 : 1
		this.id = Product.count
		this.instance_count = 0
		if (category) {
			this.category_id = category.id
			category.product_ids.push(this.id)
		}
	}
	newProductInstance() {
		return this.id.toString().padStart(5, '0') + "-" + (++this.instance_count).toString().padStart(5, '0')
	}
	stage() {
		let staged_product = {}
		staged_product.id = this.id
		staged_product.name = this.name
		staged_product.brand = this.brand
		staged_product.attributes = this.attributes
		staged_product.price = this.price
		staged_product.category_id = this.category_id
		staged_product.links = [
			{
				rel: 'self',
				href: `/products/${this.id}`,
				method: 'GET'
			},
			{
				rel: 'category',
				href: `/categories/${this.category_id}`,
				method: 'GET'
			},
			{
				rel: 'instantiate',
				href: `/products/${this.id}`,
				method: 'POST'
			},
			{
				rel: 'delete',
				href: `/products/${this.id}`,
				method: 'DELETE'
			},
			{
				rel: 'update',
				href: `/products/${this.id}`,
				method: 'PUT'
			},
			
		]
		return staged_product
	}
}
/* 
attributes = {
	metadata,
	media,
	live,
	physical,
	family
	...
}
 */
exports.Category = Category
exports.Product = Product
exports.DEFAULT_TAX = DEFAULT_TAX

let root_cat = new Category('ROOT')
let category_samples = [
	root_cat,
	new Category('food', root_cat, 5),
	new Category('electronic', root_cat, 18)
]
category_samples.push(new Category('Laptops', category_samples[category_samples.length-1]))
exports.category_samples = category_samples
exports.product_samples = [
	new Product('Lays', category_samples[1], 'Frito', 10),
	new Product('Nintendo Switch', category_samples[2], 'Nintendo', 100000)
]