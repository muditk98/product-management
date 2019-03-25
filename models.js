const DEFAULT_TAX = 18
class Category {
	constructor(name, parent, tax) {
		this.name = name
		this.children_ids = []
		this.product_ids = []
		this.tax = tax || (parent ? parent.tax : DEFAULT_TAX) || DEFAULT_TAX
		Category.count = Category.count ? Category.count + 1 : 1
		this.id = Category.count
		if (parent) {
			this.parent_id = parent.id
			parent.children.push(this.id)
		} else {
			this.parent_id = 0
		}
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
			category.products.push(this.id)
		}
	}
	newProductInstance() {
		return this.id.toString().padStart(5, '0') + "-" + (++this.instance_count).toString().padStart(5, '0')
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