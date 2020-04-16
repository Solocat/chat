var sTextfield = {
    template: `<textarea placeholder="Write here" @input="onInput" rows=1 @keydown.enter.prevent="onEnter" v-focus></textarea>`,
    directives: {
        focus: {
            inserted: function (el) {
                el.focus()
            }
        }
    },
    data() {
        return {
            text: "",
            commands: ["/name ", "/color "]
        }
    },
    methods: {
        rows() {
            if (!this.$el) return 1; //new block on the block
            this.$el.setAttribute("rows", "1");
            var computed = window.getComputedStyle(this.$el);
            var lh = parseInt(computed.getPropertyValue('line-height'));
            var rows = parseInt(this.$el.scrollHeight / lh);
            this.$el.setAttribute("rows", rows);
            return rows;
        },
        onInput(event) {
            this.$emit('input', event.target.value);
            this.rows();
        },
        onEnter(event) {
            var text = event.target.value;
            if (text == "") return;

            var send = true;
            this.commands.forEach((cmd) => {
                if (text.startsWith(cmd)) {
                    var arg = text.replace(cmd, "");
                    cmd = cmd.trim();
                    cmd = cmd.substr(1);

                    this.$emit('user-function', cmd, arg);
                    send = false;
                }
            });

            if (send) this.$emit('send', text);

            event.target.value = "";
            this.$emit('input', '');
            this.$el.setAttribute("rows", 1);
        }
    }
}

var vContent = {
    props: ['text'],
    template: ``,
    methods: {
    }
}
