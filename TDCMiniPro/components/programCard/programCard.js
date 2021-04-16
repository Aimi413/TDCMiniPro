Component({
	properties: {
		program: {
			type: Object
		},
		hideOperate: {
			type: Boolean
		},
		profile: {
			type: Object
		}
	},
	externalClasses: ["outside-class"],
	data: {

	},
	methods: {
		goProDetail: function(e) {
			let { id, topic, type } = e.currentTarget.dataset;
			// if(topic != "") {
				wx.navigateTo({
				  	url: `/pages/program/detail/detail?id=${id}&type=${type}`
				});
			// }
		},
		goAsk: function(e) {
			let { id, topic } = e.currentTarget.dataset;
			if(topic != "") {
				wx.navigateTo({
					url: `/pages/program/questionlist/questionlist?id=${id}&topic=${topic}`,
				});
			}
		},
		followPro: function(e) {
			let { isSubscribed: isConcern } = this.properties.program;
			let { id, parentindex, proindex } = e.currentTarget.dataset;
			this.triggerEvent("followProgram", { id, parentindex, proindex, isConcern });
		},
		sharePro: function(e) {
			console.log(e)
		}
	}
})
