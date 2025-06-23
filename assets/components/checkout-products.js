(function (document, window, jQuery, paylixApi, paylixHelper) {
  class CheckoutProductsComponent {
    constructor(selector, cart, renderOptions, properties) {
      this.cart = cart;
      this.renderOptions = renderOptions;
      this.properties = properties;

      this.$products = jQuery(selector);

      this.renderEvents = ['paylixCartUpdateEvent', 'paylixRenderComponent'].map((eventName) => {
        return paylixHelper.getEventName({
          name: eventName,
          namespace: renderOptions.id,
        });
      });
      jQuery(document).on(this.renderEvents.join(' '), (e, eventInfo) => {
        if (eventInfo && eventInfo.productId) {
          this.renderProduct(eventInfo.productId);
        }
      });
    }

    renderProduct(productId) {
      const product = this.cart.getItemById(productId);
      if (product && !this.$products.find(`#paylix-product-checkout-${productId}`).length) {
        paylixApi
          .renderComponent(
            {
              ...this.renderOptions,
              path: [this.renderOptions.path, ['snippet', 'Checkout product'].join(':')].join(';'),
            },
            {
              dependencies: [{ type: 'product', productId }],
              quantity: product.quantity,
              properties: this.properties,
            },
          )
          .then((resp) => {
            const $component = $(resp.html);
            this.$products.append($component);
            setTimeout(function () {
              const eventName = paylixHelper.getEventName({
                name: 'paylixRenderComponent',
                namespace: resp.id,
              });
              $(document).trigger(eventName, { productId: product.uniqid });
            });
          })
          .catch((resp) => {
            const respJson = resp.responseJSON || {};
            jQuery(document).trigger('paylixToastify', {
              type: 'error',
              text: respJson.message || 'Internal server error',
            });
          });
      }
    }
  }
  window.paylixCheckoutProductsComponent = CheckoutProductsComponent;
})(document, window, jQuery, paylixApi, paylixHelper);
