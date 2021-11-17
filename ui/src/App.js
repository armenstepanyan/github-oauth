import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const GITHUB_CLIENT_ID = "15e3e7fac4fc4116da48";
const gitHubRedirectURL = "http://localhost:4000/api/auth/github";
const path = "/";


function App() {
  const [user, setUser] = useState();

  useEffect(() => {
    const token = window.location.search.split('token=')[1];
    console.log(token);
    if (token) {
      localStorage.setItem("token", token);
      window.location.href = 'http://localhost:3000';
      return;
    }

    (async function () {
      const data = await axios
        .get(`http://localhost:4000/api/me`, {
          withCredentials: true,
          headers: {           
            'Content-Type': 'application/json',
            authorization: `Bearer ${localStorage.getItem('token')}`,
            
          }
        })
        .then((res) => res.data).catch(e => console.log(e));

        if (data && data.success) {
          setUser(data.user);
        }
      
    })();
  }, []);

  const logout = () => {
   localStorage.removeItem('token');
   window.location.reload();
   /*
    (async function () {
      const data = await axios
        .post(`http://localhost:4000/api/logout`, {
          withCredentials: true,
        })
        .then((res) => res.data);

      
      
    })();
    */
  }

  const getData = () => {
    (async function () {
      const data = await axios
        .get(`http://localhost:4000/api/protected`, {
          withCredentials: true,
          headers: {           
            'Content-Type': 'application/json',
            authorization: `Bearer ${localStorage.getItem('token')}`,
            
          }
        })
        .then((res) => res.data);

        
      
    })();
  }

  return (
    <div className="App">
      {!user ? (
        <a
          href={`https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${gitHubRedirectURL}?path=${path}&scope=user:email`}
        >
          LOGIN WITH GITHUB
        </a>
      ) : (
        <>
        <h1>Welcome {user.login}</h1>
        <p><button onClick={logout}>logout</button></p>
        <p><button onClick={getData}>getData</button></p>
        </>
      )}
    </div>
  );
}

export default App;
