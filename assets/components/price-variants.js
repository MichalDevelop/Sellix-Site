(function (window, jQuery, paylixCartStoreFactory, paylixPriceVariantsStore) {
  class VariantsComponent {
    constructor(selector, shop, productId, variants, isCart) {
      this.selector = selector;
      this.store = new paylixPriceVariantsStore(shop);
      this.cart = paylixCartStoreFactory.getCart(shop);
      this.productId = productId;
      this.variants = variants;
      this.isCart = isCart;

      jQuery(document).on('paylixVariantsUpdateEvent', (e, eventInfo) => {
        if (!eventInfo || !eventInfo.productId || eventInfo.productId === productId) {
          this.setActiveVariant();
        }
      });

      jQuery(this.selector).on('click', (event) => {
        const clickedTitle = jQuery(event.currentTarget).data('variant');
        const variant = this.variants.find(({ title }) => title === `${clickedTitle}`);
        if (variant) {
          this.store.set(productId, variant);
        }
      });
    }

    setActiveVariant = () => {
      const activeVariant = this.store.get(this.productId);
      if (activeVariant) {
        jQuery(this.selector).removeClass('active');
        jQuery(`${this.selector}[data-variant='${activeVariant.title}']`).addClass('active');
      }
    };

    render() {
      if (this.variants.length) {
        let firstActive = this.variants.find(({ stock }) => stock !== 0);

        if (firstActive) {
          this.store.set(this.productId, firstActive);
        } else {
          if (this.isCart) {
            this.cart.remove(this.productId, 0);
          } else {
            this.store.set(this.productId, this.variants[0]);
          }
        }
      }
    }
  }
  window.paylixVariantsComponent = VariantsComponent;
})(window, jQuery, paylixCartStoreFactory, paylixPriceVariantsStore);
