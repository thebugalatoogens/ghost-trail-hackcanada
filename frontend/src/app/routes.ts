import { createBrowserRouter } from "react-router";
import { HomePage } from "./components/HomePage";
import { AnalysisPage } from "./components/AnalysisPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: HomePage,
  },
  {
    path: "/analysis",
    Component: AnalysisPage,
  },
]);
