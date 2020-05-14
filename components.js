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

var sFormatted = {
    props: ['text'],
    render: function (h) {
        var el = this;
        if (this.text.indexOf("http") < 0) {
            return h('p', this.text);
        }
        var children = []

        var res = this.text;
        var pieces = res.split(" ");
        for (const p of pieces) {
            if (p.startsWith("http")) {

                if (this.isImage(p)) {
                    children.push(h("img", {
                        attrs: {
                            src: p,
                        },
                        on: {
                            load: function () {
                                el.$emit('img-loaded')
                            }
                        },
                    }));
                }
                else {
                    children.push(h("a", {
                        domProps: {
                            innerHTML: this.shortLink(p)
                        },
                        attrs: {
                            href: p,
                            target: "_blank"
                        },
                    }));
                }
            }
            else if (p != " ") {
                children.push(p);
            }
            children.push(" "); //readd spaces
        }
        children.pop(); //trim last space

        return h('p', children);
    },
    methods: {
        isImage(link) {
            const l = link.split('?')[0].toLowerCase();
            const formats = [".jpg", ".jpeg", ".png", ".gif", ".svg", ".bmp"];

            return formats.some(function(f) {
                return l.endsWith(f)
            });
        },
        shortLink(link) {
            var s = link.split("://")[1];
            s.replace("www.", "");
            return s;
        }
    }
}

var sBubble = {
    props: ["group", "mine", "color"],
    template:  `<li class="bubble flex-column" :class="{right: !mine}" :style="{backgroundColor: color}">
                <header class="time">{{ group.time | timeFormat }}</header>
                <s-formatted v-for="(m, i) in group.messages" :key="i" v-scroll-jack :text="m.text" @img-loaded="$emit('img-loaded')"></s-formatted>
            </li>`,
    components: {
        's-formatted' : sFormatted
    },
    filters: {
        timeFormat(time) {
            var date = new Date(time);
            var today = new Date();

            if (date.getDate == today.getDate) {
                return date.toLocaleTimeString();
            }
            else return date.toLocaleString();
        }
    },
    directives: {
        'scroll-jack': {
            inserted: function (el) {
                el.scrollIntoView({ behavior: 'smooth'});
            }
        }
    },
}