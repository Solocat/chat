var app = new Vue({
    el: "#chat",
    data: {
        currentMSG: "",
        messages: [],
        msgUrl: "messages.json",
        author: uid,
        database: {}
    },
    methods: {
        send() {
            var msg = {text: this.currentMSG, time: Date.now(), author: this.author};
            this.upload(msg);
            msg.status = "pending";
            //this.messages.push(msg);
            this.currentMSG = "";
        },
        formattedTime(time) {
            var date = new Date(time);
            return date.getHours() + "." + date.getMinutes() + "." + date.getSeconds();
        },
        async upload(msg) {
            try {
                await this.database.ref('messages').push().set(msg);
                //this.messages[this.messages.length-1].status = "sent";
            }
            catch(error) {
                console.error(error)
                //this.messages[this.messages.length-1].status = "error";
            }
        },
        async getMessages() {
            const data = (await this.database.ref('messages').once('value')).val();
            return Object.values(data);
        },
        getDatabase() {
            return firebase.database();
        },
        autoScroll() {
            var objDiv = document.getElementById("messages");
            objDiv.scrollTop = objDiv.scrollHeight;
        }
    },
    components: {
        'v-text': vText
    },
    async mounted() {
        this.database = firebase.database();

        //this.messages = await this.getMessages();

        const vm = this;
        var messages = this.database.ref('messages').limitToLast(10);
        /*messages.on('value', function(snapshot) {
            console.log(snapshot.val());
            vm.messages = Object.values(snapshot.val());
        });*/

        messages.on('child_added', function(data) {
            console.log(data.val());
            vm.messages.push(data.val());
        });

    },
    updated() {
        this.autoScroll();
    }
})
