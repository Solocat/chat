var app = new Vue({
    el: "#chat",
    data: {
        currentMSG: "",
        messages: [],
        msgUrl: "messages.json",
        author: 1,
        database: {}
    },
    methods: {
        send() {
            var msg = {text: this.currentMSG, time: Date.now(), author: this.author};
            this.upload(msg);
            msg.status = "pending";
            this.messages.push(msg);
            this.currentMSG = "";
        },
        formattedTime(time) {
            var date = new Date(time);
            return date.getHours() + "." + date.getMinutes() + "." + date.getSeconds();
        },
        async upload(msg) {
            try {
                const req = await this.database.ref('messages').push().set(msg);
                this.messages[this.messages.length-1].status = "sent";
            }
            catch(error) {
                console.error(error)
                this.messages[this.messages.length-1].status = "error";
            }
        },
        async getMessages() {
            var data = (await this.database.ref('messages').once('value')).val();
            return Object.values(data);
        },
        getDatabase() {
            var firebaseConfig = {
                apiKey: "AIzaSyCCMm7YgbtauAz3tx7Qq8gzwbCfLy_Gsjg",
                authDomain: "solo-poke.firebaseapp.com",
                databaseURL: "https://solo-poke.firebaseio.com",
                projectId: "solo-poke",
                storageBucket: "solo-poke.appspot.com",
                messagingSenderId: "583889049222",
                appId: "1:583889049222:web:5b43974b1605558c386307"
            };
            // Initialize Firebase
            firebase.initializeApp(firebaseConfig);
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
        var firebaseConfig = {
            apiKey: "AIzaSyCCMm7YgbtauAz3tx7Qq8gzwbCfLy_Gsjg",
            authDomain: "solo-poke.firebaseapp.com",
            databaseURL: "https://solo-poke.firebaseio.com",
            projectId: "solo-poke",
            storageBucket: "solo-poke.appspot.com",
            messagingSenderId: "583889049222",
            appId: "1:583889049222:web:5b43974b1605558c386307"
        };
        firebase.initializeApp(firebaseConfig);
        this.database = firebase.database();

        this.messages = await this.getMessages();
    },
    updated() {
        this.autoScroll();
    }
})