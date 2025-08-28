import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import App from "./routes/App";
import Home from "./routes/Home";
import Gallery from "./routes/Gallery";
import CountdownPage from "./routes/CountdownPage";
import Quiz from "./routes/Quiz";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "gallery", element: <Gallery /> },
      { path: "countdown", element: <CountdownPage /> },
      { path: "quiz", element: <Quiz /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
