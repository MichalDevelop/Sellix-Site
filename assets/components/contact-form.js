(function (document, window, jQuery, paylixApi) {
  class FormComponent {
    constructor(selector, titleId, emailId, messageId, invoiceId, shopName) {
      this.$form = jQuery(selector);
      this.shopName = shopName;

      this.$form.submit((e) => {
        e.preventDefault();
        this.submit();
      });

      this.$title = this.$form.find(`.paylix-input-${titleId}`);
      this.$email = this.$form.find(`.paylix-input-${emailId}`);
      this.$message = this.$form.find(`.paylix-input-${messageId}`);
      this.$invoice = this.$form.find(`.paylix-input-${invoiceId}`);
    }

    submit() {
      if (this.$title.val() && this.$email.val() && this.$message.val()) {
        paylixApi
          .createTicket({
            title: this.$title.val(),
            email: this.$email.val(),
            invoice_id: this.$invoice.val(),
            message: this.$message.val(),
            name: this.shopName,
          })
          .then((resp) => {
            if (resp.status === 200) {
              jQuery(document).trigger('paylixToastify', {
                type: 'success',
                text: resp.message,
              });
              window.location.href = 'ticket/' + resp.data.uniqid;
            } else {
              jQuery(document).trigger('paylixToastify', {
                type: 'error',
                text: resp.error,
              });
            }
          });
      }
    }
  }

  window.paylixFormComponent = FormComponent;
})(document, window, jQuery, paylixApi);
