(function (
  document,
  window,
  jQuery,
  React,
  ReactDOM,
  paylixContext,
  paylixStoreFactory,
  paylixAddonsStore,
  paylixPriceVariantsStore,
  paylixApi,
) {
  class PurchaseDetailsComponent {
    constructor({
      selector,
      selectorCaptchaV2,
      shop,
      cartEnabled,
      isCustomDomain,
      purchaseType,
      cart,
      product,
      bundles,
      theme,
      renderOptions,
      affiliateConversions,
    }) {
      this.domContainer = document.querySelector(selector);
      this.selectorCaptchaV2 = selectorCaptchaV2;
      this.shop = shop;
      this.affiliateConversions = affiliateConversions;
      this.cartEnabled = cartEnabled;
      this.isCustomDomain = isCustomDomain;
      this.purchaseType = purchaseType;
      this.cart = cart;
      this.product = product;
      this.bundles = bundles;
      this.theme = theme || {};
      this.renderOptions = renderOptions;
      this.isCaptchaV2Visible = false;
      this.shopStore = paylixStoreFactory.getStore(this.shop.name);

      this.addonsStore = new paylixAddonsStore(
        shop.name,
        this.purchaseType === 'checkout'
          ? Object.fromEntries(this.cart.getItems().map((p) => [p.uniqid, p.addons]))
          : { [product.uniqid]: product.addons },
      );
      this.priceVariantsStore = new paylixPriceVariantsStore(shop.name);

      const renderEvent = paylixHelper.getEventName({
        name: 'paylixRenderComponent',
        namespace: renderOptions.id,
      });
      jQuery(document).on(
        ['paylixCartUpdateEvent', 'paylixAddonsUpdateEvent', 'paylixVariantsUpdateEvent', renderEvent].join(' '),
        () => {
          this.render();
        },
      );
    }

    onApplyCoupon = (data) => {
      return paylixApi.checkCoupon(data);
    };

    onCreateInvoice = (data, token) => {
      return paylixApi
        .createInvoice(data, {
          token: token,
          useCaptchaV2: true,
          selectorCaptchaV2: this.selectorCaptchaV2,
          theme: this.theme.isDark ? 'dark' : 'light',
          onShowCaptchaV2: (visible) => {
            this.isCaptchaV2Visible = visible;
            this.render();
          },
        })
        .then((response) => {
          const { status, data } = response;
          if (status === 200) {
            const { invoice } = data;
            if (invoice) {
              const invoices = this.shopStore.get('invoices') || {};
              invoices[invoice.uniqid] = {
                uniqid: invoice.uniqid,
                secret: invoice.secret,
              };
              this.shopStore.set('invoices', invoices);
            }
          }
          return response;
        });
    };

    onCustomerAuthEmail = (data) => {
      return paylixApi.customerAuthEmail({ shop_id: this.shop.id, ...data });
    };

    onCustomerAuthCode = (data) => {
      return paylixApi.customerAuthCode({ shop_id: this.shop.id, ...data });
    };

    onShowMessage = ({ type, text }) => {
      jQuery(document).trigger('paylixToastify', { type, text });
    };

    onShowProductTerms = () => {
      jQuery('#product-terms-modal').modal({
        modalClass: '',
        blockerClass: '',
        showClose: false,
      });
    };

    onChangeProductQuantity = (uniqid, quantity) => {
      let changed = false;
      if (this.purchaseType === 'checkout') {
        const cartProduct = this.cart.getItemById(uniqid);
        if (quantity > cartProduct.quantity) {
          this.cart.add({ uniqid }, quantity - cartProduct.quantity);
          changed = true;
        } else if (quantity < cartProduct.quantity) {
          this.cart.remove(uniqid, cartProduct.quantity - quantity);
          changed = true;
        }
      } else {
        if (this.product.quantity !== quantity) {
          this.product = {
            ...this.product,
            quantity,
          };
          changed = true;
        }
      }

      if (changed) {
        this.render();
      }
    };

    onChangeStep = (step) => {
      jQuery(document).trigger('paylixPurchaseDetailsChangeStep', { step });
    };

    onAddToCart = (uniqid, quantity) => {
      let cartProduct;
      if (this.purchaseType === 'checkout') {
        cartProduct = this.cart.getItemById(uniqid);
      } else if (this.purchaseType === 'product' && this.product.uniqid === uniqid) {
        cartProduct = this.product;
      }

      if (!cartProduct) {
        return;
      }

      if (quantity > 0) {
        this.cart.add(cartProduct, quantity);
      } else if (quantity < 0) {
        this.cart.remove(uniqid, quantity);
      }
    };

    onChangeData = ({ type, value }) => {
      // console.log('Change', type, value);
    };

    onSuccess = ({ type, invoice }) => {
      switch (type) {
        case 'invoice-trial':
          break;
        case 'invoice':
          this.cart.clear().then(() => {
            window.location.href = `https://checkout.paylix.gg/invoice/${invoice.uniqid}`;
          });
          break;
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onFail = () => {};

    onInsertInsights = (data) => {
      return paylixApi.insertInsights(data);
    };

    render() {
      const cartProducts = this.cart.getItems();

      ReactDOM.render(
        React.createElement(Purchase.PurchaseDetails, {
          type: this.purchaseType,
          config: paylixContext.getConfig(),
          currencyConfig: paylixContext.getCurrencyConfig(),
          isCartEnabled: this.cartEnabled,
          isCustomDomain: this.isCustomDomain,
          shopInfo: this.shop,
          productInfo: this.product || {},
          cartProducts: cartProducts,
          addons: this.addonsStore.getAll(),
          bundles: this.bundles,
          affiliateConversions: this.affiliateConversions,
          priceVariants: this.priceVariantsStore.getAll(),
          theme: { isDark: this.theme.isDark },
          paylixHelper: window.paylixHelper,
          paylixI18Next: window.paylixI18Next,
          onAddToCart: this.onAddToCart,
          onApplyCoupon: this.onApplyCoupon,
          onCreateInvoice: this.onCreateInvoice,
          onShowMessage: this.onShowMessage,
          onShowProductTerms: this.onShowProductTerms,
          onChangeProductQuantity: this.onChangeProductQuantity,
          onChangeStep: this.onChangeStep,
          onCustomerAuthEmail: this.onCustomerAuthEmail,
          onCustomerAuthCode: this.onCustomerAuthCode,
          onInsertInsights: this.onInsertInsights,
          onSuccess: this.onSuccess,
          onFail: this.onFail,
          onChangeData: this.onChangeData,
          options: {
            isCaptchaV2Visible: this.isCaptchaV2Visible,
          },
        }),
        this.domContainer,
      );
    }
  }

  window.paylixPurchaseDetailsComponent = PurchaseDetailsComponent;
})(
  document,
  window,
  jQuery,
  React,
  ReactDOM,
  paylixContext,
  paylixStoreFactory,
  paylixAddonsStore,
  paylixPriceVariantsStore,
  paylixApi,
);
