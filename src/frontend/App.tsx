import React from 'react';
import Planner from "./pages/Planner";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Home from './pages/Home';


export const App = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/planner",
      element: <Planner />,
    },
  ]);

  return (
    <>
      <span style={{ display: 'none' }}>
        {process.env.COMMIT_HASH}
      </span>
      <div className='wrapper'>

        <header className='header'>
          <h1 className='app-title-bar'>
            Raid CD Planner
            {/* <div className='app-title-actions'>
              <CopyButton onClick={exportNote}>Export to RT Note</CopyButton>
              <CopyButton onClick={exportToSavedString}>Export to Profile String</CopyButton>
              <button onClick={importFromSavedString}>Import from Profile String</button>
            </div> */}
          </h1>
        </header>
        <main className='main'>
          <RouterProvider router={router} />
        </main>
      </div>
    </>
  );
}

