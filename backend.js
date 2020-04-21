firebase.initializeApp({
    apiKey: "AIzaSyCCMm7YgbtauAz3tx7Qq8gzwbCfLy_Gsjg",
    authDomain: "solo-poke.firebaseapp.com",
    databaseURL: "https://solo-poke.firebaseio.com",
    projectId: "solo-poke",
    storageBucket: "solo-poke.appspot.com",
    messagingSenderId: "583889049222",
    appId: "1:583889049222:web:5b43974b1605558c386307"
});
firebase.auth().useDeviceLanguage();

var backend = {
    async authenticate()
    {
        var provider = new firebase.auth.GoogleAuthProvider();
        try {
            var result = await firebase.auth().signInWithPopup(provider);
            this.me = result.user.uid;
        }
        catch (error) {
            console.log("Running in test mode");
            this.root = "test/"
            this.me = 0;
        }
        finally {
            return this.me;
        }
    },
    async getMessages(count) {
        const data = (await this.messageRef().limitToLast(count).once('value')).val();
        return Object.values(data);
    },
    async getUsers() {
        const data = (await this.userRef().once('value')).val();
        return data;
    },
    trackPresence(uid) {
        var status = this.userRef(uid + '/presence/online');

        this.database.ref('.info/connected').on('value', async function(snapshot) {
            if (snapshot.val() == true) {
                await status.onDisconnect().set(false);
                await status.set(true);
            };
        });
    },
    onUserUpdate(uid, fn) {
        var user = this.userRef(uid);
        user.on('child_changed', fn);
    },
    onNewMessage(fn) {
        var messages = this.messageRef();
        const startKey = messages.push().key;

        messages.orderByKey().startAt(startKey).on('child_added', fn);
    },
    sendMessage(msg) {
        this.messageRef().push().set(msg);
    },
    setMyProp(prop, val) {
        this.userRef(this.me + '/' + prop).set(val);
    },
    userRef(path) {
        return this.database.ref(this.root + "users" + (path ? '/'+path : ""));
    },
    messageRef(path) {
        return this.database.ref(this.root + "messages" + (path ? '/'+path : ""));
    },
    async uploadFile(file) {
        await this.storage.ref("images/").child(file.name).put(file);
    },
    database: firebase.database(),
    storage: firebase.storage(),
    root: "",
    me: null
}

