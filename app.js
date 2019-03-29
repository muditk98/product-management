const express = require('express')
const cors = require('cors')
let models = require('./models')
let app = express()
app.use(express.urlencoded({
	extended: true
}))
app.use(express.json())
app.use(cors())
app.locals.categories = models.category_samples
app.locals.products = models.product_samples

app.get('/', (req, res) => {
	res.json('Home')
})

app.get('/products', (req, res) => {
	res.send(
		app.locals.products
			.filter(value => RegExp(req.query.name || '', 'i').test(value.name))
			.map(value => value.stage())
	)
})

app.post('/products', (req, res) => {
	console.log(req.body);
	
	if (!req.body) {
		res.status(400).send({
			success: false,
			message: "Product not posted"
		})
		return
	}
	let category = app.locals.categories.find(cat => cat.id == req.body.category_id)
	let product = req.body
	if (category && product.name && product.brand && product.price > 0) {
		let prod = new models.Product(
			product.name,
			category,
			product.brand,
			product.price,
			product.attributes || {}
		)
		app.locals.products.push(prod)
		res.send({
			success: true,
			id: prod.id,
			uri: `/products/${prod.id}`
		})
	} else {
		res.status(400).send({
			success: false,
			message: "Invalid request body"
		})
	}
})

app.get('/products/:id', (req, res) => {
	let prod = app.locals.products.find(value => value.id == req.params.id)
	if (prod) {
		res.send(prod.stage())
	} else {
		res.status(404).send()
	}
})

app.delete('/products/:id', (req, res) => {
	if (req.params.id == 0) {
		res.status(403).send('Cannot delete root category')
		return;
	}
	let prod_index = app.locals.products.findIndex(prod => prod.id == req.params.id)
	if (prod_index == -1) {
		res.status(404).send({
			success: false,
			message: 'Product not found'
		})
	} else {
		let prod = app.locals.products.splice(prod_index, 1)
		console.log(prod);
		let cat = app.locals.categories.find(ct => ct.id == prod[0].category_id)
		cat.removeProduct(prod.id)
		res.send({
			success: true,
			message: 'deleted'
		})
	}
})

app.put('/products/:id', (req, res) => {
	let prod = app.locals.products.find(value => value.id == req.params.id)
	if (prod) {
		let product  = req.body
		prod.name = product.name || prod.name
		let cat = app.locals.categories.find(cat => cat.id = product.category_id)
		if (cat) {
			app.locals.categories.find(cat => cat.id = prod.category_id).removeProduct(prod.id)
			cat.product_ids.push(prod.id)
			prod.category_id = cat.id
		}
		prod.brand = product.brand || prod.brand
		prod.price = product.price || prod.price
		Object.keys(product.attributes).forEach(key => {
			prod.attributes[key] = prod.attributes[key]
		})
		res.send(prod.stage())
	} else {
		res.status(404).send()
	}
})

app.post('/products/:id', (req, res) => {
	let prod = app.locals.products.find(value => value.id == req.params.id)
	if (prod) {
		let product_instances = []
		for (let i = 0; i < req.body.instances; i++) {
			product_instances.push(prod.newProductInstance())
		}
		res.send(product_instances)
	} else {
		res.status(404).send()
	}
})




app.get('/categories', (req, res) => {
	res.send(
		app.locals.categories
		.filter(value => RegExp(req.query.name || '', 'i').test(value.name))
		.map(value => value.stage())
	)
})

app.post('/categories', (req, res) => {
	if (!req.body) {
		res.status(400).send({
			success: false,
			message: "Category not posted"
		})
		return
	}
	let parent = app.locals.categories.find(cat => cat.id == req.body.parent_id)
	let category = req.body
	category.tax = category.tax || models.DEFAULT_TAX
	if (parent && category.name && category.tax >= 0 && category.tax <= 100) {
		let cat = new models.Category(
			category.name,
			parent,
			category.brand,
		)
		app.locals.categories.push(cat)
		res.send({
			success: true,
			id: cat.id,
			uri: `/categories/${cat.id}`
		})
	} else {
		res.status(400).send({
			success: false,
			message: "Parent category with given id doesn't exist or tax is invalid"
		})
	}
})

app.get('/categories/:id', (req, res) => {
	let cat = app.locals.categories.find(value => value.id == req.params.id)
	if (cat) {
		res.send(cat.stage())
	} else {
		res.status(404).send()
	}
})

app.delete('/categories/:id', (req, res) => {
	let cat_index = app.locals.categories.findIndex(cat => cat.id == req.params.id)
	if (cat_index == -1) {
		res.status(404).send({
			success: false,
			message: 'Category not found'
		})
	} else {
		let cat = app.locals.categories.splice(cat_index, 1)
		app.locals.products = app.locals.products.filter(prod => !(prod.id in cat[0].product_ids))
		app.locals.categories.filter(ct => ct.parent_id == cat.id).forEach(ct => ct.parent_id = 0)
		res.send({
			success: true,
			message: 'deleted'
		})
	}
})

app.put('/categories/:id', (req, res) => {
	let cat = app.locals.categories.find(value => value.id == req.params.id)
	if (cat) {
		let category = req.body
		cat.name = category.name || cat.name
		let parent = app.locals.categories.find(ct => ct.parent_id == category.parent_id)
		if (parent) {
			app.locals.categories.find(ct => ct.parent_id == cat.parent_id).removeChild(cat.id)
			parent.children_ids.push(cat.id)
			cat.parent_id = parent.id
		}
		cat.tax = category.tax || cat.tax
		res.send(cat.stage())
	} else {
		res.status(404).send()
	}
})

app.listen(3000, () => {
	console.log('Started on port 3000');
})