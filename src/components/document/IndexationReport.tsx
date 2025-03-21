
import { useState } from "react";
import { useIndexationReport } from "./hooks/useIndexationReport";
import { useEmbeddingsUpdate } from "../knowledge-base/search/hooks/useEmbeddingsUpdate";
import IndexationReportHeader from "./report/IndexationReportHeader";
import IndexationReportTabs from "./report/IndexationReportTabs";
import { exportLogsToFile } from "./report/utils/logUtils";
import SynchronizationPanel from "./report/SynchronizationPanel";

const IndexationReport = () => {
  const [activeTab, setActiveTab] = useState<string>("report");
  const { 
    report, 
    isLoading, 
    error, 
    logs, 
    generateReport, 
    clearLogs 
  } = useIndexationReport();
  
  const { 
    isUpdating: isUpdatingEmbeddings,
    updateDocumentEmbeddings
  } = useEmbeddingsUpdate();

  const handleExportLogs = () => {
    exportLogsToFile(logs);
  };

  return (
    <div className="space-y-6">
      <IndexationReportHeader 
        onGenerateReport={generateReport}
        onUpdateEmbeddings={updateDocumentEmbeddings}
        isLoading={isLoading}
        isUpdatingEmbeddings={isUpdatingEmbeddings}
        reportExists={!!report}
      />

      {/* Panneau de synchronisation pour résoudre les problèmes d'indexation */}
      <SynchronizationPanel onComplete={generateReport} />

      <IndexationReportTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        report={report}
        logs={logs}
        generateReport={generateReport}
        isLoading={isLoading}
        error={error}
        clearLogs={clearLogs}
        exportLogsToFile={handleExportLogs}
      />
    </div>
  );
};

export default IndexationReport;
