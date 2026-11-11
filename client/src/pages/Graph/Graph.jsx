import { useState } from 'react';
import BranchesPanel from './sections/BranchesPanel.jsx';
import CommitPanel from './sections/CommitPanel.jsx';
import GraphHeader from './sections/GraphHeader.jsx';
import GraphStage from './sections/GraphStage.jsx';
import GraphToolbar from './sections/GraphToolbar.jsx';
import SprintsPanel from './sections/SprintsPanel.jsx';
import { NODE_STYLES, SPRINTS, VIEWS } from './graphData.js';
import './Graph.css';

const DEFAULT_CAMERA = { view: 'iso', yaw: 324, pitch: 36, zoom: 100 };

export default function Graph() {
  const [theme, setTheme] = useState('graphite');
  const [nodeStyle, setNodeStyle] = useState('commits');
  const [shadows, setShadows] = useState(true);
  const [camera, setCamera] = useState(() => ({ ...DEFAULT_CAMERA }));
  const [selectedBranch, setSelectedBranch] = useState('feature/search');
  const [hiddenBranches, setHiddenBranches] = useState(() => new Set());
  const [selectedSprint, setSelectedSprint] = useState('all');
  const [showFiles, setShowFiles] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const changeView = (viewId) => {
    const preset = VIEWS.find((option) => option.id === viewId);
    setCamera((current) => ({
      ...current,
      view: viewId,
      yaw: preset.yaw,
      pitch: preset.pitch,
    }));
  };

  const changePitch = (delta) => {
    setCamera((current) => ({
      ...current,
      view: 'custom',
      pitch: Math.min(86, Math.max(0, current.pitch + delta)),
    }));
  };

  const changeZoom = (delta) => {
    setCamera((current) => ({
      ...current,
      zoom: Math.min(200, Math.max(25, current.zoom + delta)),
    }));
  };

  const resetCamera = () => {
    setCamera({ ...DEFAULT_CAMERA });
    setRefreshKey((key) => key + 1);
  };

  const refreshScene = () => setRefreshKey((key) => key + 1);

  const toggleBranchVisibility = (name) => {
    setHiddenBranches((current) => {
      const next = new Set(current);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const sprint = SPRINTS.find((item) => item.id === selectedSprint);
  const sprintLabel = sprint ? sprint.label.toLowerCase() : 'все спринты';
  const nodeStyleLabel = NODE_STYLES.find((item) => item.id === nodeStyle).label.toLowerCase();

  return (
    <div className="graph-page" data-theme={theme}>
      <GraphHeader />
      <div className="graph-layout">
        <BranchesPanel
          selectedBranch={selectedBranch}
          hiddenBranches={hiddenBranches}
          onSelectBranch={setSelectedBranch}
          onToggleBranch={toggleBranchVisibility}
        />

        <main className="graph-main">
          <GraphToolbar
            theme={theme}
            onThemeChange={setTheme}
            nodeStyle={nodeStyle}
            onNodeStyleChange={setNodeStyle}
            shadows={shadows}
            onShadowsChange={() => setShadows((value) => !value)}
            view={camera.view}
            onViewChange={changeView}
            yaw={camera.yaw}
            pitch={camera.pitch}
            zoom={camera.zoom}
          />

          <GraphStage
            expanded={expanded}
            refreshKey={refreshKey}
            nodeStyleLabel={nodeStyleLabel}
            sprintLabel={sprintLabel}
            zoom={camera.zoom}
            onReset={resetCamera}
            onRefresh={refreshScene}
            onPitchUp={() => changePitch(6)}
            onPitchDown={() => changePitch(-6)}
            onZoomIn={() => changeZoom(25)}
            onZoomOut={() => changeZoom(-25)}
            onToggleExpanded={() => setExpanded((value) => !value)}
          />

          <SprintsPanel selectedSprint={selectedSprint} onSelectSprint={setSelectedSprint} />
        </main>

        <CommitPanel showFiles={showFiles} onToggleFiles={() => setShowFiles((value) => !value)} />
      </div>
    </div>
  );
}
