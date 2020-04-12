var app = new Vue({
    el: "#chat",
    data: {
        currentMSG: "",
        author: "",
        messageGroups: [],
        writeTimeout: {},
        arrowTimeout: {},
        me: {
            name: "",
            writing: false,
            online: false,
            color: null
        },
        friend: {
            name: "",
            writing: false,
            online: false,
            color: null
        },
        showArrowUp: false,
        showArrowDown: false
    },
    computed: {
        userStyle() {
            return {
                backgroundColor: (g.author == author ? this.me.color : this.friend.color)
            }
        }
    },
    methods: {
        goUp() {
            this.scrollToTop();
        },
        goDown() {
            this.scrollToBottom();
        },
        addToGroup(msg) {
            if (this.messageGroups.length == 0) {
                this.messageGroups.push({ author: msg.author, time: msg.time, messages : [] });
            }
            var group = this.messageGroups[this.messageGroups.length-1];

            var lastTime = (group.messages.length > 0) ?
                group.messages[group.messages.length-1].time :
                group.time;

            if (group.author != msg.author || msg.time >= lastTime + 60*1000) {
                this.messageGroups.push({ author: msg.author, time: msg.time, messages : [] });
                group = this.messageGroups[this.messageGroups.length-1];
            }
            group.messages.push(msg);
        },
        clearField() {
            this.currentMSG = "";
            this.onInput();
        },
        onUserFunction(cmd, arg) {
            if (cmd == "/name ") {
                backend.database.ref('users/' + this.author + '/name').set(arg);
            }
            else if (cmd == "/color ") {
                backend.database.ref('users/' + this.author + '/color').set(arg);
            }
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
                    backend.database.ref('users/' + vm.author + '/writing').set("inactive");
                    clearTimeout(this.writeTimeout);
                }
                this.writeTimeout = setTimeout(waitInput, 1000);
            }
        },
        onScroll(event) {
            clearTimeout(this.arrowTimeout);
            var block = document.getElementById("messages");
            this.showArrowUp = (block.scrollTop != 0);
            this.showArrowDown = false;

            var vm = this;

            function ScrollDelay() {
                var bottom = block.scrollHeight - block.scrollTop - block.clientHeight;
                vm.showArrowDown = (bottom != 0);
                clearTimeout(this.arrowTimeout);
            }
            this.arrowTimeout = setTimeout(ScrollDelay, 500);
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
        scrollMessages(dir, smooth) {
            var container = document.getElementById("messages");
            var child = (dir == "start") ? container.firstChild : container.lastChild;
            child.scrollIntoView({ behavior: smooth, block: dir });
        }
    },
    components: {
        'v-text': vText
    },
    directives: {
        'scroll-jack': {
            inserted: function (el) {
                el.scrollIntoView({ behavior: 'smooth'});
            }
        }
    },
    async mounted() {
        const vm = this;

        this.author = await backend.authenticate();

        var userdata = await backend.getUsers();
        var keys = Object.keys(userdata);

        if (this.author == null) {
            this.author = keys[1];
        }
        this.me = userdata[this.author];

        var friendid = this.me.friend;
        this.friend = userdata[friendid];

        backend.onUserUpdate(this.author, function(data) {
            vm.me[data.key] = data.val();
        });
        backend.onUserUpdate(friendid, function(data) {
            vm.friend[data.key] = data.val();
        });
        backend.trackPresence(this.author);

        (await backend.getMessages(40)).forEach(msg => {
            this.addToGroup(msg);
        });
        backend.onNewMessage(function(data) {
            vm.addToGroup(data.val());
            document.getElementById("fwib").play();
        });

        Vue.nextTick(function () {
            vm.scrollMessages("end", "auto");
        })
    }
})
