import Vue from 'vue';
import VueRouter from 'vue-router';
import VueResource from 'vue-resource';
import App from './App';
import goods from 'components/goods/goods';
import ratings from 'components/ratings/ratings';
import seller from 'components/seller/seller';
import payment from 'components/payment';
import paymentById from 'components/payment/paymentById';
import orderList from 'components/order/list';
import orderDetail from 'components/order/detail';
import vuePayKeyboard from 'vue-pay-keyboard'

import 'common/stylus/index.styl';

Vue.use(VueRouter);
Vue.use(vuePayKeyboard);
Vue.use(VueResource);
Vue.http.options.emulateJSON = true;

const routes = [{
  path: '/',
  component: goods
}, {
  path: '/goods',
  component: goods
}, {
  path: '/ratings',
  component: ratings
}, {
  path: '/seller',
  component: seller
}, {
  path: '/payment',
  component: payment
}, {
  path: '/order',
  component: orderList
}, {
    path: '/order/:orderId',
    component: orderDetail
},
  {
    path: '/payment/:orderId',
    component: paymentById
  }
];

const router = new VueRouter({
  linkActiveClass: 'active',
  routes
});

/* eslint-disable no-new */
window.bvue = new Vue({
  el: '#app',
  router,
  render: h => h(App)
});

