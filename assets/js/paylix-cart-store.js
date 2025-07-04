(function (document, window, jQuery, paylixApi) {
  class CartStore {
    state = [];

    constructor(shop) {
      this.shop = shop;
      this.storageName = `cart-${shop}`;

      this.isInited = false;
      this.defferedActions = [];
      this.init();
    }

    init() {
      paylixApi
        .getCart()
        .then((resp) => {
          this.state = resp.products || [];
          this.isInited = true;

          for (let action of this.defferedActions) {
            switch (action.type) {
              case 'remove':
                this.remove(action.id, action.quantity);
                break;
            }
          }

          jQuery(document).trigger('paylixCartInitEvent');
          jQuery(document).trigger('paylixCartUpdateEvent', { action: 'insert' });
        })
        .catch((resp) => {
          if (resp.responseJSON) {
            const respJson = resp.responseJSON;
            jQuery(document).trigger('paylixToastify', {
              type: 'error',
              text: respJson.message || 'Internal server error',
            });
          } else {
            throw resp;
          }
        });
    }

    update() {
      const products = this.getItems().map(({ uniqid, quantity }) => ({ uniqid, quantity }));
      return paylixApi.updateCart(products).catch((resp) => {
        if (resp.responseJSON) {
          const respJson = resp.responseJSON || {};
          jQuery(document).trigger('paylixToastify', {
            type: 'error',
            text: respJson.message || 'Internal server error',
          });
        } else {
          throw resp;
        }
      });
    }

    getItems() {
      return this.state;
    }

    getItemById(id) {
      return this.state.find((item) => item.uniqid === id);
    }

    add(product, quantity = 1, updateBackend = true) {
      let isNew = true;
      let updatedState = this.state.map((item) => {
        if (item.uniqid === product.uniqid) {
          item = {
            ...item,
            quantity: item.quantity + quantity,
          };
          isNew = false;
        }
        return item;
      });

      if (isNew) {
        updatedState = [...updatedState, { ...product, quantity }];
      }

      this.state = updatedState;

      if (updateBackend) {
        this.update().then(() => {
          jQuery(document).trigger('paylixCartUpdateEvent', {
            action: isNew ? 'insert' : 'update',
            productId: product.uniqid,
          });
        });
      }

      return { product, quantity, isNew };
    }

    addMany(products) {
      const updatedProducts = products.map(({ product, quantity }) => this.add(product, quantity, false));

      return this.update().then(() => {
        for (const { product, isNew } of updatedProducts) {
          jQuery(document).trigger('paylixCartUpdateEvent', {
            action: isNew ? 'insert' : 'update',
            productId: product.uniqid,
          });
        }
      });
    }

    remove(id, quantity = 1) {
      if (!this.isInited) {
        this.defferedActions.push({ type: 'remove', id, quantity });
        return;
      }

      let isDeleted = false;
      this.state = this.state
        .map((item) => {
          let newQuantity = quantity > 0 ? item.quantity - quantity : 0;
          if (newQuantity < 0) {
            newQuantity = 0;
          }
          if (item.uniqid === id) {
            item = {
              ...item,
              quantity: newQuantity,
            };
            isDeleted = newQuantity === 0;
          }

          return item;
        })
        .filter((item) => item.quantity > 0);

      this.update().then(() => {
        jQuery(document).trigger('paylixCartUpdateEvent', {
          action: isDeleted ? 'delete' : 'update',
          productId: id,
        });
      });
    }

    clear() {
      this.state = [];
      return this.update().then(() => {
        jQuery(document).trigger('paylixCartUpdateEvent', { action: 'delete' });
      });
    }
  }

  class CartStoreFactory {
    static paylixCarts = {};

    static getCart(shop) {
      if (!(shop in window.paylixCartStoreFactory.paylixCarts)) {
        window.paylixCartStoreFactory.paylixCarts[shop] = new CartStore(shop);
      }

      return window.paylixCartStoreFactory.paylixCarts[shop];
    }
  }

  window.paylixCartStoreFactory = CartStoreFactory;
})(document, window, jQuery, paylixApi);
