Component({
	properties: {
		speaker: {
			type: Object
		},
		index: {
			type: Number || String
		},
		profile: {
			type: Object
		}
	},
	externalClasses: ['outside-class'],
	data: {

	},
	methods: {
		goSpeakerDetail: function() {
			let { id } = this.properties.speaker;
			wx.navigateTo({
			  url: `/pages/speaker/detail/detail?id=${id}`,
			});
		},
		followSpeaker: function() {
			let { index, speaker: { id, isSubscribed: isConcern } } = this.properties
			if(isConcern) {
				isConcern = false;
			} else {
				isConcern = true;
			}
			this.triggerEvent("followSpeaker", {index, id, isConcern})
		},
		shareSpeaker: function() {
			console.log("分享")
		}
	}
})
