Page({
	data: {

	},
	onLoad: function (options) {
		console.log(options)
		console.log(decodeURIComponent(options.path))
		console.log(decodeURIComponent(options.url))
		var openid = wx.getStorageSync('session').openid;
		let tempData = options.data;
		let tempPath = decodeURIComponent(options.path);
		let tempUrl = options.url;

		// let completeUrl = `${tempPath}?data=${tempData}&url=${tempUrl}&openid=${openid}`;
		let completeUrl = `${tempPath}&data=${tempData}&url=${tempUrl}&openid=${openid}`;
		console.log(completeUrl)

		wx.redirectTo({
		  url: `/pages/guide/web/web?src=${completeUrl}`,
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