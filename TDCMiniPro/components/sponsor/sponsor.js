Component({
	/**
	 * 组件的属性列表
	 */
	properties: {
		sponsor: {
			type: Object
		},
		showOperate: {
			type: Boolean
		},
		index: {
			type: Number || String
		},
		profile: {
			type: Object
		}
	},
	/**
	 * 组件的初始数据
	 */
	data: {

	},
	/**
	 * 组件的方法列表
	 */
	methods: {
		goSponsorDetail: function(e) {
			let { id } = this.properties.sponsor;
			wx.navigateTo({
			  	url: `/pages/sponsor/detail/detail?id=${id}`
			});
		},
		followSponsor: function(e) {
			let { index, id, concern: isConcern } = e.currentTarget.dataset;
			this.triggerEvent("followSponsor", { index, id, isConcern });
		},
		shareSponsor: function(e) {
			console.log(e)
		}
	}
})
