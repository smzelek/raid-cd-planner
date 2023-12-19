import React, { useEffect, useRef } from 'react';
import Planner from "./pages/Planner";
import {
  createBrowserRouter,
  createHashRouter,
  RouterProvider,
} from "react-router-dom";
import Home from './pages/Home';
import CreatePlan from './pages/CreatePlan';
import { QueryClient, QueryClientProvider } from 'react-query';
const queryClient = new QueryClient()

export const App = () => {
  const router = createHashRouter([
    {
      path: "/",
      element: <CreatePlan />,
    },
    {
      path: "/planner",
      element: <Planner />,
    },
  ]);
  const effectRan = useRef(false);

  useEffect(() => {
    if (!effectRan.current) {
      const scriptTag = document.createElement('script');
      (window as any).whTooltips = { 'colorLinks': true, 'iconizeLinks': true, 'renameLinks': false, 'iconSize': 'small' };
      scriptTag.src = "https://wow.zamimg.com/js/tooltips.js"
      document.head.appendChild(scriptTag)
      effectRan.current = true
    }
  }, [])

  return (
    <>
      <span style={{ display: 'none' }}>
        {process.env.COMMIT_HASH}
      </span>
      <div className='wrapper'>

        <header className='header'>
          <h1 className='app-title-bar'>
            raidtimers
            {/* <div className='app-title-actions'>
              <CopyButton onClick={exportNote}>Export to RT Note</CopyButton>
              <CopyButton onClick={exportToSavedString}>Export to Profile String</CopyButton>
              <button onClick={importFromSavedString}>Import from Profile String</button>
            </div> */}
          </h1>
        </header>
        <main className='main'>
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
          </QueryClientProvider>
        </main>
      </div>
    </>
  );
}

