import Layout from "./pages/Layout";
import HomePage, {HomePageLoader} from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";

export const routes = [
  {
    path: "/",
    Component: Layout,
    children: [
      {
        index: true,
        Component: HomePage,
        loader: HomePageLoader,
        name: "Home",
      },
      {
        path: "/profile",
        Component: ProfilePage,
        name: "Profile",
      },
    ],
  },
];