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
				<label>{{item.name}}</label>
				<div class="mount"><span class="number" v-if="item.count > 1">x{{item.count}}</span>¥{{item.count * item.price}}</div>
			</div>
		</div>
		<div class="footer"   v-if="!show">
			<div class="money">待支付¥{{this.allPay}}</div>
			<div class="btn-pay" @click="pay">支付</div>
		</div>


<!--    <vpay ref="pays"
          v-model="show"
          @close="close"
          @forget="forget"
          @input-end="inputEnd"
    ></vpay>-->

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


    var config = require('config')
    config = process.env.NODE_ENV === 'development' ? config.dev : config.build
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
					return a + (b.count * b.price);
				}, 0);
			}
		},
		watch: {
			'$route': 'fetchData'
		},
		created() {
			this.selectedGoods = JSON.parse(window.selectedGoods);
			this.seller = JSON.parse(window.sellerPay);
		},
		methods: {
			pay() {
				const goods = this.selectedGoods.map(good => {
                    return {productId: good.id, productQuantity: good.count}
                });

                const ERR_OK = 0;
                this.$http.post("/sell/buyer/order/create", {
                    'openid': getCookie('openid'),
                    'phone': this.phone,
                    'name': this.name,
                    'address': this.address,
                    'items': JSON.stringify(goods)}
                ).then((respones) => {
                    respones = respones.body;
                    if (respones.code == ERR_OK) {
                      /*location.href = config.wechatPayUrl +
                        '?openid=' + getCookie('openid') +
                        '&orderId=' + respones.data.orderId +
                        '&returnUrl=' + encodeURIComponent(config.sellUrl + '/#/order/' + respones.data.orderId);*/
                      this.orderId=respones.data.orderId;
                      this.show=true;
                    }else {
                      alert(respones.msg);
                    }
                });

                window.selectedGoods = '[]';
                // 支付成功清空localstorage selectedGoods
			},

        pasEnd(val) {
          console.log(val);  //得到密码 可能会进行一些加密动作
          setTimeout(() => { // 模拟请求接口验证密码中 ..
            if (val === '111111') { // 密码正确
              this.$http.post("/sell/pay/create?orderId="+this.orderId
              ).then((respones) => {

                if (respones.status == 200) {
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
        },
      pasClose()
      {
        const orderId=this.orderId;
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
