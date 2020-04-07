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
            console.log(error);
            return null;
        }
    },
    async getMessages() {
        const data = (await this.database.ref('messages').once('value')).val();
        return Object.values(data);
    },
    async getUsers() {
        const data = (await this.database.ref('users').once('value')).val();
        return data;
    },
    trackPresence(uid) {
        var status = backend.database.ref('users/' + uid + '/online');

        firebase.database().ref('.info/connected').on('value', function(snapshot) {
            if (snapshot.val() == false) {
                return;
            };

            // If we are currently connected, then use the 'onDisconnect()' 
            // method to add a set which will only trigger once this 
            // client has disconnected by closing the app, 
            // losing internet, or any other means.
           status.onDisconnect().set(false).then(function() {
                // The promise returned from .onDisconnect().set() will
                // resolve as soon as the server acknowledges the onDisconnect() 
                // request, NOT once we've actually disconnected:
                // https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect
        
                // We can now safely set ourselves as 'online' knowing that the
                // server will mark us as offline once we lose connection.
                status.set(true);
            });
        });
    },
    database: firebase.database()
}

