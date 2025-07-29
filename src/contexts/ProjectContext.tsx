import React, { createContext, useContext, useState, useEffect } from 'react';

interface ProjectContextType {
  projectId: string | null;
  targetedRegion: string | null;
  businessModel: string | null;
  businessType: string | null;
  websiteName: string | null;
  setProjectId: (id: string | null) => void;
  setTargetedRegion: (region: string) => void;
  setBusinessModel: (model: string) => void;
  setBusinessType: (type: string) => void;
  setWebsiteName: (name: string) => void;
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
  const [businessModel, setBusinessModelState] = useState<string | null>(null);
  const [businessType, setBusinessTypeState] = useState<string | null>(null);
  const [websiteName, setWebsiteNameState] = useState<string | null>(null);

  // Load project data from localStorage when project changes
  useEffect(() => {
    if (projectId) {
      const storedRegion = localStorage.getItem(`project_${projectId}_targetedRegion`);
      const storedModel = localStorage.getItem(`project_${projectId}_businessModel`);
      const storedType = localStorage.getItem(`project_${projectId}_businessType`);
      const storedName = localStorage.getItem(`project_${projectId}_websiteName`);
      
      if (storedRegion) setTargetedRegionState(storedRegion);
      if (storedModel) setBusinessModelState(storedModel);
      if (storedType) setBusinessTypeState(storedType);
      if (storedName) setWebsiteNameState(storedName);
    }
  }, [projectId]);

  const setTargetedRegion = (region: string) => {
    setTargetedRegionState(region);
    if (projectId) {
      localStorage.setItem(`project_${projectId}_targetedRegion`, region);
    }
  };

  const setBusinessModel = (model: string) => {
    setBusinessModelState(model);
    if (projectId) {
      localStorage.setItem(`project_${projectId}_businessModel`, model);
    }
  };

  const setBusinessType = (type: string) => {
    setBusinessTypeState(type);
    if (projectId) {
      localStorage.setItem(`project_${projectId}_businessType`, type);
    }
  };

  const setWebsiteName = (name: string) => {
    setWebsiteNameState(name);
    if (projectId) {
      localStorage.setItem(`project_${projectId}_websiteName`, name);
    }
  };

  const clearProjectData = () => {
    setProjectId(null);
    setTargetedRegionState(null);
    setBusinessModelState(null);
    setBusinessTypeState(null);
    setWebsiteNameState(null);
  };

  const value = {
    projectId,
    targetedRegion,
    businessModel,
    businessType,
    websiteName,
    setProjectId,
    setTargetedRegion,
    setBusinessModel,
    setBusinessType,
    setWebsiteName,
    clearProjectData,
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};