import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Profile = () => {
  const [user, setUser] = useState({});
  const [bio, setBio] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await axios.get('http://localhost:4000/api/user/profile');
      setUser(data.user);
      setBio(data.user.bio || '');
    };
    fetchUser();
  }, []);

  const handleBioChange = async (e) => {
    e.preventDefault();
    await axios.put('http://localhost:4000/api/user/profile', { bio });
    setUser({ ...user, bio });
  };

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.bio}</p>
      <form onSubmit={handleBioChange}>
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} />
        <button type="submit">Update Bio</button>
      </form>
    </div>
  );
};

export default Profile;
