import { Route, Routes, Link } from 'react-router-dom';
import { QueryEditor } from './components/query-editor';
import { SideCar } from './components/side-car';
import { ResultView } from './components/result-view';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

export function App() {
  return (
    <div className="flex flex-row h-screen">
      <section className="h-screen">
        <SideCar />
      </section>

      <main className="p-4 w-full h-screen">
        <PanelGroup direction="vertical">
          <Panel>
            <QueryEditor />
          </Panel>
          <PanelResizeHandle className='h-1 bg-gray-400' />
          <Panel>
            <ResultView />
          </Panel>
        </PanelGroup>
      </main>
    </div>
  );
}

export default App;
