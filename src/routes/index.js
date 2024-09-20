const productRoutes = require("./product.route");
const cartRoutes = require("./cart.route");
const routes = (app) => {
  app.use("/product", productRoutes);
  app.use("/cart", cartRoutes);
};

module.exports = routes;
