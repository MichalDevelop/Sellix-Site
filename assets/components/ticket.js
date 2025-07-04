(function (document, window, jQuery, paylixApi) {
  class TicketComponent {
    constructor(selector, messageId, submitId, uniqId, renderOptions) {
      this.$form = jQuery(selector);
      this.$messageContainer = this.$form.find('.reply-screen-message-container');
      this.$submitButton = this.$form.find(`#ticket-submit-${submitId}`);
      this.uniqId = uniqId;
      this.renderOptions = renderOptions;

      this.$submitButton.on('click', (e) => {
        e.preventDefault();
        this.submit();
      });

      this.$message = this.$form.find(`.paylix-input-${messageId}`);

      window.addEventListener('focus', () => this.getTicket());
    }

    renderTicket(message, role, date) {
      return paylixApi
        .renderComponent(
          {
            ...this.renderOptions,
            path: [this.renderOptions.path, ['snippet', 'Ticket Message'].join(':')].join(';'),
          },
          { role, created_at: date, message },
        )
        .then((resp) => {
          const $component = $(resp.html);
          this.$messageContainer.append($component);
        })
        .catch((resp) => {
          const respJson = resp.responseJSON || {};
          jQuery(document).trigger('paylixToastify', {
            type: 'error',
            text: respJson.message || 'Internal server error',
          });
        });
    }

    getTicket() {
      paylixApi
        .getTicket(this.uniqId)
        .then(async (resp) => {
          if (resp.status === 200) {
            for (let newMessage of resp.data.query.messages) {
              if ($(`[data-id="${newMessage.role}-${newMessage.created_at}"]`).length === 0) {
                await this.renderTicket(newMessage.message, newMessage.role, newMessage.created_at);
              }
            }
          } else {
            jQuery(document).trigger('paylixToastify', {
              type: 'error',
              text: resp.error,
            });
          }
        })
        .catch((resp) => {
          const respJson = resp.responseJSON || {};
          jQuery(document).trigger('paylixToastify', {
            type: 'error',
            text: respJson.message || 'Internal server error',
          });
        });
    }

    submit() {
      paylixApi
        .replyTicket({
          message: this.$message.val(),
          uniqid: this.uniqId,
        })
        .then((resp) => {
          if (resp.status === 200) {
            jQuery(document).trigger('paylixToastify', {
              type: 'success',
              text: resp.message,
            });
            this.getTicket(this.$message.val());
            this.$message.val('');
          } else {
            jQuery(document).trigger('paylixToastify', {
              type: 'error',
              text: resp.error,
            });
          }
        })
        .catch((resp) => {
          const respJson = resp.responseJSON || {};
          jQuery(document).trigger('paylixToastify', {
            type: 'error',
            text: respJson.message || 'Internal server error',
          });
        });
    }
  }

  window.paylixTicketComponent = TicketComponent;
})(document, window, jQuery, paylixApi);
