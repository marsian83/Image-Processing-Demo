import {
  createBrowserRouter,
  createRoutesFromElements,
  Outlet,
  Route,
  RouterProvider,
} from "react-router-dom";
import Footer from "./common/Footer";
import Navbar from "./common/Navbar";
import HomePage from "./pages/HomePage/HomePage";
import { GlobalContextProvider } from "./contexts/globalContext";
import SaltPepperPage from "./pages/SaltPepperPage/SaltPepperPage";

export default function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Root />}>
        <Route index element={<HomePage />} />
        <Route path="/salt-pepper" element={<SaltPepperPage />} />
      </Route>
    )
  );

  return (
    <GlobalContextProvider>
      <RouterProvider router={router} />
    </GlobalContextProvider>
  );
}

function Root() {
  return (
    <main className="relative">
      <Navbar />
      <Outlet />
      <Footer />
    </main>
  );
}
