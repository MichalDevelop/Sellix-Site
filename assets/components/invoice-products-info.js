(function (document, window, jQuery, paylixApi) {
  class InvoiceProductsInfoComponent {
    constructor(selector, invoice, renderOptions, properties) {
      this.selector = selector;
      this.invoice = invoice;
      this.renderOptions = renderOptions;
      this.properties = properties;
    }

    render() {
      if (this.invoice.type === 'SUBSCRIPTION') {
        this.renderComponent({
          snippetName: 'Invoice product info',
          dependencies: [],
        });
      } else if (this.invoice.type === 'SHOPPING_CART') {
        this.renderComponent({
          snippetName: 'Invoice product info',
          dependencies: [],
        });
      } else {
        this.renderComponent({
          snippetName: 'Invoice product info',
          dependencies: [{ type: 'product', productId: this.invoice.product_id }],
        });
      }
    }

    renderComponent({ snippetName, dependencies }) {
      paylixApi
        .renderComponent(
          {
            ...this.renderOptions,
            path: [this.renderOptions.path, ['snippet', snippetName].join(':')].join(';'),
          },
          {
            dependencies,
            invoice: this.invoice,
            properties: this.properties,
          },
        )
        .then((resp) => {
          const $component = jQuery(resp.html);
          jQuery(this.selector).html($component);
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

  window.paylixInvoiceProductsInfoComponent = InvoiceProductsInfoComponent;
})(document, window, jQuery, paylixApi);
