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

      <main className="w-full h-screen">
        <PanelGroup direction="vertical">
          <Panel defaultSize={70} minSize={10}>
            <QueryEditor />
          </Panel>
          <PanelResizeHandle className='h-1 bg-gray-300 hover:bg-gray-500' />
          <Panel defaultSize={30} minSize={20}>
            <ResultView />
          </Panel>
        </PanelGroup>
      </main>
    </div>
  );
}

export default App;
