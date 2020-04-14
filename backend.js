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
    authenticate: async function()
    {
        var provider = new firebase.auth.GoogleAuthProvider();
        try {
            var result = await firebase.auth().signInWithPopup(provider);
            return result.user.uid;
        }
        catch (error) {
            console.warn(error);
            return null;
        }
    },
    async getMessages(count) {
        const data = (await this.database.ref('messages').limitToLast(count).once('value')).val();
        return Object.values(data);
    },
    async getUsers() {
        const data = (await this.database.ref('users').once('value')).val();
        return data;
    },
    trackPresence(uid) {
        var status = this.database.ref('users/' + uid + '/presence/online');

        this.database.ref('.info/connected').on('value', async function(snapshot) {
            if (snapshot.val() == true) {
                await status.onDisconnect().set(false);
                await status.set(true);
            };
        });
    },
    onUserUpdate(uid, fn) {
        var user = this.database.ref('users/' + uid);
        user.on('child_changed', fn);
    },
    onNewMessage(fn) {
        var messages = this.database.ref('messages')
        const startKey = messages.push().key;

        messages.orderByKey().startAt(startKey).on('child_added', fn);
    },
    database: firebase.database()
}

