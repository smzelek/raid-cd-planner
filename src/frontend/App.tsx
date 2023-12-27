import { useEffect, useRef } from 'react';
import Planner from "./pages/Planner";
import {
  createHashRouter,
  RouterProvider,
} from "react-router-dom";
import { PlanDashboard } from './pages/PlanDashboard';
import { QueryClient, QueryClientProvider } from 'react-query';
import './global.scss';
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'ion-icon': any;
    }
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false
    }
  }
});

const router = createHashRouter([
  {
    path: "/",
    element: <PlanDashboard />,
  },
  {
    path: "/planner",
    element: <Planner />,
  },
]);

export default function App() {
  const effectRan = useRef(false);

  useEffect(() => {
    if (!effectRan.current) {
      const scriptTag = document.createElement('script');
      (window as any).whTooltips = { 'colorLinks': true, 'iconizeLinks': true, 'renameLinks': false, 'iconSize': 'small' };
      scriptTag.src = "https://wow.zamimg.com/js/tooltips.js"
      document.head.appendChild(scriptTag)
      effectRan.current = true
    }
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <DndContext
          sensors={sensors}
        >
          <span style={{ display: 'none' }}>
            {/* {process.env.COMMIT_HASH} */}
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
              <RouterProvider router={router} />
            </main>
          </div>
        </DndContext>
      </QueryClientProvider>
    </>
  );
}

