(function (document, window, jQuery, React, ReactDOM, paylixStoreFactory, paylixApi, paylixHelper) {
  class InvoiceCheckoutComponent {
    constructor({ selector, config, theme, shop, invoiceId, invoice, options }) {
      this.domContainer = document.querySelector(selector);
      this.config = config;
      this.theme = theme;
      this.shop = shop;
      this.invoiceId = invoiceId;
      this.invoice = invoice;
      this.options = options;
    }

    onGetInvoice = (id) => {
      return paylixApi.getInvoice(id);
    };

    onUpdateInvoice = (data) => {
      return paylixApi.updateInvoice(data);
    };

    onGetInvoiceSecret = (shopName, id) => {
      const shopStore = paylixStoreFactory.getStore(shopName);
      const invoices = shopStore.get('invoices') || {};
      return (invoices[id] || {}).secret;
    };

    onGetInvoiceInfo = (id, secret) => {
      return paylixApi.getInvoiceInfo(id, secret);
    };

    onGetInvoiceTelegramInfo = (id, secret) => {
      return paylixApi.getInvoiceTelegramInfo(id, secret);
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

    onGetFeedback = (id) => {
      return paylixApi.getFeedback(id);
    };

    onCreateFeedback = (data) => {
      return paylixApi.leaveFeedback(data);
    };

    onSaveInvoiceToFile = (shopName, id, productType) => {
      paylixHelper.saveInvoiceToFile(shopName, id, productType);
    };

    onShowMessage = ({ type, text }) => {
      jQuery(document).trigger('paylixToastify', { type, text });
    };

    onGetInsightsTransaction = (data) => {
      return paylixApi.getInsightsTransaction(data);
    };

    onInsertInsights = (data) => {
      return paylixApi.insertInsights(data);
    };

    onGetEvmSpenders = () => {
      return paylixApi.getEvmSpenders();
    };

    onSaveEvm = (data) => {
      return paylixApi.saveEvm(data);
    };

    onPayEvm = (data) => {
      return paylixApi.payEvm(data);
    };

    render() {
      ReactDOM.render(
        React.createElement(InvoiceCheckout.InvoiceCheckout, {
          config: this.config,
          currencyConfig: paylixContext.getCurrencyConfig(),
          theme: this.theme,
          shop: this.shop,
          invoiceId: this.invoiceId,
          invoice: this.invoice,
          options: this.options,
          paylixI18Next: window.paylixI18Next,
          onGetInvoice: this.onGetInvoice,
          onUpdateInvoice: this.onUpdateInvoice,
          onGetInvoiceSecret: this.onGetInvoiceSecret,
          onGetInvoiceInfo: this.onGetInvoiceInfo,
          onGetInvoiceTelegramInfo: this.onGetInvoiceTelegramInfo,
          onGetFeedback: this.onGetFeedback,
          onCreateFeedback: this.onCreateFeedback,
          onPostCashAppIdentifier: this.onPostCashAppIdentifier,
          onGetStripeLink: this.onGetStripeLink,
          onGetProductStripeLink: this.onGetProductStripeLink,
          onSaveInvoiceToFile: this.onSaveInvoiceToFile,
          onShowMessage: this.onShowMessage,
          onGetInsightsTransaction: this.onGetInsightsTransaction,
          onInsertInsights: this.onInsertInsights,
          onGetEvmSpenders: this.onGetEvmSpenders,
          onSaveEvm: this.onSaveEvm,
          onPayEvm: this.onPayEvm,
        }),
        this.domContainer,
      );
    }
  }

  window.paylixInvoiceCheckoutComponent = InvoiceCheckoutComponent;
})(document, window, jQuery, React, ReactDOM, paylixStoreFactory, paylixApi, paylixHelper);
