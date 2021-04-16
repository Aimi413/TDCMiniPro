Component({
	properties: {
		guest: {
			type: Object
		},
		newMessageCount: {
			type: Number,
			default: 0
		}
	},
	externalClasses: ["outside-class"],
	methods: {
		goGuestDetail: function(e) {
			let id = this.properties.guest.id;
			this.triggerEvent("goGuestDetail", { id });
		}
	}
})