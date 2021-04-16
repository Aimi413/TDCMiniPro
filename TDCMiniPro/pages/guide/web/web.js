Page({
	data: {
		src: "https://event.traveldaily.cn/tdc2020/service/venue",
		notpdf: true
	},
	onLoad: function (options) {
		console.log(options)
		let { src, q, token, openid, url, data } = options;
		let scanCodeUrl = decodeURIComponent(q);
		if(q != undefined || q != null) {
			this.setData({
				src: scanCodeUrl
			});
		} else if(src != undefined) {
			if(openid != undefined) {
				let tempUrl = `${src}?data=${data}&url=${decodeURIComponent(url)}&openid=${openid}`;
				this.setData({
					src: tempUrl
				});
			} else if(token != undefined) {
				let tempUrl = `${decodeURIComponent(src)}?token=${token}`;
				this.setData({
					src: tempUrl
				});
			} else {
				this.setData({
					src: decodeURIComponent(src),
				});	
			}
		}
	},
	onShow: function () {

	},
	onShareAppMessage: function (options) {
		return {
			path: `/pages/guide/web/web?src=${decodeURIComponent(options.webViewUrl)}`
		}
	},
})