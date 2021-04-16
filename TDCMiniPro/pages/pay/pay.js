Page({
	data: {

	},
	onLoad: function (options) {
		console.log(options)
		let { noncestr, package: packageStr, paysign, signtype, timestamp  } = options;
		wx.requestPayment({
		  nonceStr: noncestr,
		  package: "prepay_id=" + packageStr,
		  paySign: paysign,
		  signType: signtype,
		  timeStamp: timestamp,
		  success: res => {
			console.log("支付成功")
			wx.showModal({
				title: "提示",
				content: "付款成功，我们的客服正在为您办理参会手续，请耐心等待。如有疑问，请联系客服：Jack，18221554542（微信同号）如果您正在活动现场，建议您前往签到处6号通道，咨询现场工作人员。",
				showCancel: false,
				success: res => {
					wx.reLaunch({
						url: `/pages/home/index/index`
					})
				}
			});
		  },
		  fail: err => {
			wx.navigateBack({
				delta: 2
			});
			console.log(err)
		  }
		});
	},
	onReady: function () {

	},
	onShow: function () {

	},
	onHide: function () {

	},
	onUnload: function () {

	},
})