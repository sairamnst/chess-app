import { Navbar,Footer,Services,Loader,Transactions,Welcome} from "./components";
import Home from "./pages/Home.jsx";
import GamePage from "./pages/GamePage.jsx";
import {BrowserRouter as Router,Routes,Route} from 'react-router-dom'
import UserForm from './components/UserForm'
import {useAuthState} from 'react-firebase-hooks/auth'
import {auth} from '../src/firebase'
import GameSelect from "./pages/GameSelect";

/*const App = ()=> {
  let component
  switch (window.location.pathname) {
  case "/":
    component=<Home/>
    break
  case "/GamePage":
    component=<GamePage/>
    break
  }
  return (*/
      /*<div className="min-h-screen">
        <div className="gradient-bg-welcome">
        <Navbar/>
        <Welcome/>
        </div>
        <Services/>
        <Transactions/>
        <Footer/>
      </div>*/
/*      <div>
        {component}
      </div>
  );
}

export default App;*/

export default function App() {
  const [user,loading,error]=useAuthState(auth)
  if (loading) {
    return 'loading';
  }
  if (error) {
    return 'There was an error'
  }
  if (!user) {
    return <UserForm/>
  }
  return (
    <>
    <Router>
      <Routes>
        <Route exact path="/game-select" element={<GameSelect/>}/>
        <Route path="/game/:id" element={<GamePage/>}/>
        <Route path="/" element={<Home/>}/>
      </Routes>
    </Router>
    </>
  )
}