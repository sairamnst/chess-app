import { Navbar,Footer,Services,Loader,Transactions,Welcome} from "../components";
const Home = ()=> {

  return (
      <div className="min-h-screen">
        <div className="gradient-bg-welcome">
        <Navbar/>
        <Welcome/>
        </div>
        <Services/>
        <Transactions/>
        <Footer/>
      </div>
  );
}

export default Home;
