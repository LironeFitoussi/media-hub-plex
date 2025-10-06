import Layout from "./pages/Layout";
import HomePage, {HomePageLoader} from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import DownloadsPage from "./pages/DownloadsPage";

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
      {
        path: "/downloads",
        Component: DownloadsPage,
        name: "Downloads",
      },
    ],
  },
];