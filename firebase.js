import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from "firebase/auth";

// 1. Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAECOmsUEXlgjS-9zGfV7RgD0P33PE84XY",
  authDomain: "studyflow-2737d.firebaseapp.com",
  projectId: "studyflow-2737d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// 2. Signup Function
export const signup = async (email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        throw error.message;
    }
};

// 3. Login Function
export const login = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        throw error.message;
    }
};

// 4. Logout Function
export const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Logout failed", error);
    }
};

// 5. Session Observer (Get Current User)
// Firebase handles session persistence automatically via IndexedDB in the browser.
export const observeAuthState = (callback) => {
    return onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in
            callback(user);
        } else {
            // User is signed out
            callback(null);
        }
    });
};

// 6. Get Current User (One-time check)
export const getCurrentUser = () => {
    return auth.currentUser;
};
