(function (document, window, jQuery, paylixCartStoreFactory, paylixPriceVariantsStore, paylixHelper) {
  class CheckoutProductComponent {
    constructor(selector, shop, productId, renderOptions) {
      this.$product = jQuery(selector);
      this.cart = paylixCartStoreFactory.getCart(shop);
      this.priceVariantsStore = new paylixPriceVariantsStore(shop);
      this.productId = productId;
      this.isVisibleDescription = false;

      this.$product.find('.paylix-cart-description').on('click', (event) => {
        event.preventDefault();
        this.onClickDescriptionButton();
      });
      this.$product.find('.checkout-details-item-remove').on('click', this.decreaseProduct);

      this.renderEvents = ['paylixCartUpdateEvent', 'paylixRenderComponent'].map((eventName) => {
        return paylixHelper.getEventName({
          name: eventName,
          namespace: renderOptions.id,
          id: productId,
        });
      });
      this.showDescriptionEvent = paylixHelper.getEventName({
        name: 'paylixShowProductDescription',
        namespace: renderOptions.id,
        id: productId,
      });

      jQuery(document).on(this.showDescriptionEvent, (event, eventInfo) => {
        const toggledProductId = eventInfo && eventInfo.productId ? eventInfo.productId : null;
        this.onToggleDescription(toggledProductId);
      });

      jQuery(document).on(this.renderEvents.join(' '), (e, eventInfo) => {
        if (eventInfo && eventInfo.action) {
          if (eventInfo.action === 'delete') {
            if (!eventInfo.productId || eventInfo.productId === productId) {
              this.removeProduct(eventInfo.productId);
            }
          }
        }
      });

      jQuery(document).on('paylixVariantsUpdateEvent', (event, eventInfo) => {
        if (!eventInfo || !eventInfo.productId || eventInfo.productId === this.productId) {
          const activeVariant = this.priceVariantsStore.get(this.productId);
          if (activeVariant) {
            this.$product.find('.paylix-product > .checkout-details-item-title > span').text(activeVariant.title);
          }
        }
      });
    }

    toggleDescription = (show) => {
      const $description = this.$product.find('.shop-product-info-collapse'),
        $label = this.$product.find('.paylix-cart-description .label-show-description'),
        $button = this.$product.find('.paylix-cart-description .label-click-for-info');

      if (show) {
        $description.animate(
          { height: $description.get(0).scrollHeight, overflow: 'initial' },
          { duration: 300, queue: false },
        );
        $label.text(window.paylixI18Next.t('shop.checkout.hideDescription'));
        $button.hide();
      } else {
        $description.animate({ height: '0px', overflow: 'hidden' }, { duration: 300, queue: false });
        $label.text(window.paylixI18Next.t('shop.checkout.showDescription'));
        $button.show();
      }

      this.isVisibleDescription = show;
    };

    removeProduct = () => {
      jQuery(document).off(this.renderEvents.join(' '));
      jQuery(document).off(this.showDescriptionEvent);
      this.$product.find('.paylix-cart-description').off('click');
      this.$product.find('.checkout-details-item-remove').off('click');
      this.$product.remove();
    };

    decreaseProduct = () => {
      this.cart.remove(this.productId, -1);
    };

    onToggleDescription = (productId) => {
      if (productId === this.productId) {
        this.toggleDescription(!this.isVisibleDescription);
      } else if (this.isVisibleDescription) {
        this.toggleDescription(false);
      }
    };

    onClickDescriptionButton = () => {
      jQuery(document).trigger('paylixShowProductDescription', { productId: this.productId });
    };
  }
  window.paylixCheckoutProductComponent = CheckoutProductComponent;
})(document, window, jQuery, paylixCartStoreFactory, paylixPriceVariantsStore, paylixHelper);
