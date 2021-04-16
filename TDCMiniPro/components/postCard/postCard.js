Component({
	properties: {
		post: {
			type: Object
		},
		belong: {
			type: String
		},
		index: {
			type: Number
		},
		showPhoto: {
			type: Boolean,
			default: true
		}
	},
	data: {

	},
	methods: {
		goDetail: function(e) {
			let { id, type } = e.currentTarget.dataset;
			if(type != 2) {
				wx.navigateTo({
					url: `/pages/plaza/detail/detail?id=${id}`
				});
			}
		},
		goProdetail: function(e) {
			let { id } = e.currentTarget.dataset;
			wx.navigateTo({
				url: `/pages/program/detail/detail?id=${id}`
			});
		},
		starPost: function(e) {
			let { belong, id, index, islike } = e.currentTarget.dataset;
			this.triggerEvent("starPost", { belong, id, index, islike });
		},
		delPost: function(e) {
			let { belong, id, index } = e.currentTarget.dataset;
			this.triggerEvent("delPost", { belong, id, index });
		},
		previewImg: function(e) {
			let { img } = e.currentTarget.dataset;
			wx.previewImage({
				urls: [img],
				success: res => {
					console.log(res)
				},
				fail: err => {
					console.log(err)
				}
			});
		}
	}
})
