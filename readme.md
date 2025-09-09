# Green Earth - Assignment-006

This is a vanilla HTML/CSS/JavaScript project built to satisfy the Assignment-006 requirements.

## How to run
1. Unzip the project folder.
2. Open `index.html` in the browser.
3. The app will fetch categories and plants from the public API:
   - https://openapi.programming-hero.com/api/categories
   - https://openapi.programming-hero.com/api/category/{id}
   - https://openapi.programming-hero.com/api/plant/{id}
4. You can add items to the cart; cart is persisted in `localStorage`.

---

## Project Features Implemented
- Navbar (Logo left, menu center, Plant a Tree button right)
- Banner with title, subtitle and centered CTA
- Category list (loads dynamically)
- On category click -> plants load (3-column grid)
- Product cards include image, name, short description, price and Add to Cart button
- Clicking product name opens modal with full details
- Cart system: add items, remove items, total calculation, persisted in localStorage
- Loading spinner while fetching data
- Active category highlighting
- About section, Impact section, Form + Footer

---

## Answers (README question section)

### 1) Difference between var, let, and const
- `var` is function-scoped or globally-scoped. It is hoisted and can be redeclared. Avoid using `var` in modern JS.
- `let` is block-scoped. It can be updated but not redeclared in the same scope.
- `const` is block-scoped. It must be initialized at declaration and cannot be reassigned (but objects can be mutated).

### 2) Difference between map(), forEach(), and filter()
- `forEach()` iterates over an array and executes a function for each element. It returns `undefined`.
- `map()` creates and returns a new array by applying the callback to each element.
- `filter()` creates and returns a new array with elements that pass the test in the callback.

### 3) Arrow functions in ES6
Arrow functions provide a shorter syntax for function expressions: `const add = (a,b) => a+b`. They do not have their own `this`, `arguments`, or `super`, so they are not suitable as object methods or constructors.

### 4) Destructuring assignment in ES6
Destructuring lets you unpack values from arrays or objects into distinct variables:
```js
const [a,b] = [1,2];
const {name, age} = {name:'nure alom', age:21};
```

### 5) Template literals in ES6
Template literals (backticks) allow interpolation and multi-line strings:
```js
const name='nure alom';
const str = `Hello ${name}, welcome!`;
```
They are easier and clearer than string concatenation (`'Hello ' + name + '!'`).

---

## Notes
- Carousel images and the campaign image are left as placeholders (you mentioned you'll add them later).
- This uses only vanilla JS (no framework). It is responsive for basic breakpoints.