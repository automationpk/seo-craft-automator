import React, { createContext, useContext, useState, useEffect } from 'react';

interface ProjectContextType {
  projectId: string | null;
  targetedRegion: string | null;
  setProjectId: (id: string | null) => void;
  setTargetedRegion: (region: string) => void;
  clearProjectData: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [targetedRegion, setTargetedRegionState] = useState<string | null>(null);

  // Load targeted region from localStorage when project changes
  useEffect(() => {
    if (projectId) {
      const stored = localStorage.getItem(`project_${projectId}_targetedRegion`);
      if (stored) {
        setTargetedRegionState(stored);
      }
    }
  }, [projectId]);

  const setTargetedRegion = (region: string) => {
    setTargetedRegionState(region);
    if (projectId) {
      localStorage.setItem(`project_${projectId}_targetedRegion`, region);
    }
  };

  const clearProjectData = () => {
    setProjectId(null);
    setTargetedRegionState(null);
  };

  const value = {
    projectId,
    targetedRegion,
    setProjectId,
    setTargetedRegion,
    clearProjectData,
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};