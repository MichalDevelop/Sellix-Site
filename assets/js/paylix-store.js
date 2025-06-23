(function (window) {
  class Store {
    constructor(shop) {
      this.shop = shop;
      this.storageName = `store-${shop}`;

      this.state = JSON.parse(window.localStorage.getItem(this.storageName)) || {};
    }

    get(name, defaultValue) {
      return this.state[name] || defaultValue;
    }

    set(name, value) {
      this.state[name] = value;
      window.localStorage.setItem(this.storageName, JSON.stringify(this.state));
    }
  }

  class StoreFactory {
    static paylixStores = {};

    static getStore(shop) {
      if (!(shop in window.paylixStoreFactory.paylixStores)) {
        window.paylixStoreFactory.paylixStores[shop] = new Store(shop);
      }

      return window.paylixStoreFactory.paylixStores[shop];
    }
  }

  window.paylixStoreFactory = StoreFactory;
})(window);
