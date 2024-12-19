
import * as fcl from "@onflow/fcl";
import { getProfile, createProfile } from "@poeternal/client"
import { useEffect, useState } from "react";

fcl.config({
  'app.detail.title': 'poeternal',
  'flow.network': 'testnet',
  'accessNode.api': 'https://rest-testnet.onflow.org',
  'discovery.wallet': `https://fcl-discovery.onflow.org/testnet/authn`,
})

function App() {

  const [user, setUser] = useState({ loggedIn: false });
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false); // State to track if profile is loading
  const [profileName, setProfileName] = useState(''); // State to store profile name input


  const handleCreateProfile = async (event) => {
    event.preventDefault();
    if (!profileName) return;

    try {
      setLoading(true);
      const profileTx = await createProfile({ name: profileName });
      console.log("tx", profileTx)

      //here i need to check that this is ok and await sealed
      //
      /*
      const profileData = await getProfile({ address: user.addr });
      console.log(profileData)
      setProfile(profileData); // Store the profile data
      */
    } catch (error) {
      console.error("Error creating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Subscribe to user changes
    fcl.currentUser.subscribe(setUser);
  }, []); // Empty dependency array to ensure this only runs once on component mount

  useEffect(() => {
    const fetchProfile = async () => {
      if (user.loggedIn && user.addr && !loading) {
        try {
          setLoading(true); // Start loading profile
          const profileData = await getProfile({ address: user.addr });
          console.log(profileData)
          setProfile(profileData); // Store the profile data
        } catch (error) {
          console.error("Error fetching profile:", error);
        } finally {
          setLoading(false); // End loading once the fetch is complete
        }
      }
    };

    // Only fetch profile when the user logs in and the address is available
    if (user.loggedIn && user.addr) {
      fetchProfile();
    }
  }, [user]); // Run thi

  const logIn = () => {
    fcl.authenticate();
  };

  const logOut = () => {
    fcl.unauthenticate();
  };

  return (
    <div className="App">
      <h1>FCL App Quickstart</h1>
      {user.loggedIn ? (
        <div>
          <p>Address: {user.addr}</p>
          <button className="btn" onClick={logOut}>Log Out</button>
          <div>
            {profile ? (
              <div>
                <h2>Profile Information:</h2>
                <pre>{JSON.stringify(profile, null, 2)}</pre>
              </div>
            ) : (
              <div>
                <h2>No Profile Found</h2>
                <p>Create your profile!</p>
                <form onSubmit={handleCreateProfile}>
                  <input
                    type="text"
                    placeholder="Enter profile name"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)} // Update profileName on change
                    required
                  />
                  <button type="submit" className="btn" disabled={loading}>
                    {loading ? "Creating..." : "Create Profile"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      ) : (
        <button className="btn" onClick={logIn}>Log In</button>
      )}
    </div>
  );

}

export default App
