<template>
  <div class="payment">
    <div class="user-info" >
      <div class="item"><label class="label">联系人</label><input placeholder="姓名" class="input" v-model="name" type="text"></div>
      <div class="item"><label>联系电话</label><input placeholder="你的手机号" v-model="phone" type="text"></div>
      <div class="item"><label>送餐地址</label><input placeholder="送餐地址" v-model="address" type="text"></div>
    </div>
    <div class="food-info"  v-if="!show">
      <div class="card-hd"><img  class="avator" :src="seller.avatar"><span class="title">{{seller.name}}</span></div>

      <div v-for="item in selectedGoods" class="food-item" >
        <label>{{item.productName}}</label>
        <div class="mount"><span class="number" v-if="item.productQuantity > 1">x{{item.productQuantity}}</span>¥{{item.productQuantity * item.productPrice}}</div>
      </div>
    </div>
    <div class="footer"   v-if="!show">
      <div class="money">待支付¥{{this.allPay}}</div>
      <div class="btn-pay" @click="pay">支付</div>
    </div>

    <vue-pay-keyboard
      ref="pay"
      :is-pay='show'
      @pas-end='pasEnd'
      @close='pasClose'>
      <!-- 自定义支付动画 -->
      <div slot="loading-ani">
        <svg></svg>
      </div>
    </vue-pay-keyboard>

  </div>


</template>
<script >


  var config = require('config');
  config = process.env.NODE_ENV === 'development' ? config.dev : config.build;
  export default {
    data() {
      return {
        selectedGoods: [],
        seller: {},
        name: '',
        phone: '',
        address: '',
        show:false,
        orderId:''
      };
    },
    computed: {
      allPay() {
        return this.selectedGoods.reduce((a, b) => {
          return a + (b.productQuantity * b.productPrice);
        }, 0);
      }
    },
    watch: {
      '$route': 'fetchData'
    },
  //初始化参数
    created() {
      this.$http.get('/sell/buyer/order/detail', {
        params: {
          orderId: this.$route.params.orderId,
          openid: getCookie('openid')
        }
      }).then(function (response) {
        this.order = response.body.data;
        this.selectedGoods = this.order.orderDetailList;
        this.name = this.order.buyerName;
        this.phone = this.order.buyerPhone;
        this.address = this.order.buyerAddress;
        this.orderId = this.order.orderId;

      })
    },

    methods: {
      pay() {
        this.orderId=this.$route.params.orderId;
        this.show=true;
      },
      pasEnd(val) {
        console.log(val);  //得到密码 可能会进行一些加密动作
        setTimeout(() => { // 模拟请求接口验证密码中 ..
          if (val === '111111') { // 密码正确
            this.$http.post("/sell/pay/create?orderId="+this.orderId
            ).then((respones) => {
              if (respones.status == 200) {
                window.selectedGoods = '[]';
                var orderId=this.orderId;
                this.$router.push({
                  path:`/order/${orderId}`
                });
              }else {
                alert(respones.msg);
              }
            });
            this.$refs.pay.$payStatus(true) // 拿到子组件的事件
          } else {
            this.$refs.pay.$payStatus(false)
          }
        }, 1000)
      }
      ,
      pasClose()
      {
        var orderId=this.orderId;
        this.$router.push({
          path:`/order/${orderId}`
        });
      }
    },

  };
  function getCookie(name) {
    var arr;
    var reg = new RegExp('(^| )' +name+"=([^;]*)(;|$)");
    if(arr=document.cookie.match(reg))
      return unescape(arr[2]);
    else
      return null;
  }
</script>

<style lang="less" >
  .payment {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: #f5f5f5;

    .user-info {
      margin-top: 10px;
      background-color: #fff;
      margin-bottom: 20px;
      .item {
        padding: 0 14px;
        display: flex;
        border-bottom: 1px solid #eee;
        label {
          padding: 14px 0;
          display:inline-block;
          flex-basis: 93px;
          color: #333;
        }
        input {
          display: block;
          flex: 1;
          outline: 0;
          color: #333;
        }
      }
    }
    .food-info {
      background-color: #fff;
      .avator {
        width: 19px;
        height: 19px;
        margin-right: 10px;
      }
      .card-hd {
        display: flex;
        align-items: center;
        padding: 14px;
        border-bottom: 1px solid #eee;
      }
      .food-item {
        padding: 0 14px;
        display: flex;
        align-items: center;
        border-bottom: 1px solid #eee;
        label {
          display: inline-block;
          padding: 14px 0;
          flex: 1;
          color: #666;
        }
        .mount {
          display: flex;
          flex: 1;
          justify-content: flex-end;
          .number {
            padding-right: 20px;
          }
        }
      }
    }
    .footer {
      position: absolute;
      bottom: 0;
      width: 100%;
      height: 44px;
      display: flex;
      background-color: #3c3c3c;
      color: #fff;
      .money {
        flex: 1;
        padding-left: 20px;
        line-height: 44px;
      }
      .btn-pay {
        flex-basis: 110px;
        line-height: 44px;
        text-align: center;
        background-color: #56d176;
      }

    }
  }


</style>
