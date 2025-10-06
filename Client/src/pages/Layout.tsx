import { Outlet } from "react-router";
import Header from "../components/Organism/Header";
import Footer from "../components/Organism/Footer";

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 pt-12 pb-24">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
