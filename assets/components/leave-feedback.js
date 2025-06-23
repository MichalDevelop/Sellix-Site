(function (document, window, jQuery, paylixApi) {
  class LeaveFeedbackComponent {
    constructor(selector, messageId, uniqid) {
      this.$form = jQuery(selector);
      this.uniqid = uniqid;

      this.$form.submit((e) => {
        e.preventDefault();
        this.submit();
      });

      this.$message = this.$form.find(`.paylix-input-${messageId}`);
    }

    submit() {
      if (this.$message.val().length <= 256) {
        const score = this.$form.find('.filled-icons').width() / 27;
        paylixApi
          .leaveFeedback({
            message: this.$message.val(),
            score,
            uniqid: this.uniqid,
            feedback: {
              1: 'negative',
              2: 'negative',
              3: 'neutral',
              4: 'positive',
              5: 'positive',
            }[score],
          })
          .then((resp) => {
            if (resp.status === 200) {
              jQuery(document).trigger('paylixToastify', {
                type: 'success',
                text: resp.message,
              });
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

  window.paylixLeaveFeedbackComponent = LeaveFeedbackComponent;
})(document, window, jQuery, paylixApi);
