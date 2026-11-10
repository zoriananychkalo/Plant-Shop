# Worksheet answers
1. 404 page: views/404.hbs, used by /product/:id (no match) and a catch-all route at the bottom of app.js.
2. After changing products.json you must restart the server: the file is read once at startup (require) and kept in memory.
3. Product 10 (Mist Sprayer) added to products.json with image public/images/products/product-10.svg. It appears in /shop, /product/10 and the cart.
4. /shop groups products by category in app.js; shop.hbs writes <h2>{{name}}</h2> per category (product names became <h3>).
5. Add 3 items, DevTools > Application > Local Storage > localhost:3000, key "cart", e.g. [{"id":"1","qty":2}]. Changing a quantity on /cart changes "qty".
6. With css/styles.css (no /), /shop still works (resolves to /css/styles.css) but /product/1 looks for /product/css/styles.css, which doesn't exist, so the page is unstyled. The leading / means "from the site root".
