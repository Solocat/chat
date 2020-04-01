var app = new Vue({
    el: "#chat",
    data: {
        currentMSG: "",
        messages: [],
        msgUrl: "messages.json",
        author: "",
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
        authenticate(provider)
        {
            return firebase.auth().signInWithPopup(provider).then(function(result) {
                // This gives you a Google Access Token. You can use it to access the Google API.
                var token = result.credential.accessToken;
                // The signed-in user info.
                return result.user.uid;
                // ...
            }).catch(function(error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                // The email of the user's account used.
                var email = error.email;
                // The firebase.auth.AuthCredential type that was used.
                var credential = error.credential;
                // ...
            });
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
        firebase.auth().useDeviceLanguage();
        this.author = await this.authenticate(provider);
        console.log(this.author);
        debugger;
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
