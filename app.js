var app = new Vue({
    el: "#chat",
    data: {
        currentMSG: "",
        messages: [],
        author: "",
        writeTimeout: {},
        me: {
            name: "",
            writing: false,
            online: false
        },
        friend: {
            name: "",
            writing: false,
            online: false
        }
    },
    computed: {
        messageGroups() {
            if (this.messages.length == 0) return null;

            var groups = [];
            groups.push({ author: this.messages[0].author, messages : [] });
            var group = groups[groups.length-1];

            var lastTime = this.messages[0].time;
            this.messages.forEach(msg => {
                if (group.author != msg.author || msg.time >= lastTime + 2*60*1000) {
                    groups.push({ author: msg.author, messages : [] });
                    group = groups[groups.length-1];
                }
                group.messages.push(msg);
                lastTime = msg.time;
            });
            return groups;
        }
    },
    methods: {
        clearField() {
            this.currentMSG = "";
            this.onInput();
        },
        onChangeName(name) {
            backend.database.ref('users/' + this.author + '/name').set(name);
            this.clearField();
        },
        send() {
            var msg = {text: this.currentMSG, time: Date.now(), author: this.author};
            this.upload(msg);
            this.clearField();
        },
        onInput() {
            clearTimeout(this.writeTimeout);
            var is = (this.currentMSG.length > 0);
            backend.database.ref('users/' + this.author + '/writing').set(is);

            if (is) {
                var vm = this;
                function waitInput() {
                    backend.database.ref('users/' + vm.author + '/writing').set(false);
                    clearTimeout(this.writeTimeout)
                }
                this.writeTimeout = setTimeout(waitInput, 1000);
            }
        },
        formattedTime(time) {
            var date = new Date(time);
            var today = new Date();

            if (date.getDate == today.getDate) {
                return date.toLocaleTimeString();
            }
            else return date.toLocaleString();
        },
        async upload(msg) {
            try {
                await backend.database.ref('messages').push().set(msg);
            }
            catch(error) {
                console.error(error)
            }
        },
        autoScroll() {
            var objDiv = document.getElementById("messages");

            var top = objDiv.scrollTop;
            function frame() {
                top += 3;
                objDiv.scrollTop = top
                if (top  >= objDiv.scrollHeight - objDiv.clientHeight)
                    clearInterval(id)
            }
            var id = setInterval(frame, 10);
        }
    },
    components: {
        'v-text': vText
    },
    async mounted() {
        const vm = this;

        this.author = await backend.authenticate();

        var userdata = await backend.getUsers();
        var keys = Object.keys(userdata);

        if (this.author == null) {
            this.author = keys[1];
        }

        var friendid;
        keys.forEach(key => {
            if (key != this.author) {
                friendid = key;
            }
        });

        this.friend = userdata[friendid];
        this.me = userdata[this.author];

        var users = backend.database.ref('users');
        var me = backend.database.ref('users/' + this.author);
        var friend = backend.database.ref('users/' + friendid);

        friend.on('child_changed', function(data) {
            vm.friend[data.key] = data.val();
        });
        me.on('child_changed', function(data) {
            vm.me[data.key] = data.val();
        });


        this.messages = await backend.getMessages(20);

        backend.onNewMessage(function(data) {
            vm.messages.push(data.val());
            new Audio('fwib2.wav').play();
        });
        await backend.trackPresence(this.author);
    },
    updated() {
        this.autoScroll();
    }
})
