var remind_sound = document.querySelector('#sound');

function copy(obj) {
    return Object.assign({}, obj);
}

new Vue({
    el: '#main',
    data: {
        list: [],
        current: {},
        last_id: 0,
    },
    mounted: function () {
        var me = this;
        this.list = ms.get('list') || this.list;
        this.last_id = ms.get('last_id') || this.last_id; //只在增加时变化

        setInterval(function () {
            me.check_remind();
        }, 1000);
    },
    methods: {
        //检查提醒时间
        check_remind: function () {
            var me = this;
            this.list.forEach(function (item, i) {
                var remind_time = item.remind_time;
                if (!remind_time || item.remind_confirmed) return;

                var remind_time = (new Date(remind_time)).getTime();
                var now = (new Date()).getTime();

                if (now >= remind_time) {
                    remind_sound.play();
                    var confirmed = confirm(item.title);
                    Vue.set(me.list[i], 'remind_confirmed', confirmed);
                }
            });
        },

        //添加或更新
        addOrUpdate: function () {
            var is_update, id;
            is_update = id = this.current.id;

            if (is_update) {
                var index = this.find_index(id);

                Vue.set(this.list, index, this.current);

                //console.log(index);
                //console.log(this.list);

            } else {
                var title = this.current.title;
                if (!title) return;

                var todo = copy(this.current);
                this.last_id++;
                ms.set('last_id', this.last_id);
                todo.id = this.last_id;
                
                this.list.push(todo);
            }

            this.reset_current();
            //console.log('this.current', this.current);
            //console.log('this.list', this.list);
        },

        //删除事项
        remove: function (id) {
            var index = this.find_index(id);
            this.list.splice(index, 1);
        },

        //生成ID
        next_id: function () {
            return this.list.length + 1;
        },

        //更新项
        set_current: function (todo) {
            this.current = copy(todo);
        },

        //清空当前输入项
        reset_current: function () {
            this.set_current({});
        },

        //根据ID找到索引项
        find_index: function (id) {
            return this.list.findIndex(function (item) {
                return item.id == id;
            })
        },

        //是否完成
        toggle_complete: function (id) {
            var index = this.find_index(id);
            Vue.set(this.list[index], 'completed', !this.list[index].completed);
        },

        //查看详情
        toggle_detail: function (id) {
            var index = this.find_index(id);
            Vue.set(this.list[index], 'show_detail', !this.list[index].show_detail);
        },
    },

    //对接localstorage
    watch: {
        list: {
            deep: true,
            handler: function (new_val, old_val) {
                if (new_val) {
                    ms.set('list', new_val);
                } else {
                    ms.set('list', []);
                }
            }
        }
    },
})