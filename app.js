var app = new Vue({
    el: "#chat",
    data: {
        currentMSG: "",
        messages: [],
        author: "",
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
    methods: {
        getGroups() {
            if (this.messages.length == 0) return null;

            var groups = [];
            groups.push({ author: this.messages[0].author, messages : [] });
            var group = groups[groups.length-1];

            var lastTime = this.messages[0].time;
            this.messages.forEach(msg => {
                if (group.author != msg.author || msg.time >= lastTime + 3*60*1000) {
                    groups.push({ author: msg.author, messages : [] });
                    group = groups[groups.length-1];
                }
                group.messages.push(msg);
                lastTime = msg.time;
            });
            return groups;
        },
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
            msg.status = "pending";
            //this.messages.push(msg);
            this.clearField();
        },
        onInput() {
            var is = (this.currentMSG.length > 0);
            backend.database.ref('users/' + this.author + '/writing').set(is);
        },
        formattedTime(time) {
            var date = new Date(time);
            return date.getHours() + "." + date.getMinutes() + "." + date.getSeconds();
        },
        async upload(msg) {
            try {
                await backend.database.ref('messages').push().set(msg);
                //this.messages[this.messages.length-1].status = "sent";
            }
            catch(error) {
                console.error(error)
                //this.messages[this.messages.length-1].status = "error";
            }
        },
        autoScroll() {
            var objDiv = document.getElementById("messages");
            //objDiv.scrollTop = objDiv.scrollHeight;

            //objDiv.scrollIntoView({ behavior: 'smooth', block: 'end' });

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
        //var values = Object.values(userdata);

        //this.author = keys[1];
        backend.database.ref('users/' + this.author + '/online').set(true);

        var friendid;
        keys.forEach(key => {
            if (key != this.author) {
                friendid = key;
            }
        });

        this.friend.name = userdata[friendid].name;
        this.me.name = userdata[this.author].name;

        var users = backend.database.ref('users');
        var me = backend.database.ref('users/' + this.author);
        var friend = backend.database.ref('users/' + friendid);

        friend.on('child_changed', function(data) {
            vm.friend[data.key] = data.val();
        });
        me.on('child_changed', function(data) {
            vm.me[data.key] = data.val();
        });

        var messages = backend.database.ref('messages').limitToLast(10);
        messages.on('child_added', function(data) {
            vm.messages.push(data.val());
        });

    },
    updated() {
        this.autoScroll();
    }
})
