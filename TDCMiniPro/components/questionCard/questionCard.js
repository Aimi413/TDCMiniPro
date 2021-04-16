Component({
	properties: {
		question: {
			type: Object
		},
		hideQuestioner: {
			type: Boolean
		},
		hideLikePersonDesc: {
			type: Boolean
		},
		hideQuestionTime: {
			type: Boolean
		},
		index: {
			type: Number || String
		}
	},
	externalClasses: ["outside-class"],
	data: {
		
	},
	methods: {
		goQuestionDetail: function() {
			let { id } = this.properties.question;
			wx.navigateTo({
			  url: `/pages/program/question/question?id=${id}`,
			});
		},
		starQuestion: function() {
			let { index, question: { id, isLike } } = this.properties;
			this.triggerEvent("starQuestion", {index, id, isLike})
		}
	}
})
