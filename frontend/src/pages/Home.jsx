import { Link } from 'react-router-dom'
import Notes from './home/Notes'

const Home = ({ loggedIn, userName }) => {
  return (
    <div className="main-container">
      <div className="title-container">Welcome!</div>
      <div className="button-container">
        {loggedIn ?
          <>
          <h3>Logged in as {userName}</h3>
          <Link className="input-button" to="/notes">View Notes</Link>
          <Link className="input-button" to="/logout">Logout</Link>
          </>
          :
          <div className="input-container">
            <Link to="/login">
              <button className="input-button">Login</button>
            </Link>
            <Link to="/register">
              <button className="input-button">Register</button>
            </Link>
          </div>
        }
      </div>
    </div>
  )
}

export default Home
