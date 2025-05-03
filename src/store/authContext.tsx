// //https://medium.com/@sajadshafi/implementing-firebase-auth-in-react-js-typescript-vite-js-88465ac84170

// import { firebaseAuth } from '../firebase/firebaseConfig';
// import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import { User } from 'firebase/auth'; //type User import
// import { LoginFormValues, UserFormValues } from '../interfaces';
// import  { firebaseSignUp, firebaseSignIn, firebaseSignOut }  from '../firebase/firebaseAuth';
// import { onAuthStateChanged } from 'firebase/auth';



// //IAuth context
// export  interface  IAuth {
// user:  User  |  null;  //type User comes from firebase
// loading:  boolean;
// signIn: (creds:  LoginFormValues) =>  void;
// signUp: (creds:  UserFormValues) =>  void;
// signOut: () =>  void;
// }

// export const Context = React.createContext<IAuth>({
//     user: firebaseAuth.currentUser,
//     loading: false,
//     signIn: () => {},
//     signUp: () => {},
//     signOut: () => {},
// });

// const  AuthProvider  = ({ children }:  {children: React.ReactNode}) => {

//  const [currentUser,  setCurrentUser] =  React.useState<User  |  null>(null);
//  const [isLoading,  setIsLoading] =  React.useState<boolean>(false);
//  const [isAuthLoading,  setIsAuthLoading] =  React.useState<boolean>(true);
//  const  navigate  =  useNavigate();

//  //Sign up
//  const signUp = (creds:  UserFormValues) => {
//     setIsLoading(true);
//     firebaseSignUp(creds)
//       .then(async signUpResult => {
//          const { user } = signUpResult; //object destructuring
//          if (user){
//              setCurrentUser(user);
//            //redirect the user on the targeted route
//             navigate('/dashboard', { replace:  true });
//          }else{

//          }
//          setIsLoading(false);
//       })
//       .catch(error  => {
//        //check for error
//        if (error.code  ===  'auth/email-already-in-use') {
//           //show an alert or console
//        } else if (error.code  ===  'auth/too-many-requests') {
//           //do something like an alert
//        }
//        // you can check for more error like email not valid or something
//        setIsLoading(false);
//       });
//  }

//  //Sign in
//  const  signIn = async (creds:  LoginFormValues) => {
//     setIsLoading(true);
//     firebaseSignIn(creds)
//         .then(signInResult  => {
//         const { user } =  signInResult;
//         if  (user) {
//             setCurrentUser(user);
//             //redirect user to targeted route
//             navigate('/dashboard', { replace:  true });
//         } 
//         else { 
//             //do something 
//         }
//         setIsLoading(false);
//     })
//     .catch(error  => {
//         if  (error.code  ===  'auth/wrong-password') {
//         //show error
//         } else  if  (error.code  ===  'auth/too-many-requests') {
//         //show error
//         }
//         setIsLoading(false);
//     });
   
//  }

//  //Sign out
//  const signOut = async () => {
//     setIsLoading(true);
//     try {
//      await firebaseSignOut();
//      setCurrentUser(null);
//      navigate('/signin', { replace:  true });
//     } catch  (error) {
//      setIsLoading(false);
//      //show error alert
//     }
   
//  }
//  //create Auth Values
//  const authValues: IAuth = {
//   user: currentUser,
//   loading: isLoading,
//   signIn,
//   signUp,
//   signOut,
//  }

//  React.useEffect(() => {
//   //onAuthStateChanged check if the user is still logged in or not
//   const  unsubscribe  =  onAuthStateChanged(firebaseAuth,  user  => {
//    setCurrentUser(user);
//    setIsAuthLoading(false);
//   });
//   return  unsubscribe;
//  },  []);

//  //If loading for the first time when visiting the page

//  return (
//     <Context.Provider value={authValues}>
//        {children}
//     </Context.Provider>
//  );
// };

// export default AuthProvider;

