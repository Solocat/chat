var app = new Vue({
    el: "#chat",
    data: {
        author: "",
        messageGroups: [],
        writeTimeout: null,
        arrowTimeout: null,
        me: {
            name: "",
            presence: {},
            color: null
        },
        friend: {
            name: "",
            presence: {},
            color: null
        },
        showArrowUp: false,
        showArrowDown: false,
    },
    computed: {
        userStyle() {
            return {
                backgroundColor: (g.author == author ? this.me.color : this.friend.color)
            }
        }
    },
    methods: {
        presenceColor(user) {
            var p = user.presence;
            var color;

            if (!p.online) {
                color = "#DDD";
            }
            else if (!p.visible) {
                color = "#FF7";
            }
            else color = "#8bff92";
            return {
                color: color
            }
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
        onUserFunction(cmd, arg) {
            backend.setMyProp(cmd, arg);
        },
        send(value) {
            var msg = {text: value, time: Date.now(), author: this.author};
            this.upload(msg);
        },
        onInput(value) {
            clearTimeout(this.writeTimeout);
            var is = (value.length > 0);
            backend.setMyProp("presence/writing", is);

            if (is) {
                var vm = this;
                function waitInput() {
                    backend.setMyProp("presence/writing", "inactive");
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

                /*if(bottom > 8) {
                    vm.showArrowDown = true;
                }
                else {
                    vm.scrollMessages('end', 'smooth');
                }*/
                vm.showArrowDown = (bottom > 0);
                clearTimeout(this.arrowTimeout);
            }
            this.arrowTimeout = setTimeout(ScrollDelay, 500);
        },
        async upload(msg) {
            try {
                await backend.sendMessage(msg);
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
        's-textfield': sTextfield,
        's-bubble': sBubble
    },
    async created() {
        const vm = this;

        this.author = await backend.authenticate();

        var userdata = await backend.getUsers();
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

        this.$nextTick(function () {
            this.scrollMessages("end", "auto");
        })

        backend.setMyProp("presence/visible", !document.hidden);

        document.addEventListener("visibilitychange", function() {
            backend.setMyProp("presence/visible", !document.hidden);
        }, false);
    }
})
