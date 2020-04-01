var vText = {
    props: ['value'],
    template: `<textarea placeholder="Write here" @input="onInput" rows=1 @keydown.enter.prevent="onEnter" :value="value"></textarea>`,
    directives: {
        focus: {
            inserted: function (el) {
                el.focus()
            }
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
            if (this.value == "") return;
            this.$emit('send');
            this.$el.setAttribute("rows", 1);
        }
    }
}