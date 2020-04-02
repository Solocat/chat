var app = new Vue({
    el: "#chat",
    data: {
        currentMSG: "",
        messages: [],
        msgUrl: "messages.json",
        author: "",
        database: {},
        other: {
            name: "",
            typing: false
        },
        users: {}
    },
    methods: {
        send() {
            var msg = {text: this.currentMSG, time: Date.now(), author: this.author};
            this.upload(msg);
            msg.status = "pending";
            //this.messages.push(msg);
            this.currentMSG = "";
        },
        onInput() {
            var is = (this.currentMSG.length > 0);
            console.log(is);
            this.database.ref('users/' + this.author + '/writing').set(is);
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
        async getUsers() {
            const data = (await this.database.ref('users').once('value')).val();
            return data;
        },
        getDatabase() {
            return firebase.database();
        },
        async authenticate(provider)
        {
            try {
                var result = await firebase.auth().signInWithPopup(provider);
                return result.user.uid;
            }
            catch (error) {
                console.log(error);
                return null;
            }
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

        var provider = new firebase.auth.GoogleAuthProvider();
        this.author = await this.authenticate(provider);

        var users = this.database.ref('users');
        var me = this.database.ref('users/' + this.author);

        this.database.ref('users/' + this.author + '/online').set("true");

        users.on('child_changed', function(data) {
            console.log(data);
        });

        this.users = this.getUsers();
        debugger;
        //this.messages = await this.getMessages();

        const vm = this;
        var messages = this.database.ref('messages').limitToLast(10);
        /*messages.on('value', function(snapshot) {
            console.log(snapshot.val());
            vm.messages = Object.values(snapshot.val());
        });*/

        messages.on('child_added', function(data) {
            vm.messages.push(data.val());
        });

    },
    updated() {
        this.autoScroll();
    }
})
