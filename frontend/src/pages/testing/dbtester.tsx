import React from 'react';
import { AuthContext } from '../../firebase/firebaseAuth';

export default function DbTester() {
    const [value, setValue] = React.useState<any[] | string>([]);
    const [settingValue, setSettingValue] = React.useState<string>('');
    const { user, loading } = React.useContext(AuthContext);

    React.useEffect(() => {
        if(!loading){
            fetch('http://localhost:5001/api/users', {
                method: 'GET',
                headers:{
                    'Authorization': 'Bearer ' + user?.stsTokenManager.accessToken,
                }
            }).then(response => {
                if (!response.ok) {
                     setValue('Network response was not ok: ' + response.statusText);
                }
                return response.json();
            }).then(data => {
                console.log(data);
                setValue(data); // Assuming the response is an array of users
            }
            ).catch(error =>{
                // alert('There has been a problem with your fetch operation:', error);
                setValue("Error fetching data: " + error.message);
            })
        }
    }, [user, loading]);

    const makeUser = () => {
        // alert(user.displayName);
        fetch('http://localhost:5001/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization':'Bearer ' + user?.stsTokenManager.accessToken,
            },
            body: JSON.stringify({
                username:user.displayName,
                email: user.email,
                id: user.uid,
            }),
        }).then(response => {
            if (!response.ok) {
                setSettingValue('Network response was not ok: ' + response.statusText);
            }
            return response.json();
        }).catch(error => {
            setSettingValue("Error creating user: " + error.message);
        });
    }

    return (
        <div className='text-black bg-white w-full h-screen'>
            <h1>Simple Testing Page</h1>
            <p>Value: {typeof value == 'object'?  value.map((entry, index)=>{
                return (
                    <div className='ml-2 mb-2' key={index}>
                        <span className='font-bold'>Name:</span> {entry.username} <br />
                        <span className='font-bold'>Email:</span> {entry.email} <br />
                        <span className='font-bold'>ID:</span> {entry.id} <br />
                        <span className='font-bold'>Score:</span> {entry.score} <br />
                        {/* <span className='font-bold'>Updated At:</span> {entry.updatedAt} <br /> */}
                    </div>
                )
            }) : value }</p>
            <button onClick={makeUser}>set new user</button>
            <p>Setting Value: {settingValue}</p>
        </div>
    );
}