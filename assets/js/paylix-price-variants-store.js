(function (window, jQuery, paylixStoreFactory) {
  class PriceVariantsStore {
    constructor(shop) {
      this.shop = shop;
      this.store = paylixStoreFactory.getStore(shop);
      this.key = 'variants';
    }

    getAll() {
      return this.store.get(this.key, {});
    }

    get(productId, defaultValue) {
      const variants = this.store.get(this.key, {});
      return variants[productId] || defaultValue;
    }

    set(productId, variant) {
      const variants = this.store.get(this.key, {});
      this.store.set(this.key, {
        ...variants,
        [productId]: variant,
      });
      setTimeout(function () {
        jQuery(document).trigger('paylixVariantsUpdateEvent', { productId: productId, variant });
      }, 0);
    }
  }
  window.paylixPriceVariantsStore = PriceVariantsStore;
})(window, jQuery, paylixStoreFactory);
