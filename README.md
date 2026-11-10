- install libraries required
npm install
- run the server
node app.js
## Shop and cart

- Products are in `data/products.json`. Edit this file to use your own products and images (put images in `public/images/products/`).
- `/shop` lists every product, `/product/1` shows one product, `/cart` shows the cart, `/checkout` is yours to design.
- The cart is saved in the browser's localStorage by `public/js/cart.js`. Any button with `data-add-to-cart="ID"` adds that product.
- To restyle the cart rows, edit `cartItemHTML()` at the top of `cart.js` or style its class names in your CSS.
