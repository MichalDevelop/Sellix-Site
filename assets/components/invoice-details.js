(function (document, window, jQuery, React, ReactDOM, paylixContext, paylixApi) {
  class InvoiceDetailsComponent {
    constructor({ selector, config, shop, invoiceId, invoice, theme, settings = {} }) {
      this.domContainer = document.querySelector(selector);
      this.config = config;
      this.settings = settings;
      this.shop = shop;
      this.invoiceId = invoiceId;
      this.invoice = invoice;
      this.theme = theme;
      this.isVisibleProductDescription = false;
    }

    onGetInvoice = (id) => {
      return paylixApi.getInvoice(id);
    };

    onUpdateInvoice = (data) => {
      return paylixApi.updateInvoice(data);
    };

    onCompleteInvoice = ({ type, invoiceId }) => {
      if (type === 'subscription') {
        window.location.href = `subscription/delivery/${invoiceId}`;
      } else {
        window.location.href = `delivery/${invoiceId}`;
      }
    };

    onToggleShowProductInfo = () => {
      this.isVisibleProductDescription = !this.isVisibleProductDescription;
      jQuery(document).trigger('paylixInvoiceShowProductDescription', { visible: this.isVisibleProductDescription });
    };

    onValidateRecaptcha = (data) => {
      return paylixApi.validateCaptcha(data);
    };

    onPostCashAppIdentifier = (data) => {
      return paylixApi.postCashAppIdentifier(data);
    };

    onGetStripeLink = (id) => {
      return paylixApi.getStripeLink(id);
    };

    onGetProductStripeLink = (id) => {
      return paylixApi.getProductStripeLink(id);
    };

    onShowMessage = ({ type, text }) => {
      jQuery(document).trigger('paylixToastify', { type, text });
    };

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onSuccess = () => {};

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onFail = () => {};

    render() {
      ReactDOM.render(
        React.createElement(window.Invoice.InvoiceDetails, {
          config: paylixContext.getConfig(),
          currencyConfig: paylixContext.getCurrencyConfig(),
          settings: this.settings,
          theme: this.theme,
          invoiceId: this.invoiceId,
          invoiceInfo: this.invoice,
          paylixI18Next: window.paylixI18Next,
          onGetInvoice: this.onGetInvoice,
          onUpdateInvoice: this.onUpdateInvoice,
          onCompleteInvoice: this.onCompleteInvoice,
          onToggleShowProductInfo: this.onToggleShowProductInfo,
          onValidateRecaptcha: this.onValidateRecaptcha,
          onPostCashAppIdentifier: this.onPostCashAppIdentifier,
          onGetStripeLink: this.onGetStripeLink,
          onGetProductStripeLink: this.onGetProductStripeLink,
          onShowMessage: this.onShowMessage,
          onSuccess: this.onSuccess,
          onFail: this.onFail,
        }),
        this.domContainer,
      );
    }
  }

  window.paylixInvoiceDetailsComponent = InvoiceDetailsComponent;
})(document, window, jQuery, React, ReactDOM, paylixContext, paylixApi);
