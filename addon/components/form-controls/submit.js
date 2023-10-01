import Button from './button';
import layout from 'ember-form-for/templates/components/form-controls/submit';

import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import { resolve } from 'rsvp';
import { observer } from '@ember/object';
import ObjectProxy from '@ember/object/proxy';
import PromiseProxyMixin from '@ember/object/promise-proxy-mixin';

const SubmitButton = Button.extend({
  layout,
  tagName: 'button',
  type: 'submit',

  activePromise: undefined,

  classNames: ['async-button'],
  attributeBindings: ['disabled', 'type'],

  submit: alias('action'),
  default: 'Submit',
  pending: 'Submitting...',

  NON_ATTRIBUTE_BOUND_PROPS: [
    'click'
  ],

  init() {
    this._super(...arguments);
  },

  click() {
    // PromiseProxyMixin allows us to use .isPending in the templates
    // RSVP.Promise is required to handle situation when submit function
    // returns non-promise.
    // Updated as per ember docs https://api.emberjs.com/ember/3.28/classes/PromiseProxyMixin
    let ObjectPromiseProxy = ObjectProxy.extend(PromiseProxyMixin);
    this.set('activePromise', ObjectPromiseProxy.create({
      promise: resolve(this.get('submit')())
    }));
    return false;
  },

  disabled: computed('activePromise.isPending', function() {
    if (this.get('activePromise.isPending') === true) {
      return true;
    } else {
      return false;
    }
  }),

  resetAction: observer('reset', 'activePromise.isFulfilled', 'activePromise.isRejected', function() {
    if (this.get('reset') && (this.get('activePromise.isFulfilled') || this.get('activePromise.isRejected'))) {
      this.set('activePromise', undefined);
    }
  })
});

SubmitButton.reopenClass({
  positionalParams: ['default']
});

export default SubmitButton;
