import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Workflow from './pages/Workflow';
import Estimations from './pages/Estimations';
import SalesEntry from './pages/SalesEntry';
import PlantComparison from './pages/PlantComparison';
import Scenarios from './pages/Scenarios';
import Analytics from './pages/Analytics';
import MasterData from './pages/MasterData';
import SAPIntegration from './pages/SAPIntegration';
import Governance from './pages/Governance';
import Configuration from './pages/Configuration';
import Architecture from './pages/Architecture';
import DataModel from './pages/DataModel';
import Export from './pages/Export';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/workflow" element={<Workflow />} />
        <Route path="/estimations" element={<Estimations />} />
        <Route path="/estimations/new" element={<SalesEntry />} />
        <Route path="/estimations/:id" element={<SalesEntry />} />
        <Route path="/sales-entry" element={<SalesEntry />} />
        <Route path="/plant-comparison" element={<PlantComparison />} />
        <Route path="/scenarios" element={<Scenarios />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/master" element={<MasterData />} />
        <Route path="/sap" element={<SAPIntegration />} />
        <Route path="/governance" element={<Governance />} />
        <Route path="/config" element={<Configuration />} />
        <Route path="/architecture" element={<Architecture />} />
        <Route path="/data-model" element={<DataModel />} />
        <Route path="/export" element={<Export />} />
      </Routes>
    </Layout>
  );
}
