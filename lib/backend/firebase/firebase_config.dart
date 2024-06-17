import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';

Future initFirebase() async {
  if (kIsWeb) {
    await Firebase.initializeApp(
        options: const FirebaseOptions(
            apiKey: "AIzaSyAYUCoQ93LMgNuhEr_kbaOS0Si1uCY-gAY",
            authDomain: "copy-paste-app-fxtvnu.firebaseapp.com",
            projectId: "copy-paste-app-fxtvnu",
            storageBucket: "copy-paste-app-fxtvnu.appspot.com",
            messagingSenderId: "46784719953",
            appId: "1:46784719953:web:99f6435e291392bbfedc70"));
  } else {
    await Firebase.initializeApp();
  }
}
